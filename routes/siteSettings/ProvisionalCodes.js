const express = require("express");
const router = express.Router();
const { ProvisionalCodes } = require("../../schemas/ProvisionalCodes");

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

  ProvisionalCodes.find(query)
    .then((success) => {
      if (!success) {
        return res
          .status(200)
          .json({ status: 200, message: "User ProvisionalCodes does not exist" });
      }
      res.status(200).json({ status: 200, message: "Success", data: success });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({
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
    const form = new ProvisionalCodes(data);
    form
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { ProvisionalCodes: form },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

router.put("/", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const updateData = { ...data, updatedAt: new Date() };
    ProvisionalCodes.findOneAndUpdate({ _id: id }, updateData, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "ProvisionalCodes does not exist",
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
    ProvisionalCodes.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "ProvisionalCodes does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted ProvisionalCodes`,
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
