const mongoose = require("mongoose");

const VerticlesSchema = new mongoose.Schema({
  displayName: String,
  thumbnail: String,
  videoUrl: String,
  index: mongoose.Mixed,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Verticles = mongoose.model("Verticles", VerticlesSchema);

module.exports = { Verticles };
