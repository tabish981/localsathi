const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "SECRETKEY";

const authMiddleware = require("../middleware/auth");

/* ================= AUTH ROUTES ================= */

/* ========= SIGNUP ========= */
router.post("/signup", async (req, res) => {
  const { name, email, username, password, gender } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const lowerEmail = email.toLowerCase();

    // Check existing user by email OR username
    let user = await User.findOne({
      $or: [{ email: lowerEmail }, { username }],
    });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email: lowerEmail,
      username,
      password: hashedPassword,
      gender,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        gender: user.gender,
      },
    });

  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: "Server Error during signup" });
  }
});

/* ========= LOGIN ========= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const lowerEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowerEmail }).catch(err => {
      console.error("Database Query Error:", err.message);
      throw new Error("Database connection failed");
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password).catch(err => {
      console.error("Bcrypt Comparison Error:", err.message);
      throw new Error("Encryption error during login");
    });

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        gender: user.gender,
      },
    });

  } catch (err) {
    console.error("CRITICAL Login Error:", err);
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    
    let message = "Server Error during login";
    if (err.message.includes("Database connection failed") || err.message.includes("ECONNREFUSED") || err.name === "MongooseError") {
      message = "Database is offline or not connecting. Please start MongoDB service.";
    } else if (err.message.includes("Encryption error")) {
      message = "Internal security error. Please try again.";
    }
    
    res.status(500).json({ message, details: err.message });
  }
});

/* ========= PROFILE ========= */
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

/* ========= UPDATE PROFILE ========= */
router.put("/profile/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { name, phone, dob, avatar, gender, bio } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          phone,
          dob,
          avatar,
          gender,
          bio
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

/* ========= CHANGE PASSWORD ========= */
router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both old and new passwords" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error updating password" });
  }
});
/* ========= FORGOT PASSWORD ========= */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const lowerEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email address" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: `"LocalSathi Support" <${process.env.EMAIL_USER}>`,
      subject: "LocalSathi: Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>
          <p>You requested a password reset for your LocalSathi account.</p>
          <p>Please click on the following link or paste it into your browser to complete the process:</p>
          <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #4f46e5; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour. If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "Password reset instructions have been sent to your email." });
    } catch (mailError) {
      console.error("Mail Sender Error:", mailError);
      
      // Clear token if email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ message: "Error sending email. Please try again later." });
    }

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error processing forgot password request" });
  }
});

/* ========= RESET PASSWORD LOGIC ========= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ message: "Please provide a new password" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password has been successfully reset. You can now log in." });

  } catch (err) {
    console.error("Reset Password Logic Error:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

module.exports = router;