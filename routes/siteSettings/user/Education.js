const express = require("express");
const router = express.Router();
const { User } = require("../../../schemas/User");

// GET user education
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
          data: user.education,
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

// ADD a new education to user

router.post("/", (req, res) => {
  const { userId, data, itemId } = req.body;
  if (!userId || !itemId || !data) {
    res.status(400).json({
      status: 400,
      message: "Invalid details. Please provide userId, itemId, and data.",
    });
  } else {
    User.findById(userId)
      .then((user) => {
        if (!user) {
          res.status(404).json({
            status: 404,
            message: "User not found",
          });
        } else {
          const existingItemIndex = user.education.findIndex(
            (item) => item.itemId === itemId
          );
          if (existingItemIndex !== -1) {
            const updatedEducation = {
              itemId,
              ...data,
              updatedAt: new Date(),
            };

            user.education.set(existingItemIndex, updatedEducation); // Set the updated education at the specific index

            user.save()
              .then(() => {
                res.json({
                  status: 200,
                  message: "Education updated",
                  data: { userId, itemId, data, user },
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Error. Please try again" });
              });
          } else {
            const newItem = {
              itemId,
              ...data,
              updatedAt: new Date(),
            };

            user.education.push(newItem);

            user.save()
              .then(() => {
                res.json({
                  status: 200,
                  message: "Education added",
                  data: { userId, itemId, data, user },
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Error. Please try again" });
              });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

// UPDATE a user education
router.put("/:userId/:educationId", (req, res) => {
  const userId = req.params.userId;
  const educationId = req.params.educationId;
  const updatedEducation = req.body;

  if (!userId || !educationId || !updatedEducation) {
    res.status(400).json({
      status: 400,
      message:
        "Invalid details. Please provide userId, educationId, and updated education.",
    });
  } else {
    User.findOneAndUpdate(
      { _id: userId, "education._id": educationId },
      { $set: { "education.$": updatedEducation } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          res.status(404).json({
            status: 404,
            message: "User or education not found",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedUser.education,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

// DELETE a user education
router.delete("/:userId/:educationId", (req, res) => {
  const userId = req.params.userId;
  const educationId = req.params.educationId;

  if (!userId || !educationId) {
    res.status(400).json({
      status: 400,
      message: "Invalid details. Please provide userId and educationId.",
    });
  } else {
    User.findByIdAndUpdate(
      userId,
      { $pull: { education: { _id: educationId } } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          res.status(404).json({
            status: 404,
            message: "User or education not found",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedUser.education,
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
