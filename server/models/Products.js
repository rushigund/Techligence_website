import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: { // Corresponds to frontend 'id'
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String, // Matches frontend's string format (e.g., "$12,999")
      required: true,
    },
    priceValue: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: String, // Matches frontend's string format (e.g., "$15,999")
    },
    image: {
      type: String,
      required: true,
    },
    specifications: { // Corresponds to frontend 'specs'
      speed: String,
      payload: String,
      range: String,
      battery: String,
    },
    features: [String],
    rating: { // Corresponds to frontend 'rating' (average)
      type: Number,
      default: 0,
    },
    reviews: { // Corresponds to frontend 'reviews' (count)
      type: Number,
      default: 0,
    },
    inStock: { // Corresponds directly to frontend 'inStock'
      type: Boolean,
      default: true,
    },
    stockCount: { // Corresponds directly to frontend 'stockCount'
      type: Number,
      required: true,
      default: 0,
    },
    shippingTime: { // Corresponds directly to frontend 'shippingTime'
      type: String,
      default: "2-3 days",
    },
    warranty: {
      type: String,
      default: "2 years warranty included",
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Keep createdAt and updatedAt
  }
);

// Simple indexes - still relevant for query performance
productSchema.index({ productId: 1 });
productSchema.index({ category: 1 });

// The 'isInStock' method is removed as the 'inStock' field now directly reflects
// the stock status, simplifying the schema to match the frontend's direct boolean.

export default mongoose.model("Product", productSchema);
