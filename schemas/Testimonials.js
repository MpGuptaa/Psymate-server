const mongoose = require("mongoose");

const TestimonialsSchema = new mongoose.Schema({
  displayName: { type: String },
  title: { type: String },
  description: { type: String },
  photoURL: { type: String },
  head: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Testimonials = mongoose.model("Testimonials", TestimonialsSchema);

module.exports = { Testimonials };
