const mongoose = require("mongoose");

const SpecifiersSchema = new mongoose.Schema({
  displayName: { type: String },
  spectrum: { type: [mongoose.Mixed] },
  description: { type: String },
  type: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Specifiers = mongoose.model("Specifiers", SpecifiersSchema);

module.exports = { Specifiers };
