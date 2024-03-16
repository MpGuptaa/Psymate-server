const express = require("express");
const { Specifiers } = require("../../../../schemas/Specifiers");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, keyword, id } = req.query;
    if (id) {
      const success = await Specifiers.findOne({ _id: id });
      if (success === null) {
        return res.status(200).json({ message: "Medicine does not exist" });
      } else {
        return res
          .status(200)
          .json({ message: "Success", data: { ...success._doc } });
      }
    } else if (search) {
      const response = await Specifiers.find({
        displayName: { $regex: search, $options: "i" },
      });
      return res.json({ status: 200, data: response, message: "Success" });
    } else if (keyword) {
      const response = await Specifiers.find({ displayName: keyword });
      return res.json({ status: 200, data: response, message: "Success" });
    } else {
      const success = await Specifiers.find();
      if (success === null) {
        return res.status(200).json({ message: "Medicine does not exist" });
      } else {
        return res.status(200).json({ message: "Success", data: success });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/", (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(401).json({ status: 401, message: "Invalid details" });
  }

  const { displayName, spectrum } = data;
  const formattedDisorder = displayName.toLowerCase().replace(/\s/g, "_");
  const formattedSpectrum = spectrum.toLowerCase().replace(/\s/g, "_");

  const formattedData = {
    ...data,
    disorder: formattedDisorder,
    spectrum: formattedSpectrum,
  };

  const form = new Specifiers(formattedData);

  form
    .save()
    .then((result) => {
      res.json({ status: 200, message: "Success", data: { specifiers: form } });
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
    Specifiers.findOneAndUpdate({ _id: id }, updateData, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Specifiers does not exist",
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
    Specifiers.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Specifiers does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Specifiers`,
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
