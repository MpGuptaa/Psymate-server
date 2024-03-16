const express = require("express");
const router = express.Router();
const { PharmacyCart } = require("../../schemas/PharmacyCart");
const { ObjectId } = require("mongodb");

router.post("/", async (req, res) => {
    const cart = req.body
  
    if (!cart) {
      res.status(400).json({ status: 400, message: "Invalid data"});
    }
    try {
      const result = await PharmacyCart.create(cart)

      if (result) {
        res.status(200).json({
          status: 200,
          message: "Cart has been added successfully",
          data: result
        });
      }
    }
    catch(error) {
      res.status(500).json({
        status: 500,
        message: "Error in creating the feed data",
      });
    } 
})
// get cart for a particular user
router.get("/:userId", async (req, res) => {
    const userId = req.params.userId
  
    if (!userId) {
      res.status(400).json({ status: 400, message: "Invalid feed id"});
    }
    try {
      const result = await PharmacyCart.find({ userId: new ObjectId(userId) })
      if (result) {
        res.status(200).json({
          status: 200,
          data: result,
        });
      }
    }
    catch(error) {
      res.status(500).json({
        status: 500,
        message: "Error in fetching the cart details data by userId",
      });
    } 
})

router.put("/:id", async (req, res) => {
    const cartUpdatedData = req.body
    const cartId = req.params.id
  
    if (!cartUpdatedData) {
      res.status(400).json({ status: 400, message: "Invalid feed update data"});
    }
    try {
      const updateDoc = {
        $set: cartUpdatedData
      }
      const result = await PharmacyCart.updateOne({ _id: new ObjectId(cartId) }, updateDoc)
      if (result) {
        const updatedResults = await PharmacyCart.find({ _id: new ObjectId(cartId) })

        res.status(200).json({
          status: 200,
          message: "Cart details has been updated successfully",
          data: updatedResults,
        });
      }
    }
    catch(error) {
      res.status(500).json({
        status: 500,
        message: "Error while updating the cart details",
      });
    } 
})

router.delete("/:id", async (req, res) => {
    const cartId = req.params.id
    if (!cartId) {
      res.status(400).json({ status: 400, message: "Invalid feed id"});
    }
    try {
      const result = await PharmacyCart.deleteOne({ _id: new ObjectId(cartId) })
      if (result) {
        res.status(200).json({
          status: 200,
          message: "Cart data has been deleted successfully",
          data: result,
        });
      }
    }
    catch(error) {
      res.status(500).json({
        status: 500,
        message: "Error while deleting the cart",
      });
    } 
})

module.exports = router;
