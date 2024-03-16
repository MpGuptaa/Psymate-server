const express = require("express");
const router = express.Router();
const { paginateQuery, sendWhatsAppMessage } = require("../../utils/Helper");
const { Item } = require("../../schemas/Item");
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
  try {
    const { search, keyword, name, searchBy, page = 1, limit = 10 } = req.query;
    let query = { status: { $ne: "discontinue" } };
    if (name) {
      query = { name: name };
    } else if (search) {
      query = {
        [searchBy ? searchBy : "category"]: { $regex: search, $options: "i" },
      };
    } else if (keyword) {
      query = { name: keyword };
    }

    // Get the total count of documents that match the query
    const totalDocuments = await Item.countDocuments(query);

    // Create a paginated query using the paginateQuery function
    const paginatedQuery = paginateQuery(
      Item.find(query),
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    // Execute the paginated query
    const data = await paginatedQuery.exec();

    if (data.length === 0) {
      return res
        .status(200)
        .json({ status: 200, message: "Component does not exist" });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: new ObjectId(req.params.id),
      status: "continue",
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    // Check if an item with the same display name and type already exists
    const existingItem = await Item.findOne({
      displayName: req.body.displayName,
      type: req.body.type,
    });

    if (existingItem) {
      return res.status(400).json({ message: "Item already exists" });
    }

    // Create a new item
    const item = new Item(req.body);
    await item.save();

    await sendWhatsAppMessage("916399006060", {
      template_name: "stock_updates",
      broadcast_name: "stock_updates",
      parameters: [
        { name: "patient_name", value: "PSYMATE PHARMACY" },
        { name: "display_name", value: item.displayName },
        { name: "quantity_change", value: `+${item.quantity}` },
        { name: "stock", value: item.quantity },
      ],
    });

    res.status(200).json({ message: ``, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update the status of an item
router.put("/status/:id/:status", async (req, res) => {
  try {
    const itemId = req.params.id;
    const newStatus = req.params.status; // Assuming you pass the new status in the request parameters

    // Find the item based on its _id
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status === newStatus) {
      return res
        .status(400)
        .json({ message: "Status is already set to " + newStatus });
    }

    // Update the status
    item.status = newStatus;

    // Save the updated item
    await item.save();

    await sendWhatsAppMessage("916399006060", {
      template_name: "stock_updates",
      broadcast_name: "stock_updates",
      parameters: [
        { name: "patient_name", value: "PSYMATE PHARMACY" },
        { name: "display_name", value: item.displayName },
        { name: "quantity_change", value: `${item.status.toUpperCase()}` },
        { name: "stock", value: item.quantity },
      ],
    });

    res.status(200).json({ message: `Status Changed to ${newStatus}`, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;

    // Find the item based on _id
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update the item's fields based on the request body
    Object.assign(item, req.body);

    // Save the updated item
    await item.save();

    res.status(200).json({ message: "", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product based on _id
    const product = await Item.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Send a WhatsApp template message or any other notifications if needed

    await sendWhatsAppMessage("916399006060", {
      template_name: "stock_updates",
      broadcast_name: "stock_updates",
      parameters: [
        { name: "patient_name", value: "PSYMATE PHARMACY" },
        { name: "display_name", value: product.displayName },
        { name: "quantity_change", value: `-${product.quantity}` },
        { name: "stock", value: product.quantity },
      ],
    });

    // Update the quantity to 0 and status to discontinue
    product.quantity = 0;
    product.status = "discontinue";

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: "Item Marked as discontinued",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add items to stock
router.post("/increase/:id/:quantity", async (req, res) => {
  try {
    const itemId = req.params.id;
    const quantityToAdd = Number(req.params.quantity);

    const item = await Item.findOne({
      _id: new ObjectId(itemId),
      status: "continue",
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update the stock quantity
    item.quantity = (item.quantity || 0) + quantityToAdd;
    await item.save();

    const message = {
      template_name: "stock_updates",
      broadcast_name: "stock_updates",
      parameters: [
        { name: "patient_name", value: "Psymate Healthcare" },
        { name: "display_name", value: item.displayName },
        { name: "quantity_change", value: `+${quantityToAdd}` },
        { name: "stock", value: item.quantity },
      ],
    };

    await sendWhatsAppMessage("916399006060", message);

    res.status(200).json({
      message: `${quantityToAdd} units added to ${item.displayName}`,
      item,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decrease stock
router.post("/decrease/:id/:quantity", async (req, res) => {
  try {
    const itemId = req.params.id;
    const quantityToDecrease = Number(req.params.quantity);

    const item = await Item.findOne({
      _id: new ObjectId(itemId),
      status: "continue",
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!item.quantity || item.quantity < quantityToDecrease) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Update the stock quantity
    item.quantity -= quantityToDecrease;
    await item.save();

    // Send a WhatsApp template message
    // const message = {
    //   template_name: "stock_updates",
    //   broadcast_name: "stock_updates",
    //   parameters: [
    //     { name: "patient_name", value: "Psymate Healthcare" },
    //     { name: "display_name", value: item.displayName },
    //     { name: "quantity_change", value: `-${quantityToDecrease}` },
    //     { name: "stock", value: item.quantity },
    //   ],
    // };

    // await sendWhatsAppMessage("916399006060", message);

    res.status(200).json({
      message: `${quantityToDecrease} units taken from ${item.displayName}`,
      item,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
