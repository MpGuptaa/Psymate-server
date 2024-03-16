const mongoose = require("mongoose");

const LearnerStoriesSchema = new mongoose.Schema({
  displayName: { type: String },
  description: { type: String },
  comments: { type: String },
  resource: { type: [mongoose.Mixed] },
  data: { type: [mongoose.Mixed] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LearnerStories = mongoose.model("LearnerStories", LearnerStoriesSchema);

module.exports = { LearnerStories };
