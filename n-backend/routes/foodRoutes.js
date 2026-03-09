const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  scanFood,
  getHistory,
  getHistoryItem,
  getTodaySummary
} = require("../controllers/foodController");

router.post("/scan", upload.single("image"), scanFood);
router.get("/history", getHistory);
router.get("/history/:id", getHistoryItem);
router.get("/summary/today", getTodaySummary);

module.exports = router;

