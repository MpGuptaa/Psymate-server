const mongoose = require("mongoose");

const OffersSchema = new mongoose.Schema({
  displayName: { type: String },
  title: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  catagories: {
    type: [String],
    default: [],
  },
  enrolled: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  thumbnail: {
    type: [String],
    default: 0,
  },
  images: {
    type: [String],
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Offers = mongoose.model("Offers", OffersSchema);

module.exports = { Offers };
