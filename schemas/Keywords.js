const mongoose = require("mongoose");

const keywordSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 1,
  },
});

const Keyword = mongoose.model("Keyword", keywordSchema);

module.exports = { Keyword };
