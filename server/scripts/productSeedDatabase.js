import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Products.js"; // Adjust path to your Product Mongoose model

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/techligence";

const seedProducts = [
  {
    productId: 1,
    name: "RoboTech Explorer Pro",
    category: "exploration",
    price: "$12,999",
    priceValue: 12999, // Added priceValue
    originalPrice: "$15,999",
    rating: 4.8,
    reviews: 324,
    image: "🤖",
    description: "Advanced 4WD exploration robot with AI-powered autonomous navigation and environmental mapping capabilities.",
    features: [
      "360° LiDAR Mapping",
      "AI Obstacle Avoidance",
      "12-Hour Battery Life",
      "Weather Resistant IP67",
      "Real-time Data Streaming",
    ],
    specifications: {
      speed: "5 m/s",
      payload: "15 kg",
      range: "10 km",
      battery: "12 hours",
    },
    inStock: true,
    stockCount: 12,
    shippingTime: "2-3 days",
    warranty: "2 years",
  },
  {
    productId: 2,
    name: "Industrial Titan X1",
    category: "industrial",
    price: "$24,999",
    priceValue: 24999, // Added priceValue
    originalPrice: "$29,999",
    rating: 4.9,
    reviews: 156,
    image: "🏗️",
    description: "Heavy-duty 4WD industrial robot designed for manufacturing environments with precision control and safety systems.",
    features: [
      "50kg Payload Capacity",
      "Precision Actuators",
      "Safety Monitoring",
      "Integration APIs",
      "24/7 Operation Ready",
    ],
    specifications: {
      speed: "3 m/s",
      payload: "50 kg",
      range: "Unlimited",
      battery: "Wired/Battery",
    },
    inStock: true,
    stockCount: 8,
    shippingTime: "5-7 days",
    warranty: "3 years",
  },
  {
    productId: 3,
    name: "Swift Scout V2",
    category: "surveillance",
    price: "$8,999",
    priceValue: 8999, // Added priceValue
    originalPrice: "$9,999",
    rating: 4.7,
    reviews: 89,
    image: "👁️",
    description: "Compact 4WD surveillance robot with advanced camera systems and silent operation for security applications.",
    features: [
      "4K Night Vision",
      "Silent Operation",
      "Motion Detection",
      "Remote Control",
      "Cloud Recording",
    ],
    specifications: {
      speed: "8 m/s",
      payload: "5 kg",
      range: "5 km",
      battery: "8 hours",
    },
    inStock: true,
    stockCount: 15,
    shippingTime: "1-2 days",
    warranty: "1 year",
  },
  {
    productId: 4,
    name: "Research Rover Alpha",
    category: "research",
    price: "$18,999",
    priceValue: 18999, // Added priceValue
    originalPrice: "$21,999",
    rating: 4.6,
    reviews: 67,
    image: "🔬",
    description: "Scientific 4WD research robot equipped with modular sensor arrays and data collection systems for laboratory use.",
    features: [
      "Modular Sensors",
      "Data Logging",
      "Sterile Operation",
      "Precise Positioning",
      "Remote Monitoring",
    ],
    specifications: {
      speed: "2 m/s",
      payload: "20 kg",
      range: "Indoor",
      battery: "16 hours",
    },
    inStock: true,
    stockCount: 5,
    shippingTime: "3-5 days",
    warranty: "2 years",
  },
];

const seedProductDatabase = async () => {
  try {
    console.log("📦 Starting product database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    console.log("🗑️  Clearing existing products...");
    await Product.deleteMany({});

    // Create new products
    console.log("🤖 Creating products...");
    const createdProducts = await Product.create(seedProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log("\n📋 Seeding completed for the following products:");
    createdProducts.forEach((product) => {
      console.log(`   ID: ${product.productId}, Name: ${product.name}, Category: ${product.category}, Price Value: ${product.priceValue}`);
    });

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
    console.log("🎉 Product seeding completed successfully!");
  } catch (error) {
    console.error("❌ Product seeding failed:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProductDatabase();
}

export default seedProductDatabase;
