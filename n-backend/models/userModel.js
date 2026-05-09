const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: { type: String, required: true },

  isVerified: { type: Boolean, default: false },

  healthProfile: {
    age: { type: Number, min: 0, max: 130 },
    weightKg: { type: Number, min: 0 },
    heightCm: { type: Number, min: 0 },
    allergies: [{ type: String, trim: true }]
  },

  preferences: {
    darkMode: { type: Boolean, default: false }
  },

  goals: {
    caloriesKcal: { type: Number, default: 2000 },
    proteinG: { type: Number, default: 120 },
    carbsG: { type: Number, default: 250 },
    fatG: { type: Number, default: 70 },
    sugarG: { type: Number, default: 50 }
  },

  otp: { type: String, default: undefined },
  otpExpire: { type: Date, default: undefined },

  resetToken: String,
  resetTokenExpire: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);