const foodModel = require("../models/foodModel");
const User = require("../models/userModel");
const { runYOLO } = require("../ai/yoloService");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

/* =========================
   USDA CONFIG
========================= */

const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL =
  "https://api.nal.usda.gov/fdc/v1/foods/search";

/* =========================
   SAFETY CHECK
========================= */

const buildSafetyCheck = (user, ingredients = []) => {
  const allergies =
    user?.healthProfile?.allergies?.length
      ? user.healthProfile.allergies
      : user?.allergies || [];

  const lowerAllergies = allergies.map((a) =>
    String(a).toLowerCase()
  );

  const matched = [];

  ingredients.forEach((ing) => {
    const lowerIng = String(ing).toLowerCase();

    lowerAllergies.forEach((allergy) => {
      if (lowerIng.includes(allergy)) {
        matched.push(allergy);
      }
    });
  });

  const uniqueMatched = [...new Set(matched)];

  return {
    isSafe: uniqueMatched.length === 0,
    allergensMatched: uniqueMatched,
    warnings:
      uniqueMatched.length > 0
        ? [`Contains: ${uniqueMatched.join(", ")}`]
        : [],
  };
};

/* =========================
   CLEAN FOOD QUERY
========================= */

const cleanQuery = (name) =>
  `${String(name).toLowerCase().trim()} raw`;

/* =========================
   USDA NUTRITION FETCH
========================= */

const fetchNutrition = async (foodName) => {
  try {
    const query = cleanQuery(foodName);

    const res = await axios.get(USDA_BASE_URL, {
      params: {
        api_key: USDA_API_KEY,
        query,
        pageSize: 5,
      },
    });

    const food = res.data?.foods?.[0];
    if (!food) return null;

    const nutrients = food.foodNutrients || [];

    const get = (id) =>
      nutrients.find(
        (n) =>
          Number(n.nutrientId) === Number(id) ||
          Number(n.nutrient?.id) === Number(id)
      );

    return {
      caloriesKcal: get(1008)?.value || 0,
      proteinG: get(1003)?.value || 0,
      carbsG: get(1005)?.value || 0,
      fatG: get(1004)?.value || 0,
      sugarG: get(2000)?.value || 0,
    };
  } catch (err) {
    console.log("USDA ERROR:", err.message);
    return null;
  }
};

/* =========================
   SCAN FOOD (YOLO + USDA)
========================= */

exports.scanFood = async (req, res) => {
  let uploadedFilePath;

  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    uploadedFilePath = path.resolve(req.file.path);

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    /* =========================
       YOLO DETECTION
    ========================= */

    const aiResult = await runYOLO(uploadedFilePath).catch(() => null);

    console.log("🔥 YOLO RAW OUTPUT:", aiResult);

    const detections = Array.isArray(aiResult)
      ? aiResult
      : aiResult?.detections ||
        aiResult?.results ||
        aiResult?.predictions ||
        [];

    console.log("🎯 PARSED DETECTIONS:", detections);

    if (!detections.length) {
      return res.status(200).json({
        success: false,
        message: "No foods detected",
        detectedFoods: [],
      });
    }

    /* =========================
       UNIQUE INGREDIENTS
    ========================= */

    const ingredients = [
      ...new Set(detections.map((d) => d.name).filter(Boolean)),
    ];

    /* =========================
       BUILD RESPONSE
    ========================= */

    const detectedFoods = await Promise.all(
      ingredients.map(async (food, index) => {
        const match = detections.find((d) => d.name === food);
        const nutrition = await fetchNutrition(food);

        return {
          id: index + 1,
          name: food,
          confidence: match?.confidence
            ? Number((match.confidence * 100).toFixed(1))
            : 0,

          nutrition: nutrition || {
            caloriesKcal: null,
            proteinG: null,
            carbsG: null,
            fatG: null,
            sugarG: null,
            error: "No USDA match found",
          },

          vitamins: [],
          minerals: [],
          insights: {},
          safetyCheck: buildSafetyCheck(user, [food]),
        };
      })
    );

    return res.status(200).json({
      success: true,
      detectedFoods,
      annotatedImage: aiResult?.annotatedImage
        ? `data:image/jpeg;base64,${aiResult.annotatedImage}`
        : null,
    });

  } catch (error) {
    console.error("SCAN ERROR:", error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });

  } finally {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  }
};

/* =========================
   SAVE MEAL
========================= */

exports.saveMeal = async (req, res) => {
  try {
    const { selectedFoods, totals, annotatedImage } = req.body;

    if (!Array.isArray(selectedFoods) || !selectedFoods.length) {
      return res.status(400).json({ message: "No foods selected" });
    }

    const meal = await foodModel.create({
      user: req.user.id,
      recognition: {
        name: "Custom Meal",
        confidence: 100,
        provider: "frontend",
        annotatedImage,
      },
      ingredients: selectedFoods.map((f) => f.name),
      nutrition: totals,
      selectedFoods,
      eatenAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      meal,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to save meal",
      error: error.message,
    });
  }
};

/* =========================
   HISTORY
========================= */

exports.getHistory = async (req, res) => {
  try {
    const { filter = "all" } = req.query;

    const now = new Date();
    let startDate = null;

    if (filter === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }

    if (filter === "week") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    }

    if (filter === "month") {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    }

    const query = { user: req.user.id };

    if (startDate) {
      query.eatenAt = { $gte: startDate };
    }

    const items = await foodModel
      .find(query)
      .sort({ createdAt: -1 });

    res.json(items);
  } catch {
    res.status(500).json({ message: "Error fetching history" });
  }
};

/* =========================
   SINGLE ITEM
========================= */

exports.getHistoryItem = async (req, res) => {
  try {
    const item = await foodModel.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item)
      return res.status(404).json({ message: "Not found" });

    res.json(item);
  } catch {
    res.status(500).json({ message: "Error" });
  }
};
 
/* =========================
   TODAY SUMMARY
========================= */
const buildUserGoals = (user) => {
  // fallback defaults (important safety layer)
  const baseGoals = {
    caloriesKcal: 2000,
    proteinG: 120,
    carbsG: 220,
    fatG: 70,
    sugarG: 50,
  };

  if (!user) return baseGoals;

  // If you already store user profile targets → use them
  const profile = user.healthProfile || {};

  return {
    caloriesKcal: profile.caloriesGoal || baseGoals.caloriesKcal,
    proteinG: profile.proteinGoal || baseGoals.proteinG,
    carbsG: profile.carbsGoal || baseGoals.carbsG,
    fatG: profile.fatGoal || baseGoals.fatG,
    sugarG: profile.sugarGoal ?? baseGoals.sugarG,
  };
}; 
exports.getTodaySummary = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const user = await User.findById(req.user.id);

    const entries = await foodModel.find({
      user: req.user.id,
      eatenAt: { $gte: start },
    });

    const totals = entries.reduce(
      (acc, item) => {
        acc.caloriesKcal += item.nutrition?.caloriesKcal || 0;
        acc.proteinG += item.nutrition?.proteinG || 0;
        acc.carbsG += item.nutrition?.carbsG || 0;
        acc.fatG += item.nutrition?.fatG || 0;
        acc.sugarG += item.nutrition?.sugarG || 0;
        return acc;
      },
      {
        caloriesKcal: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        sugarG: 0,
      }
    );

    const goals = buildUserGoals(user);

    return res.json({
      totals,
      goals,
      count: entries.length,
    });

  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
};

/* =========================
   UPDATE / DELETE
========================= */

exports.updateHistoryItem = async (req, res) => {
  try {
    const item = await foodModel.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item)
      return res.status(404).json({ message: "Not found" });

    Object.assign(item.nutrition, req.body);

    await item.save();

    res.json({ message: "Updated", item });
  } catch {
    res.status(500).json({ message: "Error" });
  }
};

exports.deleteHistoryItem = async (req, res) => {
  try {
    const deleted = await foodModel.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted)
      return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Error" });
  }
};