require("dotenv").config();

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadToS3Bucket } = require("../utils/s3Service");
const sendEmail = require("../utils/sendEmail");
const { sendWhatsAppMessage } = require("../utils/Helper");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // if (file.mimetype.split("/")[0] === "image") {
  cb(null, true);
  // } else {
  // cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  // }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 2 },
});

router.post("/upload", upload.array("file"), async (req, res) => {
  try {
    const results = await uploadToS3Bucket(req.files);
    console.log(results);
    return res.json({ status: "success", results });
  } catch (err) {
    console.log(err);
  }
});

router.post("/send/email/", upload.array("file"), async (req, res) => {
  const { subject, url, path, htmlTemplate, email } = req.body;
  try {
    const results = await sendEmail(
      email,
      subject,
      url,
      null,
      path,
      htmlTemplate
    );
    return res.json({ status: `Email sent to ${email}`, results });
  } catch (err) {
    console.log(err);
    return res.json({ status: "Not sent" });
  }
});

router.post("/send/whatsapp", async (req, res) => {
  const { phoneWithCountryCode, message } = req.body;

  try {
    const results = await sendWhatsAppMessage(phoneWithCountryCode, message);
    return res.json({
      status: `WhatsApp message sent to ${phoneWithCountryCode} with template ${template_name}`,
      results,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: `Error sending WhatsApp message to ${phoneWithCountryCode} with template ${template_name}`,
    });
  }
});
module.exports = router;
