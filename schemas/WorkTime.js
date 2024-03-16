const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    userId: String,
    date: String,
    TimeLine: [ {clockInTime: String,
    clockOutTime: String,
    totalHours: Number,}], 

});

const Attendance = mongoose.model(
  "Attendance",
  AttendanceSchema
);

module.exports = { Attendance };
