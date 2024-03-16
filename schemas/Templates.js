const mongoose = require("mongoose");

const TemplatesSchema = new mongoose.Schema({
  displayName: { type: String },
  bgColor: { type: String },
  comments: { type: String },
  data: { type: mongoose.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Templates = mongoose.model("Templates", TemplatesSchema);

module.exports = { Templates };
