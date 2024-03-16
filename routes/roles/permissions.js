const express = require("express");
const router = express.Router();
const { Permissions } = require("../../schemas/permissions");

router.get("/", async (req, res) => {
  try {
    const { search, keyword } = req.query;
    let query = {};
    if (search) {
      query = { displayName: { $regex: search, $options: "i" } };
    } else if (keyword) {
      query = { displayName: keyword };
    }

    const data = await Permissions.find(query);
    if (data.length === 0) {
      return res
        .status(200)
        .json({ status: 200, message: "Component does not exist" });
    }
    return res.status(200).json({ status: 200, message: "Success", data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/", (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(400).json({ status: 400, message: "Invalid details" });
  } else {
    const feed = new Permissions(data);
    console.log({ ...data });
    feed
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { feed: feed },
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
    res.status(400).json({ status: 400, message: "Invalid details" });
  } else {
    Permissions.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({ status: 400, message: "Feed does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully updated feed data",
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
    res.status(400).json({ status: 400, message: "Invalid details" });
  } else {
    Permissions.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({ status: 200, message: "Feed does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Feed`,
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
