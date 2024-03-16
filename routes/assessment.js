const express = require("express");
const router = express.Router();
const { Assessment } = require("../schemas/User");
const { v4: uuidv4 } = require("uuid");

router.post("/", (req, res) => {
  const uid = uuidv4();
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "No data provided" });
  } else {
    const assessment = new Assessment({ ...data, id: uid });
    assessment
      .save()
      .then(() => {
        res.status(200).json({
          status: 200,
          message: `Successfully created assessment`,
          data: { ...data, id: uid },
        });
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
router.get("/", (req, res) => {
  const id = req.query.id;
  if (!id) {
    Assessment.find().then((result) => {
      if (result === null) {
        res
          .status(200)
          .json({ status: 200, message: "Assessment does not exist" });
      } else {
        res.status(200).json({
          status: 200,
          message: `All assessments sent`,
          data: result,
        });
      }
    });
  } else {
    Assessment.findOne({ _id: id }).then((result) => {
      if (result === null) {
        res
          .status(200)
          .json({ status: 200, message: "Assessment does not exist" });
      } else {
        res.status(200).json({
          status: 200,
          message: `assessment sent`,
          data: result._doc,
        });
      }
    });
  }
});
router.delete("/", (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Assessment.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Assessment does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Assessment`,
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
