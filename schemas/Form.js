const mongoose = require("mongoose");

const FormsSchema = new mongoose.Schema({
  name: mongoose.Mixed,
  head: mongoose.Mixed,
  displayName: mongoose.Mixed,
  category: mongoose.Mixed,
  hidden: mongoose.Mixed,
  items: [mongoose.Mixed],
});

const Forms = mongoose.model("Forms", FormsSchema);

module.exports = { Forms };
