const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "10d" }
  );

};



exports.signup = async (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {

    return res.status(400).json({
      message: "All fields required"
    });

  }

  try {

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists"
      });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000
    });

    await sendEmail(
      email,
      "Verify your email",
      `Your OTP is ${otp}`
    );

    res.status(201).json({
      message: "OTP sent to email"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



exports.verifyEmail = async (req, res) => {

  const { email, otp } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "User not found"
      });

    }

    if (user.otp !== otp) {

      return res.status(400).json({
        message: "Invalid OTP"
      });

    }

    if (user.otpExpire < Date.now()) {

      return res.status(400).json({
        message: "OTP expired"
      });

    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({
      message: "Email verified",
      token: generateToken(user._id),
      user:{
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }


};


exports.login = async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message: "Invalid Email or Password"
      });

    }

    if (!user.isVerified) {

      return res.status(401).json({
        message: "Verify your email first"
      });

    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) { 
      return res.status(400).json({
        message: "Invalid Email or Password"
      });
    }

   

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user:{
        name: user.name,
        email: user.email,

      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

const crypto = require("crypto");

exports.forgotPassword = async (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email required"
    });
  }

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Password Reset",
      `Click the link to reset password: ${resetLink}`
    );

    res.json({
      message: "Password reset link sent to email"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

exports.resetPassword = async (req, res) => {

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Token and new password required"
    });
  }

  try {

      const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });


    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({
      message: "Password reset successful"
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

};

exports.updateProfile = async (req,res)=>{

  const {
    healthProfile,
    age,
    weight,
    height,
    allergies,
    dailyCalorieGoal,
    goals,
    preferences
  } = req.body;

  const user = await User.findById(req.user.id);

  // Back-compat updates
  if (age !== undefined) user.age = age;
  if (weight !== undefined) user.weight = weight;
  if (height !== undefined) user.height = height;
  if (allergies !== undefined) user.allergies = allergies;
  if (dailyCalorieGoal !== undefined) user.dailyCalorieGoal = dailyCalorieGoal;

  // Preferred healthProfile shape (mobile app)
  const hp = healthProfile ?? {
    age,
    weightKg: weight,
    heightCm: height,
    dailyCalorieGoal,
    allergies,
    goals
  };

  user.healthProfile = user.healthProfile || {};
  if (hp.age !== undefined) user.healthProfile.age = hp.age;
  if (hp.weightKg !== undefined) user.healthProfile.weightKg = hp.weightKg;
  if (hp.heightCm !== undefined) user.healthProfile.heightCm = hp.heightCm;
  if (hp.dailyCalorieGoal !== undefined) user.healthProfile.dailyCalorieGoal = hp.dailyCalorieGoal;
  if (hp.allergies !== undefined) user.healthProfile.allergies = hp.allergies;
  if (hp.goals !== undefined) user.healthProfile.goals = { ...(user.healthProfile.goals || {}), ...hp.goals };

  if (preferences !== undefined) {
    user.preferences = { ...(user.preferences || {}), ...preferences };
  }

  await user.save();

  res.json({
    message:"Profile updated"
  });

};
