const mongoose = require("mongoose");

const PodcastSchema = new mongoose.Schema({
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
  audioLink: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Podcast = mongoose.model("Podcast", PodcastSchema);

module.exports = { Podcast };
