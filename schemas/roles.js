const mongoose = require("mongoose");

const RolesSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: Number, required: true },
  isDeleted: { type: mongoose.Mixed, default: false, required: true },
  active: { type: mongoose.Mixed, default: true, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Roles = mongoose.model("Roles", RolesSchema);

module.exports = { Roles }; 
