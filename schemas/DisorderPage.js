const mongoose = require("mongoose");

const DisorderPageSchema = new mongoose.Schema({
  bannerOneHeading: { type: String },
  bannerOneImageURL: { type: [mongoose.Mixed] },
  bannerThreeHeading: { type: String },
  bannerThreeDescription: { type: String },
  bannerFourItems: { type: [mongoose.Mixed] },
  bannerFiveHeading: { type: String },
  bannerFiveItem1: { type: String },
  bannerFiveItem2: { type: String },
  bannerFiveItem3: { type: String },
  bannerFiveItem4: { type: String },
  bannerFiveItem5: { type: String },
  bannerFiveDescription: { type: String },
  bannerSixHeading: { type: String },
  bannerSixItems: { type: [mongoose.Mixed] },
  bannerSevenHeadings: { type: [mongoose.Mixed] },
  bannerSevenItems: { type: [mongoose.Mixed] },
  displayName: { type: String },
  disorderType: { type: mongoose.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const DisorderPage = mongoose.model("DisorderPage", DisorderPageSchema);

module.exports = { DisorderPage };
