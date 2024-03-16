const express = require("express");
const { Symptoms } = require("../../../../schemas/Symptoms");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, keyword, id } = req.query;

    if (id) {
      const success = await Symptoms.findOne({ _id: id });
      if (success === null) {
        return res.status(200).json({ message: "Symptom does not exist" });
      } else {
        return res
          .status(200)
          .json({ status: 200, message: "Success", data: { ...success._doc } });
      }
    } else if (search) {
      const response = await Symptoms.find({
        displayName: { $regex: search, $options: "i" },
      });
      return res.json({ status: 200, data: response, message: "Success" });
    } else if (keyword) {
      const response = await Symptoms.find({ displayName: keyword });
      return res.json({ status: 200, data: response, message: "Success" });
    } else {
      const success = await Symptoms.find();
      if (success === null) {
        return res
          .status(200)
          .json({ status: 400, message: "Symptom does not exist" });
      } else {
        return res
          .status(200)
          .json({ status: 200, message: "Success", data: success });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Server error in processing your request" });
  }
});

router.post("/", (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(401).json({ status: 401, message: "Invalid details" });
  }

  const { disorder, spectrum, thumbnail, displayName } = data;
  console.log(data);

  const formattedDisorder = disorder.toLowerCase().replace(/\s/g, "_");
  const formattedSpectrum = spectrum.toLowerCase().replace(/\s/g, "_");
  const formattedDisplayName = displayName.toLowerCase().replace(/\s/g, "_");

  let formattedThumbnail = thumbnail;
  if (
    !formattedThumbnail ||
    (formattedThumbnail.length === 1 && formattedThumbnail[0] === "")
  ) {
    formattedThumbnail = null;
  }

  const form = new Symptoms({
    ...data,
    disorder: formattedDisorder,
    spectrum: formattedSpectrum,
    displayName: formattedDisplayName,
    thumbnail: formattedThumbnail,
  });
  console.log(form);

  form
    .save()
    .then((result) => {
      res.json({ status: 200, message: "Success", data: { symptoms: form } });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error. Please try again" });
    });
});

router.put("/", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const updateData = { ...data, updatedAt: new Date() };
    Symptoms.findOneAndUpdate({ _id: id }, updateData, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Symptoms does not exist",
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
    Symptoms.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Symptoms does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Symptoms`,
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
