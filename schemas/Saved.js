const mongoose = require("mongoose");

const savedItemSchema = new mongoose.Schema({
  collectionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  collectionType: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemName: String,
  itemDescription: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Saved = mongoose.model("saved", savedItemSchema);

module.exports = { Saved };
