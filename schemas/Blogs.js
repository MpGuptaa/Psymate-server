const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String] },
  index: { type: String, required: true },
  category: { type: [String], },
  tags: { type: [String] },
  thumbnail: { type: String },
  author: {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    displayName: { type: String, required: true },
  },
  publishedDate:{ type: Date,  },
  content: { type: String, required: true },
  socialMedia: {
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = { Blog };
