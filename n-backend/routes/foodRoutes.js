const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

const {
  scanFood,
  saveMeal,
  getHistory,
  getHistoryItem,
  getTodaySummary,
  getPeriodSummary,
  getWeeklyInsights,
  updateHistoryItem,
  deleteHistoryItem,
} = require("../controllers/foodController");

/* =========================
   SCAN + SAVE FLOW
========================= */
router.post(
  "/scan",
  auth,
  upload.single("image"),
  scanFood
);

router.post(
  "/save-meal",
  auth,
  saveMeal
);

/* =========================
   HISTORY
========================= */
router.get("/history", auth, getHistory);

router.get("/history/:id", auth, getHistoryItem);

router.patch(
  "/history/:id",
  auth,
  updateHistoryItem
);

router.delete(
  "/history/:id",
  auth,
  deleteHistoryItem
);

/* =========================
   ANALYTICS
========================= */
router.get(
  "/summary/today",
  auth,
  getTodaySummary
);

router.get(
  "/summary",
  auth,
  getPeriodSummary
);

router.get(
  "/insights/weekly",
  auth,
  getWeeklyInsights
);

module.exports = router;