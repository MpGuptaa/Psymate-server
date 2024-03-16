const mongoose = require("mongoose");

const PharmacyCartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  medicineId : {
    type: String,
    required: true
  },
  amt: { type: Number },
  medicineName: { type: String },
  medicineDescription: { type: String },
  thumbnail: { type: String },
  quantity: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PharmacyCart = mongoose.model("PharmacyCart", PharmacyCartSchema);

module.exports = { PharmacyCart };
