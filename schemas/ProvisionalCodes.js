const mongoose = require("mongoose");

const ProvisionalCodesSchema = new mongoose.Schema({
  spectrum: { type: String },
  disorder: { type: String },
  specifier: { type: String },
  comments: { type: String },
  code: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ProvisionalCodes = mongoose.model("ProvisionalCodes", ProvisionalCodesSchema);

module.exports = { ProvisionalCodes };
