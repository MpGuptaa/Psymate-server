const express = require("express");
const router = express.Router();
const Coupon = require("../../schemas/Coupon");
const { User } = require("../../schemas/User");
const { ObjectId } = require("mongodb");

// Get coupon by ID
router.get("/:couponId?", async (req, res) => {
  try {
    if (req.params.couponId) {
      // If a specific couponId is provided, find and return that coupon
      const coupon = await Coupon.findById(req.params.couponId);

      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      res.json(coupon);
    } else {
      // If no specific couponId is provided, return all coupons
      const coupons = await Coupon.find();

      if (!coupons) {
        return res.status(404).json({ error: "No coupons found" });
      }

      res.json(coupons);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new coupon
router.post("/", async (req, res) => {
  try {
    // Check if a coupon with the same name already exists
    const existingCoupon = await Coupon.findOne({
      displayName: req.body.displayName,
    });

    if (existingCoupon) {
      // Respond with an error message indicating that the name is already taken
      return res.status(400).json({ error: "Coupon name is already taken" });
    }

    const coupon = new Coupon(req.body);
    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

// Update maxUses for a coupon
router.put("/:couponId", async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.couponId);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    coupon.maxUses = req.body.maxUses;
    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate a coupon
router.put("/deactivate/:couponId", async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.couponId);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    coupon.deleted = false;
    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Redeem a coupon
router.post("/redeem/:couponCode/:userId", async (req, res) => {
  try {
    const { userId, couponCode } = req.params;
    // {"phone":"8770183178"}
    // Find the coupon by its ID
    const coupon = await Coupon.findOne({ displayName: couponCode });
    if (!coupon) {
      return res.status(400).json({ error: "Coupon not found" });
    }

    // Check if the coupon is active and of type "value"
    if (coupon.deleted) {
      return res.status(400).json({ error: "Coupon is deactivated" });
    }

    if (coupon.type !== "value") {
      return res.status(400).json({ error: "Coupon type is not 'value'" });
    }

    const noOfUses = await Coupon.findOne(
      {
        displayName: couponCode,
        "usageHistory.userId": { $in: [new ObjectId(userId)] },
      },
      {
        "usageHistory.$": 1,
        maxUses: 1,
        _id: 0,
      }
    );

    if (!noOfUses) {
      // Calculate the value to add to the user's balance
      const valueToAdd = coupon.discount; // Replace with the actual field name containing the value
      // Add the value to the user's balance (Update this code based on your user model)
      const updatedUser = await User.updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { balance: Number(valueToAdd) } }
      );
      if (updatedUser.matchedCount > 0) {
        return res.status(200).json({
          message: `User Not Found`,
          status: 404,
        });
      } else if (updatedUser.modifiedCount > 0) {
        return res.status(200).json({
          message: `Not Able to Update The User's Balance`,
          status: 404,
        });
      }

      const update = {
        $push: {
          usageHistory: { userId: userId, used: 1 },
        },
        $inc: { currentUses: 1 },
      };
      const updatedCoupon = await Coupon.updateOne(
        { displayName: couponCode },
        update
      );

      res.status(200).json({
        message: `${valueToAdd} added in psymate wallet`,
        status: 200,
        data: valueToAdd,
      });
    } else {
      res.status(200).json({ message: "Coupon already used", status: 403 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check coupon validity for a user
router.get("/validate/:couponCode/:userId", async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      displayName: req.params.couponCode,
      deleted: false,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ error: "Coupon does not exists or Expired" });
    }
    const noOfUses = await Coupon.findOne(
      {
        displayName: req.params.couponCode,
        "usageHistory.userId": { $in: [new ObjectId(req.params.userId)] },
      },
      {
        "usageHistory.$": 1,
        maxUses: 1,
        deleted: 1,
        _id: 0,
      }
    );
    if (noOfUses) {
      return res.json({
        status: 200,
        valid: false,
        message: "Coupon Is Already Used",
      });
    }
    return res.json({
      status: 200,
      valid: true,
      message: "Coupon is valid",
      coupon: {
        displayName: coupon.displayName,
        type: coupon.type,
        discount: coupon.discount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
