const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");


/* ================= CONTACT ROUTE ================= */
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  try {
    // 1. SAVE TO DATABASE
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    console.log(`[Contact] Inquiry saved to database for ${email}`);

    // 2. SEND EMAIL VIA NODEMAILER (if configured)
    if (process.env.EMAIL_PASS && process.env.EMAIL_PASS !== "YOUR_GMAIL_APP_PASSWORD_HERE") {
      console.log(`[Contact] Attempting to send email to ${process.env.EMAIL_USER}...`);
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"LocalSathi App" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: subject || "New Inquiry from LocalSathi",
        text: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        replyTo: email
      };

      await transporter.sendMail(mailOptions);
      console.log("[Contact] Email sent successfully!");
    } else {
      console.warn("[Contact] EMAIL_PASS not set. Email notification skipped.");
    }

    res.status(200).json({ 
      success: true, 
      message: "Message received! We will get back to you shortly." 
    });

  } catch (error) {
    console.error("[Contact Error]", error.message);
    res.status(500).json({ error: "Server error while processing your request." });
  }
});

module.exports = router;
