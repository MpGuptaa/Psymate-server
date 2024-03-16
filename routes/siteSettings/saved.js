const express = require("express");
const { Saved } = require("../../schemas/Saved");
const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    // Calculate the skip value based on page and limit
    const skip = (parsedPage - 1) * parsedLimit;

    // Find all saved items for the user with pagination
    const savedItems = await Saved.find({ userId })
      .skip(skip)
      .limit(parsedLimit);

    // Count the total number of saved items for the user
    const totalSavedItems = await Saved.countDocuments({ userId });

    res.status(200).json({
      status: 200,
      message: "Retrieved saved items",
      savedItems: savedItems,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalSavedItems / parsedLimit),
      totalSavedItems: totalSavedItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.put("/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Extract updated data from the request body
    const { itemName, itemDescription } = req.body;

    // Find the saved item by its ID
    const savedItem = await Saved.findById(itemId);

    if (!savedItem) {
      return res.status(404).json({
        status: 404,
        message: "Saved item not found",
      });
    }

    // Update the saved item
    savedItem.itemName = itemName || savedItem.itemName;
    savedItem.itemDescription = itemDescription || savedItem.itemDescription;

    // Save the updated item
    await savedItem.save();

    res.status(200).json({
      status: 200,
      message: "Item has been updated",
      updatedItem: savedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    // Extract data from the request body
    const {
      collectionId,
      collectionType,
      userId,
      itemId,
      itemName,
      itemDescription,
    } = req.body;

    // Create a new saved item
    const savedItem = new Saved({
      collectionId,
      collectionType,
      userId,
      itemId,
      itemName,
      itemDescription,
      // Add more fields as needed
    });

    // Save the item
    await savedItem.save();

    res.status(200).json({
      status: 200,
      message: "Item has been saved",
      savedItem: savedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.delete("/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Find and delete the saved item by its ID
    const deletedItem = await Saved.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).json({
        status: 404,
        message: "Saved item not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Item has been deleted",
      deletedItem: deletedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

module.exports = router;
