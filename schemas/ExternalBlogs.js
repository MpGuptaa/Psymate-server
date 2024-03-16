const mongoose = require("mongoose");

const ExternalBlogsSchema = new mongoose.Schema({
  href: { type: String },
  displayName: { type: String },
  featuredImage: { type: String },
  description: { type: String },
  type: { type: mongoose.Mixed },
  category: { type: mongoose.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ExternalBlogs = mongoose.model("ExternalBlogs", ExternalBlogsSchema);

module.exports = { ExternalBlogs };
