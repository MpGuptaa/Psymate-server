require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/confirmed", async (req, res) => {
  try {
    const { phoneNumber, patientName, doctorName, slot, bookingAddress } =
      req.body;
    axios({
      method: "POST",
      url: `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=3ab8b5e9-6e33-11ec-b710-0200cd936042&to=${phoneNumber}&from=PSMATE&templatename=Appointment+Confirmed+Template+1&var1=${patientName}&var2=${
        slot?.split(",")[3] === "Video Consultation" ? "online" : "inclinic"
      }&var3=${doctorName}&var4=${
        slot?.split(",")[0] +
        " " +
        slot?.split(",")[1] +
        " " +
        slot?.split(",")[2]
      }&var5=${
        bookingAddress === "undefined" ? "Google meet" : bookingAddress
      }`,
    })
      .then(function (response) {
        res.json({
          msg: "success",
          response: response,
        });
        console.log("message Sent", response);
      })
      .catch(function (error) {
        console.log("error", error);
        res.json({
          msg: "error",
          response: error,
        });
      });
    console.log("req.body", req.body);

    console.log(res.data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.post("/scheduled", async (req, res) => {
  try {
    const { phoneNumber, patientName, doctorName, slot, bookingAddress } =
      req.body;
    axios({
      method: "POST",
      url: `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=3ab8b5e9-6e33-11ec-b710-0200cd936042&to=${phoneNumber}&from=PSMATE&templatename=Appointment+Scheduled+Template+2&var1=${patientName}&var2=${
        slot?.split(",")[3] === "Video Consultation" ? "online" : "inclinic"
      }&var3=${doctorName}&var4=${
        slot?.split(",")[0] +
        " " +
        slot?.split(",")[1] +
        " " +
        slot?.split(",")[2]
      }&var5=${
        bookingAddress === "undefined" ? "Google meet" : bookingAddress
      }`,
    })
      .then(function (response) {
        res.json({
          msg: "success",
          response: response,
        });
        console.log("message Sent", response);
      })
      .catch(function (error) {
        console.log("error", error);
        res.json({
          msg: "error",
          response: error,
        });
      });
    console.log("req.body", req.body);

    console.log(res.data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
module.exports = router;
