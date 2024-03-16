require("dotenv").config();

const mail = require("@sendgrid/mail");
const router = require("express").Router();
const { generateBookingTemplate } = require("../templates/generateTemplate");
const {
  generateAssessmentTemplate,
} = require("../templates/assessmentTemplate");
const { generateLoginTemplate } = require("../templates/loginTemplate");

mail.setApiKey(process.env.MAIL_KEY);

router.post("/booking", async (req, res) => {
  const {
    patientEmail,
    patientNumber,
    patientName,
    doctorName,
    practiceName,
    appointmentId,
    appointmentDate,
    appointmentSlot,
    toEmail,
    bookingType,
  } = req.body;

  try {
    await mail.send({
      to: toEmail,
      from: process.env.MAIL_FROM,
      subject: `Booking ${bookingType} from Psymate: #${appointmentId}`,
      html: generateBookingTemplate({
        patientEmail,
        patientNumber,
        patientName,
        doctorName,
        practiceName,
        appointmentId,
        appointmentDate,
        appointmentSlot,
        bookingType,
      }),
    });
    res.json({
      msg: "success",
      response: `Booking ${bookingType} sent successfully!`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.post("/login", async (req, res) => {
  const { email, phone, displayName, time, browser, toEmail, returnURL } =
    req.body;

  try {
    await mail.send({
      to: toEmail,
      from: process.env.MAIL_FROM,
      subject: `${displayName} Logged into Psymate at ${time}`,
      html: generateLoginTemplate({
        email,
        phone,
        displayName,
        time,
        browser,
        returnURL,
      }),
    });
    res.json({
      msg: "success",
      response: `Email sent to ${toEmail}!`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.post("/assessments", async (req, res) => {
  const {
    patientEmail,
    patientNumber,
    patientName,
    appointmentId,
    appointmentDate,
    toEmail,
    assessmentName,
  } = req.body;

  try {
    await mail.send({
      to: toEmail,
      from: process.env.MAIL_FROM,
      subject: `Assessment Booking from Psymate: #${appointmentId}`,
      html: generateAssessmentTemplate({
        patientEmail,
        patientNumber,
        patientName,
        appointmentId,
        appointmentDate,
        assessmentName,
      }),
    });
    res.json({
      msg: "success",
      response: `Assessment has been booked successfully!`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
