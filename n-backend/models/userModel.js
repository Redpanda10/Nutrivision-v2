const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  // Preferred shape going forward (used by the mobile app)
  healthProfile: {
    age: { type: Number, min: 0, max: 130 },
    weightKg: { type: Number, min: 0 },
    heightCm: { type: Number, min: 0 },
    dailyCalorieGoal: { type: Number, min: 0 },
    allergies: [{ type: String, trim: true }],
    goals: {
      proteinG: { type: Number, min: 0 },
      carbsG: { type: Number, min: 0 },
      fatG: { type: Number, min: 0 }
    }
  },
  preferences: {
    darkMode: { type: Boolean, default: false }
  },

  // Back-compat fields (existing API uses these today)
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  allergies: [{ type: String }],
  dailyCalorieGoal: { type: Number },

  otp: String,
  otpExpire: Date,

  resetToken: String,
  resetTokenExpire: Date

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);