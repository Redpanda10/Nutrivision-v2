const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const protect = require("../middleware/authMiddleware");


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:10,// limit each IP to 5 requests per windowMs   
    message: {
        message: "Too many login attempts, please try again after 15 minutes"
    }
});



const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", loginLimiter, authController.login);
router.get("/protected", protect,authController.getProfile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post('/profile', protect, authController.updateProfile);

module.exports = router;