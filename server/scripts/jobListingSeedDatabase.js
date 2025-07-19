import mongoose from "mongoose";
import dotenv from "dotenv";
import JobListing from "../models/JobListing.js"; // Import the JobListing model

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/techligence";

const seedJobListings = [
  {
    title: "Senior Robotics Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $150k",
    description:
      "Lead the development of next-generation autonomous robotics systems, focusing on navigation, manipulation, and perception. Work with a cross-functional team to bring innovative robotics solutions to market.",
    skills: ["ROS", "Python", "C++", "Machine Learning", "Computer Vision", "Path Planning"],
    isActive: true,
  },
  {
    title: "AI/ML Research Scientist",
    department: "Research",
    location: "Remote",
    type: "Full-time",
    salary: "$130k - $170k",
    description:
      "Research and develop cutting-edge AI algorithms for intelligent robot behavior, including reinforcement learning, deep neural networks, and natural language processing for human-robot interaction.",
    skills: ["PyTorch", "TensorFlow", "Computer Vision", "Deep Learning", "NLP", "Reinforcement Learning"],
    isActive: true,
  },
  {
    title: "Frontend Developer",
    department: "Software",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90k - $120k",
    description:
      "Build intuitive and responsive user interfaces for robot control and monitoring systems using modern web technologies. Collaborate with backend engineers and UX designers to create seamless user experiences.",
    skills: ["React", "TypeScript", "Three.js", "UI/UX Design", "Tailwind CSS", "RESTful APIs"],
    isActive: true,
  },
  {
    title: "Hardware Engineer",
    department: "Hardware",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$100k - $130k",
    description:
      "Design, develop, and optimize robotic hardware components and systems, including PCB design, embedded systems, and mechanical integration. Conduct testing and validation to ensure robust performance.",
    skills: ["PCB Design", "Embedded Systems", "CAD", "Electronics", "Firmware Development", "Robotics Mechanics"],
    isActive: true,
  },
  {
    title: "Robotics Field Technician",
    department: "Operations",
    location: "On-site (Various locations)",
    type: "Full-time",
    salary: "$60k - $80k",
    description:
      "Provide on-site installation, maintenance, and troubleshooting support for our robotic systems. Travel to client sites, diagnose issues, and ensure optimal robot performance.",
    skills: ["Robotics Maintenance", "Troubleshooting", "Electrical Systems", "Mechanical Assembly", "Customer Service"],
    isActive: true,
  },
  {
    title: "Product Manager (Robotics)",
    department: "Product",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$110k - $140k",
    description:
      "Define product strategy, roadmap, and requirements for our robotics platforms. Work closely with engineering, design, and sales teams to deliver innovative and market-leading products.",
    skills: ["Product Management", "Market Research", "Agile Methodologies", "Robotics Industry Knowledge", "Communication"],
    isActive: false, // Example of an inactive job listing
  },
];

const seedJobListingDatabase = async () => {
  try {
    console.log("📦 Starting job listing database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing job listings
    console.log("🗑️  Clearing existing job listings...");
    await JobListing.deleteMany({});

    // Create new job listings
    console.log("💼 Creating job listings...");
    const createdJobListings = await JobListing.create(seedJobListings);
    console.log(`✅ Created ${createdJobListings.length} job listings`);

    console.log("\n📋 Seeding completed for the following job listings:");
    createdJobListings.forEach((job) => {
      console.log(`   Title: "${job.title}", Department: ${job.department}, Location: ${job.location}, Active: ${job.isActive}`);
    });

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
    console.log("🎉 Job listing seeding completed successfully!");
  } catch (error) {
    console.error("❌ Job listing seeding failed:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedJobListingDatabase();
}

export default seedJobListingDatabase;
