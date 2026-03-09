const mongoose = require("mongoose");

const nutritionMicroSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number },
    unit: { type: String, trim: true },
    percentDaily: { type: Number }
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    caloriesKcal: { type: Number, min: 0 },
    proteinG: { type: Number, min: 0 },
    carbsG: { type: Number, min: 0 },
    fatG: { type: Number, min: 0 },
    vitamins: [nutritionMicroSchema],
    minerals: [nutritionMicroSchema],
    // Keep raw provider payload for later improvements/debugging
    raw: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const recognitionCandidateSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    externalId: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 1 }
  },
  { _id: false }
);

const recognitionSchema = new mongoose.Schema(
  {
    provider: { type: String, trim: true }, // spoonacular | caloriemama | usda | etc
    externalId: { type: String, trim: true },
    name: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 1 },
    candidates: [recognitionCandidateSchema]
  },
  { _id: false }
);

const foodHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    capturedImage: {
      url: { type: String, trim: true },
      mimeType: { type: String, trim: true },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    recognition: recognitionSchema,
    ingredients: [{ type: String, trim: true }],
    nutrition: nutritionSchema,
    safetyCheck: {
      isSafe: { type: Boolean, default: true },
      allergensMatched: [{ type: String, trim: true }],
      warnings: [{ type: String, trim: true }]
    },
    insights: {
      benefits: [{ type: String, trim: true }],
      bestTimeToEat: [{ type: String, trim: true }],
      warnings: [{ type: String, trim: true }]
    },
    eatenAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

foodHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("FoodHistory", foodHistorySchema);

