import express from "express";
import { body, validationResult } from "express-validator";
import JobListing from "../models/JobListing.js"; // Adjust path to your JobListing Mongoose model
import { authenticateToken, authorizeRoles } from "../middleware/auth.js"; // Import auth and authorize middleware
import { updateSingleContentItem } from "../utils/contentIngestor.js"; // NEW: Import contentIngestor for RAG updates
import multer from "multer"; // For handling file uploads (resumes)
// import { v4 as uuidv4 } from "uuid"; // Can be used for unique names in cloud storage
// import path from "path"; // Can be used for file extensions

const router = express.Router();

// --- Multer setup for resume uploads (Cloud Storage Recommended for Render) ---
// Using memoryStorage to handle the file as a buffer in memory before uploading to a cloud service.
// This avoids saving files to Render's ephemeral disk, which will be lost on deploys or restarts.
const storage = multer.memoryStorage();

// Filter for allowed file types (PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});


// --- Public Routes ---

// GET /api/career/jobs - Get all job listings
router.get("/jobs", async (req, res) => {
  try {
    const jobListings = await JobListing.find({});
    res.json({
      success: true,
      message: "Job listings fetched successfully!",
      data: jobListings,
    });
  } catch (error) {
    console.error("Error fetching all job listings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch job listings", error: error.message });
  }
});

// POST /api/career/apply - Submit a job application
router.post(
  "/apply",
  upload.single('resume'), // 'resume' is the field name from the frontend
  [
    body("fullName").notEmpty().withMessage("Full name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("phone").notEmpty().withMessage("Phone number is required."),
    body("jobTitle").notEmpty().withMessage("Job title is required."),
    body("jobDepartment").notEmpty().withMessage("Job department is required."),
    body("jobLocation").notEmpty().withMessage("Job location is required."),
    // coverLetter is optional
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // No file to delete from disk as it's in memory. It will be discarded.
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required." });
    }

    try {
      // --- Upload to Cloud Storage (e.g., AWS S3, Google Cloud Storage, Cloudinary) ---
      // This is a placeholder. You would use the respective SDK to upload the file buffer.
      // const resumeUrl = await uploadToCloudStorage(req.file.buffer, req.file.originalname);
      const resumeUrl = `https://fake-cloud-storage.com/resumes/${Date.now()}-${req.file.originalname}`; // Placeholder URL
      console.log(`Resume would be uploaded to: ${resumeUrl}`);

      // Now, save the application details with the URL of the uploaded resume.
      const newApplication = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        jobTitle: req.body.jobTitle,
        jobDepartment: req.body.jobDepartment,
        jobLocation: req.body.jobLocation,
        coverLetter: req.body.coverLetter || "",
        resumeUrl: resumeUrl, // Store the URL from cloud storage
        submittedAt: new Date(),
      };

      console.log("New Job Application Received:", newApplication);
      // TODO: Save `newApplication` to a 'JobApplication' model in your database.
      // const savedApplication = await JobApplication.create(newApplication);

      res.status(200).json({
        success: true,
        message: "Your job application has been submitted successfully!",
        // data: savedApplication // Return saved application data if you create a model for it
      });
    } catch (error) {
      console.error("Error submitting job application:", error);
      // If an error occurs (e.g., database error after a successful cloud upload),
      // you might want to implement logic to delete the file from your cloud storage
      // to prevent orphaned files.
      res.status(500).json({ success: false, message: "Failed to submit application", error: error.message });
    }
  }
);


// --- Admin-Only Routes (for managing job listings) ---

// POST /api/career/jobs - Add a new job listing (Admin only)
router.post(
  "/jobs",
  authenticateToken,
  authorizeRoles('admin'),
  [
    body("title").notEmpty().withMessage("Job title is required."),
    body("department").notEmpty().withMessage("Department is required."),
    body("location").notEmpty().withMessage("Location is required."),
    body("type").notEmpty().withMessage("Job type is required."),
    body("salary").notEmpty().withMessage("Salary is required."),
    body("description").notEmpty().withMessage("Description is required."),
    body("skills").isArray().withMessage("Skills must be an array."),
    body("skills.*").notEmpty().withMessage("Each skill cannot be empty."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const newJob = new JobListing(req.body);
      await newJob.save();

      // NEW: Post-save hook for RAG
      await updateSingleContentItem('job_listing', newJob, 'upsert');

      res.status(201).json({
        success: true,
        message: "Job listing added successfully!",
        data: newJob,
      });
    } catch (error) {
      console.error("Error adding job listing:", error);
      res.status(500).json({ success: false, message: "Failed to add job listing", error: error.message });
    }
  }
);

// PUT /api/career/jobs/:jobId - Update a job listing (Admin only)
router.put(
  "/jobs/:jobId",
  authenticateToken,
  authorizeRoles('admin'),
  [
    body("title").optional().notEmpty().withMessage("Job title cannot be empty."),
    body("department").optional().notEmpty().withMessage("Department cannot be empty."),
    body("location").optional().notEmpty().withMessage("Location cannot be empty."),
    body("type").optional().notEmpty().withMessage("Job type cannot be empty."),
    body("salary").optional().notEmpty().withMessage("Salary cannot be empty."),
    body("description").optional().notEmpty().withMessage("Description cannot be empty."),
    body("skills").optional().isArray().withMessage("Skills must be an array."),
    body("skills.*").optional().notEmpty().withMessage("Each skill cannot be empty."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    try {
      const { jobId } = req.params;
      const updatedJob = await JobListing.findByIdAndUpdate(jobId, req.body, { new: true, runValidators: true });

      if (!updatedJob) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }

      // NEW: Post-update hook for RAG
      await updateSingleContentItem('job_listing', updatedJob, 'upsert');

      res.json({
        success: true,
        message: "Job listing updated successfully!",
        data: updatedJob,
      });
    } catch (error) {
      console.error("Error updating job listing:", error);
      res.status(500).json({ success: false, message: "Failed to update job listing", error: error.message });
    }
  }
);

// DELETE /api/career/jobs/:jobId - Delete a job listing (Admin only)
router.delete(
  "/jobs/:jobId",
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const deletedJob = await JobListing.findByIdAndDelete(jobId);

      if (!deletedJob) {
        return res.status(404).json({ success: false, message: "Job listing not found." });
      }

      // NEW: Post-delete hook for RAG
      // Note: As discussed, direct deletion by sourceId prefix is complex without knowing all chunk IDs.
      // For now, this will log a warning. Rely on full re-ingestion for cleanup or implement
      // a more sophisticated deletion strategy if needed.
      await updateSingleContentItem('job_listing', deletedJob, 'delete');

      res.json({
        success: true,
        message: "Job listing deleted successfully!",
        data: null,
      });
    } catch (error) {
      console.error("Error deleting job listing:", error);
      res.status(500).json({ success: false, message: "Failed to delete job listing", error: error.message });
    }
  }
);

export default router;
