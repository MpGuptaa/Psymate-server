const express = require("express");
const router = express.Router();
const { Forms } = require("../../schemas/Form");

router.get("/", (req, res) => {
  const search = req.query.search;
  const keyword = req.query.keyword;
  const id = req.query.id;
  const limit =
    req.query.limit && /^\d+$/.test(req.query.limit)
      ? parseInt(req.query.limit)
      : null; // check if limit is provided and is a positive integer
  let query = Forms.find();

  if (id) {
    query = Forms.findOne({ _id: id });
  } else if (search) {
    query = Forms.find({ displayName: { $regex: search, $options: "i" } });
  } else if (keyword) {
    query = Forms.find({ displayName: keyword });
  }

  if (limit) {
    query = query.limit(limit);
  }

  query
    .then((success) => {
      if (!success) {
        res.status(200).json({ status: 200, message: "Form does not exist" });
      } else {
        res.status(200).json({
          status: 200,
          message: "Success",
          data: success,
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

router.post("/", (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const form = new Forms(data);
    form
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { forms: form },
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
    Forms.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "Forms does not exist" });
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
    Forms.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res
            .status(200)
            .json({ status: 200, message: "Forms does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Forms`,
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
