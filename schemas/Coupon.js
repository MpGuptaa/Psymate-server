const mongoose = require("mongoose");

const couponUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  used: {
    type: Number,
    required: true,
  },
  usageDate: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields to store additional information about the usage.
});

const couponSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["percentage", "value"],
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  maxUses: {
    type: Number,
    required: true,
    default: 1,
  },
  currentUses: {
    type: Number,
    default: 0,
  },
  deleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  usageHistory: [couponUsageSchema],
});

const Coupon = mongoose.model("Coupons", couponSchema);

module.exports = Coupon;
