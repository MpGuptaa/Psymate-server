const mongoose = require("mongoose");

const latestFeedsSchema = new mongoose.Schema({
  rank: {
    type: Number
  },
  feedType: {
    type: String,
    enum: ["video", "timesofindia", "indianexpress", "timesnow", "news18", "indiatoday", "music", "podcast"],
  },
  feedTitle: {
    type: String
  },
  feedDescription: {
    type: String
  },
  feedLink: {
    type: String
  },
  publisherId: {
    type: String
  },
  publisherName: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "draft", "active", "inactive"],
  },
  updatedDate: { type: Date, default: Date.now },
  createdDate: { type: Date, default: Date.now },
});

const LatestFeeds = mongoose.model("LatestFeeds", latestFeedsSchema);

module.exports = { LatestFeeds };
