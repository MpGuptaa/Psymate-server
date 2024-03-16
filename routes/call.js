require("dotenv").config();
const express = require("express");
const router = express.Router();
const btoa = require("btoa");
const { default: axios } = require("axios");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const get_data = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const xmlResponse = await response.text();
    return { statusCode: 200, data: xmlResponse };
  } catch (error) {
    return { statusCode: 500, error };
  }
};

router.post("/users", async (req, res) => {
  const fromPhoneNumber = req.body.from;
  const toPhoneNumber = req.body.to;
  const url = "https://api.exotel.com/v1/Accounts/psymate2/Calls/connect";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(
        `${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}`
      )}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `From=${fromPhoneNumber}&To=${toPhoneNumber}&CallerId=${process.env.EXOTEL_CALLER_ID}`,
  };
  fetch(url, options)
    .then((response) => {
      console.log("response", response);
      return res.json();
    })
    .then((json) => {
      console.log("JSON", json);
      if (statusCode.statusCode == 200) {
        return res.status(200).json({ msg: "Call Triggered Successfully" });
      }
    })
    .catch((err) => {
      console.log("err", err);
      return res.status(500).json({ msg: "Error while connecting call" });
    });
});

router.get("/callDetails", async (req, res) => {
  const url = "https://api.exotel.com/v1/Accounts/psymate2/Calls";
  const options = {
    method: "GET",
    headers: {
      Authorization: `Basic ${btoa(
        `${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}`
      )}`,
      "Content-Type": "application/json",
    },
  };
  const response = await get_data(url, options);
  if (response.statusCode == 200) {
    return res.status(200).json({ data: response.data });
  }
  return res.status(500).json({ msg: response.error });
});

router.post("/sms", async (req, res) => {
  const fromPhoneNumber = req.body.from;
  const toPhoneNumber = req.body.to;
  const url = "https://api.exotel.com/v1/Accounts/psymate2/Sms/send.json";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(
        `${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}`
      )}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `From=${fromPhoneNumber}&To=${toPhoneNumber}&body=Hi I am Yash Jain`,
  };
  axios
    .post(url, options)
    .then((resp) => {
      console.log(resp);
      return res.status(200).json({ data: "Success" });
    })
    .catch((resp) => {
      console.log(resp);
      return res.status(200).json({ data: "error" });
    });
});

module.exports = router;
