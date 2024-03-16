const express = require("express");
const router = express.Router();
const { Invoice } = require("../../schemas/Invoice");
const { Timeline } = require("../../schemas/Timeline");

router.get("/", (req, res) => {
  const { search, keyword, id, orderID, invoiceId } = req.query;
  let query = {};

  if (id) {
    query = { "user._id": id };
  } else if (search) {
    query = { invoiceId: { $regex: search, $options: "i" } };
  } else if (orderID) {
    query = { _id: orderID };
  } else if (keyword) {
    query = { displayName: keyword };
  } else if (invoiceId) {
    query = { invoiceId: invoiceId };
  }

  Invoice.find(query)
    .then((success) => {
      if (!success) {
        return res
          .status(200)
          .json({ status: 200, message: "User Invoice does not exist" });
      }
      res.status(200).json({ status: 200, message: "Success", data: success });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    });
});

router.post("/", (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    // Calculate the due amount
    const totalPaid = data.payment.reduce((acc, payment) => acc + payment.amtPaid, 0);
    const discountedAmount = data.totalAmount - data.payment[0].discount;
    const status = totalPaid === discountedAmount ? 'Paid' : 'Due';

    // Include the status in the invoice data
    const invoiceData = {
      ...data,
      status: status,
    };

    const form = new Invoice(invoiceData);
    const timeline = {
      postId: data._id,
      userId: [data.user._id, data.createdBy._id],
      type: "orders",
      title: `Order`,
      description: `Order created for ${data.user.displayName} with a total of Rs. ${data.totalAmount}. Invoice Id - ${data.invoiceId} (${status})`,
    };
    const time = new Timeline(timeline);

    form
      .save()
      .then((result) => {
        time.postId = result._id;
        time
          .save()
          .then((result) => {
            res.json({
              status: "200",
              message: status,
              data: { Invoice: form },
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Error In adding to timeline" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error In adding to Invoice" });
      });
  }
});


router.put("/", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Invoice.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Invoice does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully updated form data",
            data: { ...result._doc },
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 500,
          message: "Error. Please try again",
        });
      });
  }
});

router.delete("/", (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Invoice.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Invoice does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Invoice`,
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

module.exports = router;
