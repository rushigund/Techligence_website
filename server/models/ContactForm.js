const mongoose = require("mongoose");

const contactFormSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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
    company: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Inquiry Details
    inquiryType: {
      type: String,
      required: true,
      enum: ["sales", "support", "partnership", "career", "general"],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Status and Response
    status: {
      type: String,
      enum: ["new", "in-progress", "responded", "closed"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Response tracking
    assignedTo: {
      type: String,
      trim: true,
    },
    responseMessage: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },

    // Internal notes
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

    // User tracking (optional)
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
contactFormSchema.index({ inquiryType: 1, status: 1 });
contactFormSchema.index({ email: 1 });
contactFormSchema.index({ submittedAt: -1 });
contactFormSchema.index({ status: 1, priority: 1 });

// Pre-save middleware to update lastUpdated
contactFormSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get statistics
contactFormSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$inquiryType",
        count: { $sum: 1 },
        newCount: {
          $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] },
        },
      },
    },
  ]);
};

module.exports = mongoose.model("ContactForm", contactFormSchema);
