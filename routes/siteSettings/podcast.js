const express = require("express");
const router = express.Router();
const { Podcast } = require("../../schemas/Podcast");

router.get("/all", (req, res) => {
  const search = req.query.search;
  if (search) {
    Podcast.find({ title: { $regex: search, $options: "i" } })
      .then((response) => {
        res.json({ status: 200, data: response, message: `Success` });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  } else {
    Podcast.find()
      .then((response) => {
        res.json({ status: 200, data: response, message: `Success` });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  }
});

router.get("/", (req, res) => {
    const { id } = req.query;
    Podcast.findOne({ _id: id })
      .then((response) => {
        if (response) {
          res.json({ status: 200, data: response, message: `Success` });
        } else {
          res.status(404).json({
            status: 404,
            message: "No data found for the provided id",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  });

router.post("/", (req, res) => {
  const data = req.body;
  console.log(data)
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const form = new Podcast(data);
    form
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { Podcast: form },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

router.put("/", (req, res) => {
  const {id} = req.query;
  const data = req.body;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Podcast.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Podcast does not exist",
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

router.delete("/:id", async (req, res) => {
    try {
      const deletedPodcast = await Podcast.findByIdAndDelete(req.params.id);
  
      if (!deletedPodcast) {
        return res.status(404).json({ error: "Podcast not found" });
      }
  
      res
        .status(200)
        .json({ message: "Podcast deleted successfully", Podcast: deletedPodcast });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
module.exports = router;
