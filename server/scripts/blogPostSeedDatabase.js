import mongoose from "mongoose";
import dotenv from "dotenv";
import BlogPost from "../models/BlogPost.js"; // Adjust path to your BlogPost Mongoose model

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/techligence";

const seedBlogPosts = [
  {
    postId: 1,
    title: "The Future of Autonomous Robotics in Manufacturing",
    excerpt: "Exploring how autonomous robots are revolutionizing manufacturing processes and increasing efficiency by 300%.",
    author: "Dr. Sarah Chen",
    authorRole: "Lead Robotics Engineer",
    publishedDate: new Date("2024-01-15"),
    readTime: "8 min read",
    category: "robotics",
    image: "🤖",
    likes: 245,
    comments: 18,
    featured: true,
    content: "Autonomous robots are transforming the manufacturing landscape. This article delves into the latest advancements, case studies, and future predictions for their integration into smart factories. We discuss the benefits such as increased precision, reduced labor costs, and enhanced safety, along with the challenges of implementation and maintenance. The adoption of AI-powered navigation and collaborative robotics is accelerating, promising a new era of industrial automation."
  },
  {
    postId: 2,
    title: "Machine Learning in Robot Navigation: A Deep Dive",
    excerpt: "Understanding how modern robots use ML algorithms to navigate complex environments safely and efficiently.",
    author: "Alex Rodriguez",
    authorRole: "AI Research Scientist",
    publishedDate: new Date("2024-01-12"),
    readTime: "12 min read",
    category: "ai",
    image: "🧠",
    likes: 189,
    comments: 24,
    featured: true,
    content: "Machine learning is at the heart of advanced robot navigation. This deep dive explores various ML techniques, including reinforcement learning, neural networks, and deep learning, applied to real-time path planning, obstacle avoidance, and simultaneous localization and mapping (SLAM). We provide examples of how these algorithms enable robots to adapt to dynamic environments and learn from experience, making them more robust and intelligent."
  },
  {
    postId: 3,
    title: "Getting Started with URDF: Robot Description Files",
    excerpt: "A comprehensive guide to creating and managing URDF files for robot modeling and simulation.",
    author: "Mike Johnson",
    authorRole: "Software Developer",
    publishedDate: new Date("2024-01-10"),
    readTime: "6 min read",
    category: "tutorials",
    image: "📋",
    likes: 156,
    comments: 12,
    featured: false,
    content: "The Unified Robot Description Format (URDF) is an XML format for describing all aspects of a robot. This tutorial covers the basics of URDF, how to define links and joints, add visual and collision properties, and integrate sensor data. We'll walk through creating a simple URDF file from scratch and visualizing it in popular robotics simulation tools like Gazebo and RViz, providing a solid foundation for robot modeling."
  },
  {
    postId: 4,
    title: "Industry 4.0: How Robotics is Shaping Smart Factories",
    excerpt: "Examining the role of robotics in the fourth industrial revolution and smart manufacturing.",
    author: "Emma Wilson",
    authorRole: "Industry Analyst",
    publishedDate: new Date("2024-01-08"),
    readTime: "10 min read",
    category: "industry",
    image: "🏭",
    likes: 203,
    comments: 31,
    featured: false,
    content: "Industry 4.0 represents a paradigm shift in manufacturing, driven by automation, data exchange, and smart technologies. Robotics plays a pivotal role in this revolution, enabling highly flexible and efficient production lines. This article explores key components of Industry 4.0, such as cyber-physical systems, IoT, and cloud computing, and how robots are integrated to create fully autonomous and interconnected smart factories. We also discuss the economic and societal impacts of these changes."
  },
  {
    postId: 5,
    title: "Computer Vision in Robotics: Real-World Applications",
    excerpt: "Exploring how computer vision technologies enable robots to see and understand their environment.",
    author: "David Kim",
    authorRole: "Computer Vision Engineer",
    publishedDate: new Date("2024-01-05"),
    readTime: "9 min read",
    category: "technology",
    image: "👁️",
    likes: 178,
    comments: 15,
    featured: false,
    content: "Computer vision is a critical capability for robots to interact intelligently with the physical world. This article highlights various real-world applications of computer vision in robotics, including object recognition, pose estimation, visual servoing, and quality inspection. We delve into the underlying algorithms and sensor technologies that allow robots to 'see' and 'understand' their surroundings, enabling tasks from autonomous navigation to intricate manipulation."
  },
  {
    postId: 6,
    title: "Building Your First Robot Controller with ROS",
    excerpt: "Step-by-step tutorial on creating a robot controller using the Robot Operating System (ROS).",
    author: "Lisa Park",
    authorRole: "Robotics Developer",
    publishedDate: new Date("2024-01-03"),
    readTime: "15 min read",
    category: "tutorials",
    image: "⚙️",
    likes: 312,
    comments: 42,
    featured: false,
    content: "The Robot Operating System (ROS) provides a flexible framework for writing robot software. This tutorial guides you through the process of setting up a ROS environment, creating your first ROS package, and developing a basic robot controller. We cover topics such as ROS nodes, topics, services, and messages, providing practical examples and best practices for building scalable and modular robot applications."
  },
  {
    postId: 7,
    title: "The Ethics of AI in Robotics: Challenges and Solutions",
    excerpt: "Discussing the ethical implications of artificial intelligence in robotics and potential solutions.",
    author: "Dr. Robert Taylor",
    authorRole: "Ethics in AI Researcher",
    publishedDate: new Date("2024-01-01"),
    readTime: "11 min read",
    category: "ai",
    image: "⚖️",
    likes: 267,
    comments: 38,
    featured: false,
    content: "As AI-powered robots become more sophisticated, ethical considerations become paramount. This article explores the challenges posed by autonomous decision-making, bias in AI algorithms, job displacement, and accountability in human-robot interactions. We discuss frameworks and potential solutions for developing ethical AI in robotics, emphasizing the importance of transparency, fairness, and human oversight to ensure responsible technological advancement."
  },
  {
    postId: 8,
    title: "Collaborative Robots: Transforming Human-Robot Interaction",
    excerpt: "How collaborative robots (cobots) are changing the way humans and robots work together.",
    author: "Jennifer Lee",
    authorRole: "Human-Robot Interaction Specialist",
    publishedDate: new Date("2023-12-28"),
    readTime: "7 min read",
    category: "innovation",
    image: "🤝",
    likes: 234,
    comments: 19,
    featured: false,
    content: "Collaborative robots, or cobots, are designed to work safely alongside humans, enhancing productivity and flexibility in various industries. This article examines the technological advancements that enable seamless human-robot collaboration, including force sensors, advanced safety features, and intuitive programming interfaces. We explore real-world examples of cobots in manufacturing, healthcare, and logistics, highlighting their impact on efficiency, ergonomics, and the future of work."
  },
];

const seedBlogPostDatabase = async () => {
  try {
    console.log("📝 Starting blog post database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing blog posts
    console.log("🗑️  Clearing existing blog posts...");
    await BlogPost.deleteMany({});

    // Create new blog posts
    console.log("✍️ Creating blog posts...");
    const createdBlogPosts = await BlogPost.create(seedBlogPosts);
    console.log(`✅ Created ${createdBlogPosts.length} blog posts`);

    console.log("\n📋 Seeding completed for the following blog posts:");
    createdBlogPosts.forEach((post) => {
      console.log(`   ID: ${post.postId}, Title: "${post.title}", Category: ${post.category}, Featured: ${post.featured}`);
    });

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
    console.log("🎉 Blog post seeding completed successfully!");
  } catch (error) {
    console.error("❌ Blog post seeding failed:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBlogPostDatabase();
}

export default seedBlogPostDatabase;
