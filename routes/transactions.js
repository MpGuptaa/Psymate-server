const express = require("express");
const router = express.Router();
const { Transaction } = require("../schemas/User");
const { v4: uuidv4 } = require("uuid");

router.post("/", (req, res) => {
  const uid = uuidv4();
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "No data provided" });
  } else {
    const transaction = new Transaction({ ...data, id: uid });
    transaction
      .save()
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `Successfully created transaction`,
          data: data
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request"
        });
      });
  }
});

module.exports = router;
