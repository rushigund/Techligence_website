// src/routes/careerRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer"; // For handling file uploads
import nodemailer from "nodemailer"; // For sending emails
import dotenv from "dotenv"; // To access environment variables
import JobListing from "../models/JobListing.js"; // Corrected: Import JobListing model from its dedicated file
import { authenticateToken, authorizeRoles } from "../middleware/auth.js"; // Your authentication and authorization middleware

dotenv.config();

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory as a Buffer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Increased limit to 10MB to accommodate resume + portfolio
  },
  fileFilter: (req, file, cb) => {
    // Define allowed mimetypes for both resume and portfolio
    const allowedResumeMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedPortfolioMimes = ['application/pdf', 'application/zip', 'image/jpeg', 'image/png'];

    if (file.fieldname === "resume" && allowedResumeMimes.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.fieldname === "portfolio" && allowedPortfolioMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type or field name."), false);
    }
  },
});

// POST /api/career/apply - Handle job application submission
router.post(
  "/career/apply",
  // Use upload.fields to handle multiple file inputs (resume and portfolio)
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 }
  ]),
  [
    // Validation rules for all form fields sent from the frontend
    body("firstName").notEmpty().withMessage("First Name is required"),
    body("lastName").notEmpty().withMessage("Last Name is required"),
    body("email").isEmail().withMessage("Valid Email is required"),
    body("phone").notEmpty().withMessage("Phone Number is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("zipCode").notEmpty().withMessage("ZIP Code is required"),

    body("currentTitle").optional().isString(),
    body("currentCompany").optional().isString(),
    body("totalExperience").notEmpty().withMessage("Total Experience is required"),
    body("relevantExperience").notEmpty().withMessage("Relevant Experience is required"),
    body("expectedSalary").optional().isString(),
    body("noticePeriod").optional().isString(),

    body("education").notEmpty().withMessage("Education Level is required"),
    body("university").optional().isString(),
    body("graduationYear").optional().isNumeric().withMessage("Graduation Year must be a number"),

    body("coverLetter").notEmpty().withMessage("Cover Letter is required"),
    body("whyJoin").notEmpty().withMessage("Why Join is required"),
    body("availability").notEmpty().withMessage("Availability is required"),
    body("relocate").isBoolean().withMessage("Relocate must be a boolean"),

    body("jobTitle").notEmpty().withMessage("Job Title is required"),
    body("jobDepartment").notEmpty().withMessage("Job Department is required"),
    body("jobLocation").notEmpty().withMessage("Job Location is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Backend Validation Errors:", errors.array()); // Log detailed errors
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    // Corrected: Access files directly from req.files object
    const resumeFile = req.files && req.files['resume'] ? req.files['resume'][0] : null;
    const portfolioFile = req.files && req.files['portfolio'] ? req.files['portfolio'][0] : null;

    if (!resumeFile) {
      return res.status(400).json({ success: false, message: "Resume file is required." });
    }

    const {
      firstName, lastName, email, phone, address, city, state, zipCode,
      currentTitle, currentCompany, totalExperience, relevantExperience, expectedSalary, noticePeriod,
      education, university, graduationYear,
      coverLetter, whyJoin, availability, relocate,
      jobTitle, jobDepartment, jobLocation
    } = req.body;

    const fullName = `${firstName} ${lastName}`; // Combine first and last name

    // Nodemailer Setup
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CAREER_RECEIVER_EMAIL || "careers@techligence.com", // Dedicated email for career applications
      subject: `New Job Application: ${jobTitle} - ${fullName}`,
      html: `
        <p><strong>Job Title:</strong> ${jobTitle}</p>
        <p><strong>Department:</strong> ${jobDepartment}</p>
        <p><strong>Location:</strong> ${jobLocation}</p>
        <br>
        <h3>Personal Information:</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}, ${city}, ${state} ${zipCode}</p>
        <br>
        <h3>Professional Information:</h3>
        <p><strong>Current Title:</strong> ${currentTitle || 'N/A'}</p>
        <p><strong>Current Company:</strong> ${currentCompany || 'N/A'}</p>
        <p><strong>Total Experience:</strong> ${totalExperience}</p>
        <p><strong>Relevant Experience:</strong> ${relevantExperience}</p>
        <p><strong>Expected Salary:</strong> ${expectedSalary || 'N/A'}</p>
        <p><strong>Notice Period:</strong> ${noticePeriod || 'N/A'}</p>
        <br>
        <h3>Education:</h3>
        <p><strong>Education Level:</strong> ${education}</p>
        <p><strong>University:</strong> ${university || 'N/A'}</p>
        <p><strong>Graduation Year:</strong> ${graduationYear || 'N/A'}</p>
        <br>
        <h3>Application Details:</h3>
        <p><strong>Cover Letter:</strong></p>
        <p>${coverLetter}</p>
        <br>
        <p><strong>Why Join Techligence:</strong></p>
        <p>${whyJoin}</p>
        <p><strong>Availability:</strong> ${availability}</p>
        <p><strong>Willing to Relocate:</strong> ${relocate ? 'Yes' : 'No'}</p>
        <br>
        <p>Resume is attached.</p>
        ${portfolioFile ? `<p>Portfolio is attached.</p>` : ''}
      `,
      attachments: [
        {
          filename: resumeFile.originalname,
          content: resumeFile.buffer, // Use buffer if stored in memory
          contentType: resumeFile.mimetype,
        },
        ...(portfolioFile ? [{ // Conditionally add portfolio attachment
          filename: portfolioFile.originalname,
          content: portfolioFile.buffer,
          contentType: portfolioFile.mimetype,
        }] : [])
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Your job application has been submitted successfully!" });
    } catch (error) {
      console.error("Error sending job application email:", error);
      res.status(500).json({ success: false, message: "Failed to submit application. Please try again later." });
    }
  }
);

// --- Admin-Only Route to Create a Job Listing ---
// POST /api/career/jobs - Create a new job listing (Admin only)
router.post(
  "/career/jobs",
  authenticateToken,
  authorizeRoles('admin'), // Only admins can create job listings
  [
    body("title").notEmpty().withMessage("Job title is required"),
    body("department").notEmpty().withMessage("Department is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("type").notEmpty().withMessage("Job type is required"),
    body("salary").notEmpty().withMessage("Salary is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("skills").optional().isArray().withMessage("Skills must be an array of strings"),
    body("skills.*").optional().isString().withMessage("Each skill must be a string"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Backend Validation Errors (Create Job Listing):", errors.array());
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const newJobListing = new JobListing(req.body);
      await newJobListing.save();

      res.status(201).json({
        success: true,
        message: "Job listing created successfully!",
        data: newJobListing,
      });
    } catch (error) {
      console.error("Error creating job listing:", error);
      res.status(500).json({ success: false, message: "Failed to create job listing", error: error.message });
    }
  }
);

// GET /api/career/jobs - Get all job listings (Publicly accessible)
router.get("/career/jobs", async (req, res) => {
  try {
    const jobListings = await JobListing.find({});
    res.json({
      success: true,
      message: "Job listings fetched successfully!",
      data: jobListings,
    });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch job listings", error: error.message });
  }
});

// NEW: GET /api/career/jobs/:id - Get a single job listing by ID (for admin editing)
router.get(
  "/career/jobs/:id",
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const jobListing = await JobListing.findById(id);

      if (!jobListing) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }

      res.json({ success: true, message: "Job listing fetched successfully!", data: jobListing });
    } catch (error) {
      console.error("Error fetching job listing by ID:", error);
      res.status(500).json({ success: false, message: "Failed to fetch job listing", error: error.message });
    }
  }
);

// NEW: PUT /api/career/jobs/:id - Update an existing job listing (Admin only)
router.put(
  "/career/jobs/:id",
  authenticateToken,
  authorizeRoles('admin'),
  [
    body("title").optional().notEmpty().withMessage("Job title cannot be empty"),
    body("department").optional().notEmpty().withMessage("Department cannot be empty"),
    body("location").optional().notEmpty().withMessage("Location cannot be empty"),
    body("type").optional().notEmpty().withMessage("Job type cannot be empty"),
    body("salary").optional().notEmpty().withMessage("Salary cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("skills").optional().isArray().withMessage("Skills must be an array of strings"),
    body("skills.*").optional().isString().withMessage("Each skill must be a string"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Backend Validation Errors (Update Job Listing):", errors.array());
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updatedJobListing = await JobListing.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

      if (!updatedJobListing) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }

      res.json({ success: true, message: "Job listing updated successfully!", data: updatedJobListing });
    } catch (error) {
      console.error("Error updating job listing:", error);
      res.status(500).json({ success: false, message: "Failed to update job listing", error: error.message });
    }
  }
);

// NEW: DELETE /api/career/jobs/:id - Delete a job listing (Admin only)
router.delete(
  "/career/jobs/:id",
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deletedJobListing = await JobListing.findByIdAndDelete(id);

      if (!deletedJobListing) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }

      res.json({ success: true, message: "Job listing deleted successfully!", data: null });
    } catch (error) {
      console.error("Error deleting job listing:", error);
      res.status(500).json({ success: false, message: "Failed to delete job listing", error: error.message });
    }
  }
);

export default router;
