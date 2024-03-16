const express = require("express");
const router = express.Router();
const multer = require("multer");
const tesseract = require("node-tesseract-ocr");
const { performOCR } = require("../../utils/performOCR");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res) => {
  const requestData = Joi.object({
    file: Joi.required(),
  });

  const { error } = requestData.validate({
    file: req.file,
  });

  if (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
  try {
    const ocrResult = await performOCR(req.file.buffer);
    res.send({ result: ocrResult, status: true });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/url", async (req, res) => {
  const requestData = Joi.object({
    url: Joi.required(),
  });

  const { error } = requestData.validate({
    url: req.body.url,
  });

  if (error) {
    return res.status(400).json({ status: 400, message: error.message });
  }
  try {
    const ocrResult = await performOCR(req.body.url);
    res.send({ result: ocrResult, status: true });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;