const express = require("express");
const router = express.Router();
const { Cart } = require("../../schemas/Cart");
const { Item } = require("../../schemas/Item");
const { Prescriptions } = require("../../schemas/Prescriptions");
const {addToCart}  = require("../../utils/Helper")

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    // If the cart is not found, return an empty cart
    if (!cart) {
      return res.status(200).json({ data: { items: [] } });
    }

    // Retrieve detailed information about each product in the cart
    const cartItems = await Promise.all(
      cart.items.map(async (cartItem) => {
        const product = await Item.findById(cartItem.id);
        return {
          product,
          quantity: cartItem.quantity,
        };
      })
    );
    function reducer(accumulator, currentValue, index) {
      const returns =
        accumulator.product.sellingRate * accumulator.quantity +
        currentValue.product.sellingRate * currentValue.quantity;
      console.log(
        `accumulator: ${accumulator}, currentValue: ${currentValue}, index: ${index}, returns: ${returns}`
      );
      return returns;
    }
    const price = cartItems.reduce((accumulator, item) => {
      const productSellingPrice = item.product.sellingRate * item.quantity;
      return accumulator + productSellingPrice;
    }, 0);

    return res.status(200).json({
      items: cartItems,
      price: Number(price),
      total: cartItems.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



router.post("/add", async (req, res) => {
  try {
    const { userId, items } = req.body;
    console.log(userId, items);
    // Validate product IDs
    const validProductIds = await Item.find({
      _id: { $in: items.map((item) => item.id) },
    });

    if (validProductIds.length !== items.length) {
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    // Create/update cart items
    const cart = addToCart(userId, items)

    res.json({ message: "Items added to the cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/checkout", async (req, res) => {
  try {
    const { user, items } = req.body;
  
    // Validate product IDs
    const validProductIds = await Item.find({
      _id: { $in: items.map((item) => item.id) },
    }); 

    if(validProductIds.length !== items.length){
      return res.status(400).json({ error: "Invalid product IDs" });
    }
    
    const ValidPrescription = await Prescriptions.findOne({user:user._id})

    if(!ValidPrescription){
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    // Create/update cart items
    res.json({ message: "Items added to the cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put(
  "/quantity/:operation/:userId/:productId/:quantity",
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const productId = req.params.productId;
      const operation = req.params.operation;
      const newQuantity = parseInt(req.params.quantity);

      // Validate user ID, product ID, and new quantity
      if (!userId || !productId || isNaN(newQuantity) || newQuantity <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid user, product ID, or quantity" });
      }

      // Find the user's cart
      const cart = await Cart.findOne({ user: userId });

      // If the cart is not found, return an error
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      // Find the index of the product in the cart items
      const productIndex = cart.items.findIndex(
        (item) => item.id === productId
      );

      // If the product is not in the cart, return an error
      if (productIndex === -1) {
        return res.status(404).json({ error: "Product not found in the cart" });
      }
      var currentQuantity = parseInt(cart.items[productIndex].quantity);
      // Update the quantity of the product in the cart
      if (operation == "add") {
        currentQuantity += newQuantity;
      } else if (operation == "subtract") {
        currentQuantity -= newQuantity;
      } else {
        currentQuantity = newQuantity;
      }
      cart.items[productIndex].quantity = currentQuantity;
      // Save the updated cart
      await cart.save().then((res) => {});

      return res.status(200).json({ message: "Quantity updated in the cart" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Cart.findOneAndDelete({ user: userId })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Cart does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Cart`,
            data: { ...success._doc },
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
  }
});

router.delete("/:userId/:productId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;

    // Validate user ID and product ID
    if (!userId || !productId) {
      return res.status(400).json({ error: "Invalid user or product ID" });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    // If the cart is not found, return an error
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the index of the product in the cart items
    const productIndex = cart.items.findIndex((item) => item.id === productId);

    // If the product is not in the cart, return an error
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    // Remove the product from the cart
    cart.items.splice(productIndex, 1);

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: "Product removed from the cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
