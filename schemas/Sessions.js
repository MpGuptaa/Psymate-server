const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  establishmentId: String,
  doctorId: String,
  startTime: Date,
  endTime: Date,
  durationMinutes: Number,
  sessionId: String,
  weekdays: mongoose.Mixed,
});

module.exports = mongoose.model("Session", sessionSchema);
