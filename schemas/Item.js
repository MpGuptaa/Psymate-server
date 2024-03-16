const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  type: { type: String, required: true, enum: ["goods", "service"] },
  packaging: String,
  unit: mongoose.Schema.Types.Mixed,
  hsn: mongoose.Schema.Types.Mixed,
  taxCategory: mongoose.Schema.Types.Mixed,
  company: mongoose.Schema.Types.Mixed,
  category: mongoose.Schema.Types.Mixed,
  salt: mongoose.Schema.Types.Mixed,
  conversion: mongoose.Schema.Types.Mixed,
  mrp: { type: Number, required: true, default: 0.0 },
  purchaseRate: { type: Number, required: true, default: 0.0 },
  cost: { type: Number, required: true, default: 0.0 },
  sellingRate: { type: Number, required: true, default: 0.0 },
  narcotics: { type: Boolean, default: false },
  scheduleH: { type: Boolean, default: false },
  scheduleH1: { type: Boolean, default: false },
  storageType: {
    type: String,
    enum: ["normal", "costly", "8° storage", "12° storage"],
    default: "normal",
  },
  status: {
    type: String,
    enum: ["continue", "discontinue"],
    default: "continue",
  },
  colourType: { type: String, enum: ["red", "blue", "green", "purple"] },
  tbItem: { type: String, enum: ["TB", "tramadol"] },
  discount: {
    type: String,
    enum: ["applicable", "no discount"],
    default: "applicable",
  },
  quantity: { type: Number, default: 1 },
  reOrderEmail: { type: String }, // Set the reorder days
  minDiscountPercentage: { type: Number, default: 0.0 },
  maxDiscountPercentage: { type: Number, default: 0.0 },
  minQuantity: { type: Number, default: 1 },
  maxQuantity: Number,
  reOrderDays: { type: Number, default: 0 },
  reOrderQuantity: { type: Number, default: 0 },
  minMarginPercentage: { type: Number, default: 0.0 },
  prohibited: { type: Boolean, default: false },
  visibility: { type: Boolean, default: true },
  manufacturer: mongoose.Schema.Types.Mixed,
  photoURL: String,
  crouselImages : { type: Array },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },


});

const Item = mongoose.model("Item", itemSchema);

module.exports = { Item };
