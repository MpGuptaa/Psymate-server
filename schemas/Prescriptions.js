const mongoose = require("mongoose");

const PrescriptionsSchema = new mongoose.Schema({
  user: mongoose.Mixed,
  createdBy: mongoose.Mixed,
  items: {
    type: [mongoose.Mixed],
    default: [],
  },
  payment: [mongoose.Mixed],
  estimatedCost: { type: mongoose.Mixed },
  careManager: { type: mongoose.Mixed },
  company: { type: mongoose.Mixed },
  notes: { type: String },
  date: {
    type: Date,
    default: Date.now,
  },
  type: { type: mongoose.Mixed },
  reference: { type: mongoose.Mixed },
  appointment: { type: String },
  number: {
    type: String,
  },
  weight: { type: String },
  bloodPressure: { type: String },
  pulse: { type: String },
  respRate: { type: String },
  temperature: { type: String },
  complaints: { type: String },
  diagnoses: { type: String },
  observations: { type: String },
  title: {
    type: String,
    default: "Paid for Prescription at Psymate",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Prescriptions = mongoose.model("Prescriptions", PrescriptionsSchema);

module.exports = { Prescriptions };
