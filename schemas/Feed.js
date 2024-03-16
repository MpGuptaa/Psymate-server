const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  thumbnail: [mongoose.Mixed],
  description: String,
  videos: [mongoose.Mixed],
  attachment: [mongoose.Mixed],
  images: [mongoose.Mixed],
  learnings: [mongoose.Mixed],
  audio: [mongoose.Mixed],
  type: {
    type: String,
    enum: ["blog", "article", "podcast", "video", "audio", "gallery"],
  },
  likes: [mongoose.Mixed],
  comments: [mongoose.Mixed],
  author: [mongoose.Mixed],
  category: [mongoose.Mixed],
  tags: [mongoose.Mixed],
  content: mongoose.Mixed,
  views: [mongoose.Mixed],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Feed = mongoose.model("Feed", feedSchema);

module.exports = { Feed };
