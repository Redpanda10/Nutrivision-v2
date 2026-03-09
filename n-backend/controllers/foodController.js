const FoodHistory = require("../models/foodHistoryModel");
const User = require("../models/userModel");
const { analyzeFoodImageWithGemini } = require("../services/geminiService");

const buildSafetyCheck = (user, ingredients) => {
  const allergies =
    user?.healthProfile?.allergies?.length
      ? user.healthProfile.allergies
      : user?.allergies || [];

  const lowerAllergies = allergies.map((a) => a.toLowerCase());
  const matched = [];

  (ingredients || []).forEach((ing) => {
    const lowerIng = ing.toLowerCase();
    lowerAllergies.forEach((all) => {
      if (lowerIng.includes(all)) {
        matched.push(all);
      }
    });
  });

  const uniqueMatched = [...new Set(matched)];

  return {
    isSafe: uniqueMatched.length === 0,
    allergensMatched: uniqueMatched,
    warnings:
      uniqueMatched.length > 0
        ? [
            `Contains potential allergens: ${uniqueMatched.join(
              ", "
            )}. Please avoid this food.`
          ]
        : []
  };
};

// Simple placeholder "AI" – replace with real Spoonacular/CalorieMama/USDA integration
const mockAnalyzeFood = async () => {
  return {
    recognition: {
      provider: "mock-ai",
      externalId: "apple-001",
      name: "Apple",
      confidence: 0.94,
      candidates: [
        { name: "Apple", externalId: "apple-001", confidence: 0.94 },
        { name: "Pear", externalId: "pear-001", confidence: 0.12 }
      ]
    },
    ingredients: ["Apple"],
    nutrition: {
      caloriesKcal: 95,
      proteinG: 0.5,
      carbsG: 25,
      fatG: 0.3,
      vitamins: [
        { name: "Vitamin C", amount: 8.4, unit: "mg", percentDaily: 14 }
      ],
      minerals: [
        { name: "Potassium", amount: 195, unit: "mg", percentDaily: 6 }
      ],
      raw: {}
    },
    insights: {
      benefits: [
        "Rich in fiber, supports digestion",
        "Contains antioxidants that support heart health",
        "Good source of Vitamin C"
      ],
      bestTimeToEat: [
        "Great as a mid-morning snack",
        "Suitable pre‑workout for quick energy"
      ],
      warnings: ["Contains natural sugars – monitor intake if diabetic"]
    }
  };
};

exports.scanFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const imageUri = req.body?.imageUri;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let aiResult = null;

    // Prefer actual uploaded image when available
    if (req.file?.buffer && req.file?.mimetype) {
      const base64 = req.file.buffer.toString("base64");
      try {
        aiResult = await analyzeFoodImageWithGemini({
          base64,
          mimeType: req.file.mimetype
        });
      } catch (e) {
        console.warn("Gemini analyze failed, falling back to mock:", e.message);
      }
    }

    if (!aiResult) {
      aiResult = await mockAnalyzeFood(imageUri);
    }

    const safetyCheck = buildSafetyCheck(user, aiResult.ingredients);

    const foodHistory = await FoodHistory.create({
      user: userId,
      capturedImage: {
        url: imageUri || null
      },
      recognition: aiResult.recognition,
      ingredients: aiResult.ingredients,
      nutrition: aiResult.nutrition,
      safetyCheck,
      insights: aiResult.insights,
      eatenAt: new Date()
    });

    return res.status(201).json(foodHistory);
  } catch (error) {
    console.error("scanFood error", error);
    return res.status(500).json({ message: "Failed to analyze food" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await FoodHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(items);
  } catch (error) {
    console.error("getHistory error", error);
    return res.status(500).json({ message: "Failed to fetch history" });
  }
};

exports.getHistoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const item = await FoodHistory.findOne({ _id: id, user: userId });
    if (!item) {
      return res.status(404).json({ message: "Food entry not found" });
    }

    return res.json(item);
  } catch (error) {
    console.error("getHistoryItem error", error);
    return res.status(500).json({ message: "Failed to fetch item" });
  }
};

exports.getTodaySummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const entries = await FoodHistory.find({
      user: userId,
      eatenAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totals = entries.reduce(
      (acc, entry) => {
        const n = entry.nutrition || {};
        acc.caloriesKcal += n.caloriesKcal || 0;
        acc.proteinG += n.proteinG || 0;
        acc.carbsG += n.carbsG || 0;
        acc.fatG += n.fatG || 0;
        return acc;
      },
      { caloriesKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    const user = await User.findById(userId);

    const goals = user?.healthProfile?.goals || {};
    const calorieGoal =
      user?.healthProfile?.dailyCalorieGoal || user?.dailyCalorieGoal || 0;

    return res.json({
      totals,
      goals: {
        caloriesKcal: calorieGoal,
        proteinG: goals.proteinG || 0,
        carbsG: goals.carbsG || 0,
        fatG: goals.fatG || 0
      }
    });
  } catch (error) {
    console.error("getTodaySummary error", error);
    return res.status(500).json({ message: "Failed to compute summary" });
  }
};

