const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema({
  date: { type: String },
  summary: { type: String },
  displayName: { type: String },
  category: { type: [mongoose.Mixed] },
  tags: { type: [mongoose.Mixed] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const FAQ = mongoose.model("faq", FAQSchema);

module.exports = { FAQ };
