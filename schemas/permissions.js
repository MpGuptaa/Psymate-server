const mongoose = require("mongoose");

const PermissionsSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  description: { type: String, required: true },
  roles: { type: [mongoose.Mixed], required: true },
  active: { type: mongoose.Mixed, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Permissions = mongoose.model("Permissions", PermissionsSchema);

module.exports = { Permissions };
