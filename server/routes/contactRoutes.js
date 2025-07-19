// src/routes/contactRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer"; // You'll need to install this: npm install nodemailer
import dotenv from "dotenv"; // To access environment variables for email credentials

dotenv.config(); // Load .env variables

const router = express.Router();

// POST /api/contact - Handle contact form submission and send email
router.post(
  "/contact",
  [
    // Validation rules for contact form fields
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("subject").notEmpty().withMessage("Subject is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("inquiryType").notEmpty().withMessage("Inquiry type is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { name, email, company, subject, message, inquiryType } = req.body;

    // --- Nodemailer Setup ---
    // You'll need to configure your email service (e.g., Gmail, SendGrid, Mailgun)
    // Store these credentials securely in your .env file
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
      port: parseInt(process.env.EMAIL_PORT || '587'), // e.g., 587 for TLS, 465 for SSL
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: process.env.CONTACT_FORM_RECEIVER_EMAIL || "info@techligence.com", // Recipient email (e.g., your company's contact email)
      subject: `Techligence Contact Form: ${subject} [${inquiryType}]`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
    }
  }
);

export default router;