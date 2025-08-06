// src/routes/contactRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";
// A simple sanitizer function to escape HTML characters to prevent XSS
const escapeHTML = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag] || tag)
  );
};

const router = express.Router();

router.post(
  "/",
  [
    // Validation rules
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("inquiryType").trim().notEmpty().withMessage("Inquiry type is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      // Sanitize inputs
      const name = escapeHTML(req.body.name);
      const email = req.body.email; // Already validated and normalized
      const company = req.body.company ? escapeHTML(req.body.company) : 'N/A';
      const subject = escapeHTML(req.body.subject);
      const message = escapeHTML(req.body.message);
      const inquiryType = escapeHTML(req.body.inquiryType);

      // Nodemailer setup (credentials from .env, loaded in server.js)
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        secure: (process.env.EMAIL_PORT || "587") === "465", // true for 465, false for others
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Techligence Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.CONTACT_FORM_RECEIVER_EMAIL,
        replyTo: email, // Allows direct reply to the user from the email client
        subject: `Techligence Contact Form: ${subject} [${inquiryType}]`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">${message}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Your message has been sent successfully!" });

    } catch (error) {
      console.error("Error sending contact email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send your message. Please try again later.",
      });
    }
  }
);

export default router;