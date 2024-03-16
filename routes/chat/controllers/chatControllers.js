const catchAsyncErrors = require("../../../middleware/catchAsyncErrors");
const Chat = require("../../../schemas/Chat");
const Message = require("../../../schemas/Message");

const createChat = catchAsyncErrors(async (req, res) => {
  const { senderId, receiverId } = req.body;
  // senderId: req.user._id,
  if (!senderId || !receiverId) {
    console.log("User's Id not valid with this request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: senderId } } },
      { users: { $elemMatch: { $eq: receiverId } } },
    ],
  }).populate("users", "-password");

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [senderId, receiverId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const sendMessage = catchAsyncErrors(async (req, res) => {
  const { sender, receiver, content } = req.body;

  if (!content) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  var newMessage = {
    sender: sender,
    content: content,
    receiver: receiver,
  };
  try {
    var message = await Message.create(newMessage);
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allChatMessages = catchAsyncErrors(async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const receiverId = req.params.receiverId;
    const messages = await Message.find({
      $or: [
        { "sender._id": senderId, "receiver._id": receiverId },
        { "sender._id": receiverId, "receiver._id": senderId },
      ],
    }).sort({ createdAt: 1 });
    if (!messages) {
      console.log("No messages found");
      return res.sendStatus(400);
    }

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteMessage = catchAsyncErrors(async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findById(messageId);

    if (!message) {
      console.log("Message not found");
      return res.sendStatus(404);
    }

    const activeUserId = req.user._id;

    if (
      message.sender.toString() !== activeUserId.toString() &&
      req.user.role !== "member"
    ) {
      console.log("Unauthorized to delete this message");
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this message" });
    }

    message.isDeleted = true;
    await message.save();

    res.json({
      message: "Message deleted successfully",
      deletedMessage: message,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { createChat, sendMessage, allChatMessages, deleteMessage };
