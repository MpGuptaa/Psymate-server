const mongoose = require("mongoose");

const AcademyCategoriesSchema = new mongoose.Schema({
  displayName: { type: String },
  description: { type: String },
  comments: { type: String },
  data: { type: [mongoose.Mixed] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AcademyCategories = mongoose.model("AcademyCategories", AcademyCategoriesSchema);

module.exports = { AcademyCategories };
