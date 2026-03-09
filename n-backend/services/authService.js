const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");


exports.signupService = async (name, email, password) => {

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email,
    password: encryptedPassword,
    otp,
    otpExpire: Date.now() + 5 * 60 * 1000
  });

  await sendEmail(
    email,
    "Verify Email",
    `Your OTP is ${otp}`
  );

  return user;

};