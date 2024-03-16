const mongoose = require("mongoose");

const ClinicalDataSchema = new mongoose.Schema({
  patient: { type: mongoose.Mixed },
  doctor: { type: mongoose.Mixed },
  data: { type: mongoose.Mixed },
  comments: { type: mongoose.Mixed },
  reference: mongoose.Mixed,
  form: { type: mongoose.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ClinicalData = mongoose.model("clinical_data", ClinicalDataSchema);

module.exports = { ClinicalData };
