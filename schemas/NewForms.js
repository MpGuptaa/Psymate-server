const mongoose = require("mongoose");

const NewFormsSchema = new mongoose.Schema({
  name: mongoose.Mixed,
  head: mongoose.Mixed,
  displayName: mongoose.Mixed,
  category: mongoose.Mixed,
  subCategory: mongoose.Mixed,
  URL: mongoose.Mixed,
  options: mongoose.Mixed,
  instructions: mongoose.Mixed,
  psychoeducation: mongoose.Mixed,
  roles: mongoose.Mixed,
  hidden: mongoose.Mixed,
  items: [mongoose.Mixed],
});

const NewForms = mongoose.model("NewForms", NewFormsSchema);

module.exports = { NewForms };
