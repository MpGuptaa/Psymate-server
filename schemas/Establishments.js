const mongoose = require("mongoose");

const EstablishmentsSchema = new mongoose.Schema({
  establishmentName: { type: String },
  phone: { type: Number },
  email: { type: String },
  directions: { type: mongoose.Mixed },
  gallery: { type: mongoose.Mixed },
  about: { type: String },
  establishmentAddress: { type: String },
  startTimings: { type: [mongoose.Mixed] },
  endTimings: { type: [mongoose.Mixed] },
  days: { type: [mongoose.Mixed] },
  attachments: { type: [mongoose.Mixed] },
  paymentModes: { type: [mongoose.Mixed] },
  active: { type: mongoose.Mixed },
  logo: { type: String },
  website: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Establishments = mongoose.model("establishments", EstablishmentsSchema);

module.exports = { Establishments };
