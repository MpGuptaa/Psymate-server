const express = require("express");
const router = express.Router();
const { User } = require("../../schemas/User");

// GET user addresses
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
          data: user.addresses,
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

// ADD a new address to user

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
          const existingItemIndex = user.addresses.findIndex(
            (item) => item.itemId === itemId
          );
          if (existingItemIndex !== -1) {
            const updatedAddress = {
              itemId,
              ...data,
              updatedAt: new Date(),
            };

            user.addresses.set(existingItemIndex, updatedAddress); // Set the updated address at the specific index

            user.save()
              .then(() => {
                res.json({
                  status: 200,
                  message: "Address updated",
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

            user.addresses.push(newItem);

            user.save()
              .then(() => {
                res.json({
                  status: 200,
                  message: "Address added",
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



// UPDATE a user address
router.put("/:userId/:addressId", (req, res) => {
  const userId = req.params.userId;
  const addressId = req.params.addressId;
  const updatedAddress = req.body;

  if (!userId || !addressId || !updatedAddress) {
    res.status(400).json({
      status: 400,
      message:
        "Invalid details. Please provide userId, addressId, and updated address.",
    });
  } else {
    User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      { $set: { "addresses.$": updatedAddress } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          res.status(404).json({
            status: 404,
            message: "User or address not found",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedUser.addresses,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

// DELETE a user address
router.delete("/:userId/:addressId", (req, res) => {
  const userId = req.params.userId;
  const addressId = req.params.addressId;

  if (!userId || !addressId) {
    res.status(400).json({
      status: 400,
      message: "Invalid details. Please provide userId and addressId.",
    });
  } else {
    User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          res.status(404).json({
            status: 404,
            message: "User or address not found",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedUser.addresses,
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
