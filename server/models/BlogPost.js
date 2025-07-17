import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    postId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    authorRole: {
      type: String,
      required: true,
      trim: true,
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    readTime: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["robotics", "ai", "technology", "tutorials", "industry", "innovation"], // Ensure categories match frontend
    },
    image: { // This will store the emoji or a URL
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    content: { // Full content of the blog post (optional for list view, but essential for detail page)
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for efficient querying
blogPostSchema.index({ postId: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ featured: 1 });

export default mongoose.model("BlogPost", blogPostSchema);
