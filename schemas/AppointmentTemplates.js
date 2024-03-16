const mongoose = require("mongoose");

const AppointmentTemplatesSchema = new mongoose.Schema({
  displayName: { type: String },
  bgColor: { type: String },
  duration: { type: String },
  comments: { type: String },
  resource: { type: [mongoose.Mixed] },
  data: { type: [mongoose.Mixed] },  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AppointmentTemplates = mongoose.model(
  "appointmentTemplates",
  AppointmentTemplatesSchema
);

module.exports = { AppointmentTemplates };
