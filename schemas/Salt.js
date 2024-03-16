const mongoose = require("mongoose");

const saltSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  drugInteractions: { type: String },
  specialPrecautions: { type: String },
  note: { type: String },
  indication: { type: String },
  dosage: mongoose.Schema.Types.Mixed,
  sideEffects: mongoose.Schema.Types.Mixed,
  narcotics: { type: Boolean, default: false },
  scheduleH: { type: Boolean, default: false },
  scheduleH1: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["continue", "discontinue"],
    default: "continue",
  },
  tbItem: { type: String, enum: ["TB", "tramadol"] },
  discount: {
    type: String,
    enum: ["applicable", "no discount"],
    default: "applicable",
  },
  prohibited: { type: Boolean, default: false },
  visibility: { type: Boolean, default: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Salt = mongoose.model("Salt", saltSchema);

module.exports = { Salt };
