const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    // Job Information
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobDepartment: {
      type: String,
      required: true,
      trim: true,
    },
    jobLocation: {
      type: String,
      required: true,
      trim: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },

    // Professional Information
    currentTitle: {
      type: String,
      trim: true,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    totalExperience: {
      type: String,
      required: true,
      enum: ["0-1", "1-3", "3-5", "5-8", "8+"],
    },
    relevantExperience: {
      type: String,
      required: true,
      enum: ["0-1", "1-3", "3-5", "5-8", "8+"],
    },
    expectedSalary: {
      type: String,
      enum: [
        "40k-60k",
        "60k-80k",
        "80k-100k",
        "100k-120k",
        "120k-150k",
        "150k+",
      ],
    },
    noticePeriod: {
      type: String,
      enum: ["immediate", "2-weeks", "1-month", "2-months", "3-months"],
    },

    // Education
    education: {
      type: String,
      required: true,
      enum: ["high-school", "associate", "bachelor", "master", "phd"],
    },
    university: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: Number,
      min: 1980,
      max: 2030,
    },

    // Application Details
    coverLetter: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    whyJoin: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    availability: {
      type: String,
      required: true,
      enum: ["immediately", "2-weeks", "1-month", "2-months", "negotiable"],
    },
    relocate: {
      type: Boolean,
      default: false,
    },

    // File Information
    resumeFile: {
      originalName: String,
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
    },
    portfolioFile: {
      originalName: String,
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
    },

    // Application Status
    status: {
      type: String,
      enum: ["submitted", "under-review", "interview", "rejected", "hired"],
      default: "submitted",
    },

    // Internal Notes (for HR)
    internalNotes: {
      type: String,
      maxlength: 1000,
    },

    // Tracking
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
careerApplicationSchema.index({ jobTitle: 1, status: 1 });
careerApplicationSchema.index({ email: 1 });
careerApplicationSchema.index({ submittedAt: -1 });

// Virtual for full name
careerApplicationSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to update lastUpdated
careerApplicationSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
