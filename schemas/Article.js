const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  id: String,
  title: String,
  author: {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    displayName: { type: String, required: true },
  },
  keywords: { type: [String] },
  index: { type: String, required: true },
  category: { type: [String], },
  tags: { type: [String] },
  publishedDate:{ type: Date,  },
  content:String,
  date: String,
  description: String,
  thumbnail: String,
  banner: String,
  para1: String,
  para2: String,  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

});

const Article = mongoose.model("Article", articleSchema);

module.exports = { Article };
