const express = require("express");
const router = express.Router();
const axios = require("axios");

const SHIPROCKET_API_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjM2MDA5NTIsImlzcyI6Imh0dHBzOi8vYXBpdjIuc2hpcHJvY2tldC5pbi92MS9leHRlcm5hbC9hdXRoL2xvZ2luIiwiaWF0IjoxNjg2MjQ1ODY1LCJleHAiOjE2ODcxMDk4NjUsIm5iZiI6MTY4NjI0NTg2NSwianRpIjoib1pNT2Q2QjRmOTBxR0hLdCJ9.nDMX5AAFlN48R0XsRcXdioa0FcDINpaAHwQJQuaVfr4";
const SHIPROCKET_API_BASE_URL = "https://apiv2.shiprocket.in/v1/";

router.post("/create", (req, res) => {
  const { data } = req.body;

  // Validate the data or perform any necessary checks

  // Make a request to the Shiprocket API to create the order
  axios
    .post(`${SHIPROCKET_API_BASE_URL}external/orders/create`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
      },
    })
    .then((response) => {
      const shiprocketOrder = response.data;
      res.json({
        status: 200,
        message: "Order created successfully",
        data: shiprocketOrder,
      });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({
          message: "Error creating Shiprocket order. Please try again",
          error: error,
        });
    });
});
// Get all orders
router.get('/orders', (req, res) => {
  axios.get(`${SHIPROCKET_API_BASE_URL}external/orders`, {
    headers: {
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then((response) => {
      const orders = response.data;
      res.json({
        status: 200,
        message: 'Orders retrieved successfully',
        data: orders,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving orders. Please try again',
        error: error.response.data,
      });
    });
});

// Get integrated channel details
router.get('/channels/:channelId', (req, res) => {
  const { channelId } = req.params;

  axios.get(`${SHIPROCKET_API_BASE_URL}external/channels/${channelId}`, {
    headers: {
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then((response) => {
      const channelDetails = response.data;
      res.json({
        status: 200,
        message: 'Channel details retrieved successfully',
        data: channelDetails,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving channel details. Please try again',
        error: error.response.data,
      });
    });
});

// Get specific order details
router.get('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;

  axios.get(`${SHIPROCKET_API_BASE_URL}external/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then((response) => {
      const orderDetails = response.data;
      res.json({
        status: 200,
        message: 'Order details retrieved successfully',
        data: orderDetails,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving order details. Please try again',
        error: error.response.data,
      });
    });
});

// Update an order
router.put('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { data } = req.body;

  axios.put(`${SHIPROCKET_API_BASE_URL}external/orders/${orderId}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then((response) => {
      const updatedOrder = response.data;
      res.json({
        status: 200,
        message: 'Order updated successfully',
        data: updatedOrder,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error updating order. Please try again',
        error: error.response.data,
      });
    });
});

// Cancel an order
router.post('/orders/:orderId/cancel', (req, res) => {
  const { orderId } = req.params;

  axios.post(`${SHIPROCKET_API_BASE_URL}external/orders/cancel/${orderId}`, null, {
    headers: {
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then(() => {
      res.json({
        status: 200,
        message: 'Order canceled successfully',
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error canceling order. Please try again',
        error: error.response.data,
      });
    });
});

// Generate token
router.post('/generate-token', (req, res) => {
  axios.post(`${SHIPROCKET_API_BASE_URL}auth/login`, req.body)
    .then((response) => {
      const token = response.data.token;
      res.json({
        status: 200,
        message: 'Token generated successfully',
        data: token,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error generating token. Please try again',
        error: error.response.data,
      });
    });
});

// Add new products
router.post('/products', (req, res) => {
  axios.post(`${SHIPROCKET_API_BASE_URL}external/products/add`, req.body, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then((response) => {
      const product = response.data;
      res.json({
        status: 200,
        message: 'Product added successfully',
        data: product,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error adding product. Please try again',
        error: error.response.data,
      });
    });
});

// Get specific product details
router.get('/products/:productId', (req, res) => {
  const { productId } = req.params;

  axios.get(`${SHIPROCKET_API_BASE_URL}external/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then((response) => {
      const productDetails = response.data;
      res.json({
        status: 200,
        message: 'Product details retrieved successfully',
        data: productDetails,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving product details. Please try again',
        error: error.response.data,
      });
    });
});

// Update your inventory
router.put('/products/:productId/inventory', (req, res) => {
  const { productId } = req.params;
  const { data } = req.body;

  axios.put(`${SHIPROCKET_API_BASE_URL}external/products/inventory/${productId}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`,
    },
  })
    .then((response) => {
      const updatedInventory = response.data;
      res.json({
        status: 200,
        message: 'Inventory updated successfully',
        data: updatedInventory,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Error updating inventory. Please try again',
        error: error.response.data,
      });
    });
});

module.exports = router;
