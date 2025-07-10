const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CareerApplication = require("../models/CareerApplication");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/career");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  if (file.fieldname === "resume") {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Resume must be PDF, DOC, or DOCX"), false);
    }
  } else if (file.fieldname === "portfolio") {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Portfolio must be PDF or ZIP"), false);
    }
  } else {
    cb(new Error("Unknown file field"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// @route   POST /api/career/apply
// @desc    Submit job application
// @access  Public
router.post(
  "/apply",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        jobTitle,
        jobDepartment,
        jobLocation,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        currentTitle,
        currentCompany,
        totalExperience,
        relevantExperience,
        expectedSalary,
        noticePeriod,
        education,
        university,
        graduationYear,
        coverLetter,
        whyJoin,
        availability,
        relocate,
      } = req.body;

      // Create application object
      const applicationData = {
        jobTitle,
        jobDepartment,
        jobLocation,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        currentTitle,
        currentCompany,
        totalExperience,
        relevantExperience,
        expectedSalary,
        noticePeriod,
        education,
        university,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        coverLetter,
        whyJoin,
        availability,
        relocate: relocate === "true" || relocate === true,
      };

      // Add file information if files were uploaded
      if (req.files) {
        if (req.files.resume && req.files.resume[0]) {
          const resumeFile = req.files.resume[0];
          applicationData.resumeFile = {
            originalName: resumeFile.originalname,
            filename: resumeFile.filename,
            path: resumeFile.path,
            mimetype: resumeFile.mimetype,
            size: resumeFile.size,
          };
        }

        if (req.files.portfolio && req.files.portfolio[0]) {
          const portfolioFile = req.files.portfolio[0];
          applicationData.portfolioFile = {
            originalName: portfolioFile.originalname,
            filename: portfolioFile.filename,
            path: portfolioFile.path,
            mimetype: portfolioFile.mimetype,
            size: portfolioFile.size,
          };
        }
      }

      // Check for duplicate applications (same email + job title in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const existingApplication = await CareerApplication.findOne({
        email,
        jobTitle,
        submittedAt: { $gte: thirtyDaysAgo },
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message:
            "You have already applied for this position within the last 30 days.",
        });
      }

      // Create and save application
      const application = new CareerApplication(applicationData);
      await application.save();

      // Send success response
      res.status(201).json({
        success: true,
        message: "Application submitted successfully!",
        data: {
          applicationId: application._id,
          submittedAt: application.submittedAt,
          status: application.status,
        },
      });

      // Log the application submission
      console.log(
        `📄 New job application: ${firstName} ${lastName} applied for ${jobTitle}`,
      );
    } catch (error) {
      console.error("Career application error:", error);

      // Clean up uploaded files if there was an error
      if (req.files) {
        Object.values(req.files)
          .flat()
          .forEach((file) => {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          });
      }

      res.status(500).json({
        success: false,
        message: "Error submitting application. Please try again.",
        error: process.env.NODE_ENV === "development" ? error.message : null,
      });
    }
  },
);

// @route   GET /api/career/applications
// @desc    Get all applications (admin)
// @access  Private (would need auth middleware)
router.get("/applications", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, jobTitle } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");

    // Get applications with pagination
    const applications = await CareerApplication.find(filter)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-resumeFile.path -portfolioFile.path"); // Exclude file paths for security

    const total = await CareerApplication.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
    });
  }
});

// @route   GET /api/career/applications/:id
// @desc    Get single application
// @access  Private (would need auth middleware)
router.get("/applications/:id", async (req, res) => {
  try {
    const application = await CareerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching application",
    });
  }
});

// @route   PUT /api/career/applications/:id/status
// @desc    Update application status
// @access  Private (would need auth middleware)
router.put("/applications/:id/status", async (req, res) => {
  try {
    const { status, internalNotes } = req.body;

    const application = await CareerApplication.findByIdAndUpdate(
      req.params.id,
      { status, internalNotes },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application status updated",
      data: application,
    });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application",
    });
  }
});

// @route   GET /api/career/stats
// @desc    Get application statistics
// @access  Private (would need auth middleware)
router.get("/stats", async (req, res) => {
  try {
    const stats = await CareerApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const jobStats = await CareerApplication.aggregate([
      {
        $group: {
          _id: "$jobTitle",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        jobStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
});

module.exports = router;
