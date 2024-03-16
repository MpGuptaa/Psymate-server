const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  displayName: { type: String },
  bgColor: { type: String },
  duration: { type: String },
  comments: { type: String },
  patient: { type: mongoose.Mixed },
  slot: { type: String },
  appointmentDate: { type: String },
  bookingId: { type: String },
  coupon: { type: mongoose.Mixed, default: null },
  amtPaid: { type: String },
  category: { type: mongoose.Mixed },
  slot_initials: { type: mongoose.Mixed },
  orderId: { type: String },
  todayDate: { type: String },
  paymentId: { type: String },
  doctor: { type: mongoose.Mixed },
  establishment: { type: mongoose.Mixed },
  status: { type: String },
  type: { type: String },
  platform: { type: mongoose.Mixed },
  start: { type: String },
  deleted: { type: Boolean },
  end: { type: String },
  groupId: { type: String },
  bookingType: { type: String },
  comments: { type: mongoose.Mixed },
  title: { type: String },
  data: { type: mongoose.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  startTime: { type: mongoose.Mixed },
  endTime: { type: mongoose.Mixed },
  dueAmount: { type: Number },
  payment: { type: mongoose.Mixed },
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

module.exports = { Appointment };
