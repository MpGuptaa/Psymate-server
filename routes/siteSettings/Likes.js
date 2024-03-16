const express = require("express");
const router = express.Router();
const { User } = require("../../schemas/User");
const { v4: uuidv4 } = require("uuid");

router.get("/", (req, res) => {
  const search = req.query.search;
  const keyword = req.query.keyword;
  const id = req.query.id;

  if (id) {
    User.findOne({ _id: id })
      .then((user) => {
        if (user === null) {
          res.status(200).json({ status: 200, message: "User does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Success",
            data: user.likes,
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
  } else if (search) {
    User.find({ displayName: { $regex: search, $options: "i" } })
      .then((users) => {
        const likes = users.map((user) => user.likes).flat();
        res.status(200).json({ status: 200, data: likes, message: "Success" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  } else if (keyword) {
    User.find({ displayName: keyword })
      .then((users) => {
        const likes = users.map((user) => user.likes).flat();
        res.status(200).json({ status: 200, data: likes, message: "Success" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  } else {
    User.find()
      .then((users) => {
        const likes = users.map((user) => user.likes).flat();
        res.status(200).json({ status: 200, data: likes, message: "Success" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  }
});

// POST a new liked item
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
          const existingItemIndex = user.likes.findIndex(
            (item) => item.itemId === itemId
          );
          if (existingItemIndex !== -1) {
            user.likes.splice(existingItemIndex, 1); // Remove the duplicate item
            user.save();

            res.json({
              status: 200,
              message: "Item unliked",
              data: { userId, itemId, user: user },
            });
          } else {
            const newItem = {
              itemId,
              ...data,
              updatedAt: new Date(),
            };

            user.likes.push(newItem);
            user.save();
            res.json({
              status: 200,
              message: "Item liked",
              data: { userId, itemId, data, user: user },
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

// DELETE a liked item
router.delete("/:userId/:itemId", (req, res) => {
  const { userId, itemId } = req.params;

  User.findByIdAndUpdate(userId, { $pull: { likes: itemId } }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).json({
          status: 404,
          message: "User not found",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Successfully removed liked item",
          data: { userId, itemId },
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

module.exports = router;
