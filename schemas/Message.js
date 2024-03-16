const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: Object, ref: "User" },
    receiver: { type: Object, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    isRead: [],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
