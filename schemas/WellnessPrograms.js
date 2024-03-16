const mongoose = require("mongoose");

const WellnessProgramsSchema = new mongoose.Schema({
  displayName: String, // name of the course
  description: String, // brief description of the course
  price: Number, // price of the course in USD
  bgColor: mongoose.Mixed, // duration of the course in weeks
  rating: Number, // average rating of the course on a scale of 1-5
  thumbnail: mongoose.Mixed, // U
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const WellnessPrograms = mongoose.model(
  "WellnessPrograms",
  WellnessProgramsSchema
);

module.exports = { WellnessPrograms };
