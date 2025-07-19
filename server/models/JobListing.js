import mongoose from "mongoose";

// Define the Mongoose schema for a Job Listing
const jobListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: { // e.g., Full-time, Part-time, Contract
      type: String,
      required: true,
      trim: true,
    },
    salary: { // e.g., "$120k - $150k"
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skills: { // Array of strings, e.g., ["ROS", "Python"]
      type: [String],
      default: [],
    },
    isActive: { // To easily enable/disable a job listing
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create and export the JobListing model
const JobListing = mongoose.model("JobListing", jobListingSchema);
export default JobListing;
