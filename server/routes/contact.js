const express = require("express");
const ContactForm = require("../models/ContactForm");

const router = express.Router();

// @route   POST /api/contact/submit
// @desc    Submit contact form
// @access  Public
router.post("/submit", async (req, res) => {
  try {
    const { name, email, company, inquiryType, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !inquiryType || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Get client IP and user agent for tracking
    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const userAgent = req.headers["user-agent"];

    // Create contact form entry
    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company ? company.trim() : undefined,
      inquiryType,
      subject: subject.trim(),
      message: message.trim(),
      ipAddress,
      userAgent,
    };

    // Set priority based on inquiry type
    const highPriorityTypes = ["support", "partnership"];
    if (highPriorityTypes.includes(inquiryType)) {
      contactData.priority = "high";
    }

    // Check for spam (multiple submissions from same email in short time)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSubmission = await ContactForm.findOne({
      email: contactData.email,
      submittedAt: { $gte: fiveMinutesAgo },
    });

    if (recentSubmission) {
      return res.status(429).json({
        success: false,
        message: "Please wait a few minutes before submitting another message.",
      });
    }

    // Save contact form
    const contactForm = new ContactForm(contactData);
    await contactForm.save();

    // Auto-assign based on inquiry type
    let assignedTo = "";
    switch (inquiryType) {
      case "sales":
        assignedTo = "Sales Team";
        break;
      case "support":
        assignedTo = "Technical Support";
        break;
      case "partnership":
        assignedTo = "Business Development";
        break;
      case "career":
        assignedTo = "HR Department";
        break;
      default:
        assignedTo = "General Support";
    }

    // Update with assignment
    contactForm.assignedTo = assignedTo;
    await contactForm.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      data: {
        ticketId: contactForm._id,
        submittedAt: contactForm.submittedAt,
        assignedTo: contactForm.assignedTo,
        estimatedResponse: getEstimatedResponseTime(inquiryType),
      },
    });

    // Log the submission
    console.log(
      `📧 New contact form: ${name} (${email}) - ${inquiryType}: ${subject}`,
    );
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting your message. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

// @route   GET /api/contact/messages
// @desc    Get all contact messages (admin)
// @access  Private (would need auth middleware)
router.get("/messages", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      inquiryType,
      priority,
      search,
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (inquiryType) filter.inquiryType = inquiryType;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
      ];
    }

    // Get messages with pagination
    const messages = await ContactForm.find(filter)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ContactForm.countDocuments(filter);

    res.json({
      success: true,
      data: {
        messages,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
    });
  }
});

// @route   GET /api/contact/messages/:id
// @desc    Get single contact message
// @access  Private (would need auth middleware)
router.get("/messages/:id", async (req, res) => {
  try {
    const message = await ContactForm.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get message error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching message",
    });
  }
});

// @route   PUT /api/contact/messages/:id/respond
// @desc    Respond to contact message
// @access  Private (would need auth middleware)
router.put("/messages/:id/respond", async (req, res) => {
  try {
    const { responseMessage, status = "responded" } = req.body;

    const message = await ContactForm.findByIdAndUpdate(
      req.params.id,
      {
        responseMessage,
        status,
        respondedAt: new Date(),
      },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Response recorded successfully",
      data: message,
    });
  } catch (error) {
    console.error("Respond to message error:", error);
    res.status(500).json({
      success: false,
      message: "Error recording response",
    });
  }
});

// @route   PUT /api/contact/messages/:id/status
// @desc    Update message status
// @access  Private (would need auth middleware)
router.put("/messages/:id/status", async (req, res) => {
  try {
    const { status, priority, assignedTo, internalNotes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (internalNotes) updateData.internalNotes = internalNotes;

    const message = await ContactForm.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating message",
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact form statistics
// @access  Private (would need auth middleware)
router.get("/stats", async (req, res) => {
  try {
    const stats = await ContactForm.getStats();

    const statusStats = await ContactForm.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await ContactForm.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await ContactForm.aggregate([
      {
        $match: { submittedAt: { $gte: sevenDaysAgo } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        inquiryTypeStats: stats,
        statusStats,
        priorityStats,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Get contact stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
});

// Helper function to estimate response time
function getEstimatedResponseTime(inquiryType) {
  const responseTimes = {
    support: "2-4 hours",
    sales: "1-2 business days",
    partnership: "3-5 business days",
    career: "5-7 business days",
    general: "2-3 business days",
  };

  return responseTimes[inquiryType] || "2-3 business days";
}

module.exports = router;
