const mongoose = require("mongoose");

const StatusSchema = new mongoose.Schema({
  displayName: String,
  active: mongoose.Mixed,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Status = mongoose.model("Status", StatusSchema);

module.exports = { Status };
