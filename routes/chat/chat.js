const express = require("express");
const { createChat,sendMessage, allChatMessages, deleteMessage } = require("./controllers/chatControllers");
const router = express.Router();

router.route("/send").post(sendMessage);
router.route("/:senderId/:receiverId").get(allChatMessages);
router.route("/:messageId/:userId").put(deleteMessage);

module.exports = router;

