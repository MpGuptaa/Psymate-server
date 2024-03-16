const mongoose = require("mongoose");

const SymptomsSchema = new mongoose.Schema({
  displayName: { type: String },
  spectrum: { type: [mongoose.Mixed] },
  description: { type: String },
  colorCode: { type: String },
  disorder: { type: mongoose.Mixed },
  thumbnail: { type: [mongoose.Mixed] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Symptoms = mongoose.model("Symptoms", SymptomsSchema);

module.exports = { Symptoms };
