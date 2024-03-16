const mongoose = require("mongoose");

const TimelineSchema = new mongoose.Schema({
  userId: [mongoose.Mixed],
  postId: { type: String, required: true },
  type: mongoose.Mixed,
  notes: { type: String },
  title: {
    type: String,
  },
  reference: mongoose.Mixed,
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updates: mongoose.Mixed,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Timeline = mongoose.model("Timeline", TimelineSchema);

module.exports = { Timeline };
