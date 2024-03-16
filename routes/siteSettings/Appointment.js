const express = require("express");
const router = express.Router();
const { Appointment } = require("../../schemas/Appointment");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongodb");
const { createQuery } = require("../../utils/Helper");

// Get all appointments
router.get("/", (req, res) => {
  const {
    search,
    keyword,
    id,
    invoiceId,
    searchBy,
    exact,
    boolean,
    operation,
    operator,
  } = req.query;
  let query = createQuery(search, searchBy, exact, boolean, operation, operator);


  Appointment.find(query)
    .then((success) => {
      if (!success) {
        return res
          .status(200)
          .json({ status: 200, message: "User Appointment does not exist" });
      }
      res.status(200).json({ status: 200, message: "Success", data: success });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    });
});
// Get appointment by ID
router.get("/:id", (req, res) => {
  const appointmentId = req.params.id;

  Appointment.findById(new ObjectId(appointmentId))
    .then((appointment) => {
      if (!appointment) {
        res.status(404).json({
          status: 404,
          message: "Appointment not found",
        });
      } else {
        res.json({
          status: 200,
          message: "Appointment found",
          data: appointment,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error. Please try again" });
    });
});
// Get appointments by doctor ID
router.get("/doctor/:id", (req, res) => {
  const doctorId = req.params.id;

  Appointment.find({ "doctor._id": doctorId })
    .then((appointments) => {
      res.json({
        status: 200,
        message: "Appointments found",
        data: appointments,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error. Please try again" });
    });
});
// Get appointments by patient ID, phone number, or email
router.get("/patient/:id", (req, res) => {
  const identifier = req.params.id;

  // Check if the identifier is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    // If it's a valid ObjectId, search by patient ID
    Appointment.find({ "patient._id": identifier })
      .sort({ createdAt: 1 }) // Sort by createdAt in descending order
      .then((appointments) => {
        res.json({
          status: 200,
          message: "Appointments found",
          data: appointments,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  } else {
    // If it's not a valid ObjectId, search by phone number or email
    Appointment.find({
      $or: [{ "patient.phone": identifier }, { "patient.email": identifier }],
    })
      .sort({ createdAt: 1 }) // Sort by createdAt in descending order
      .then((appointments) => {
        res.json({
          status: 200,
          message: "Appointments found",
          data: appointments,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

module.exports = router;
