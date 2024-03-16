const express = require("express");
const router = express.Router();
const { User } = require("../../schemas/User");

// GET user notifications
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          status: 404,
          message: "User not found",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Success",
          data: user.notifications,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    });
});

// ADD a new notification to user
router.post("/:userId", (req, res) => {
  const userId = req.params.userId;
  const { notification } = req.body;

  if (!userId || !notification) {
    res.status(400).json({
      status: 400,
      message: "Invalid details. Please provide userId and notification.",
    });
  } else {
    User.findByIdAndUpdate(
      userId,
      { $push: { notifications: notification } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          res.status(404).json({
            status: 404,
            message: "User not found",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedUser.notifications,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

// DELETE a user notification
router.delete("/:userId/:notificationId", (req, res) => {
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;

  if (!userId || !notificationId) {
    res.status(400).json({
      status: 400,
      message: "Invalid details. Please provide userId and notificationId.",
    });
  } else {
    User.findByIdAndUpdate(
      userId,
      { $pull: { notifications: { _id: notificationId } } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          res.status(404).json({
            status: 404,
            message: "User or notification not found",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedUser.notifications,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

module.exports = router;
