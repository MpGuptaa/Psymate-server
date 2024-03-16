require("dotenv").config();
const { default: axios } = require("axios");
const FormData = require("form-data");
const express = require("express");
const router = express.Router();

router.get("/accessToken", async (req, res) => {
  var data = new FormData();
  data.append("client_id", "1000.CM4S1G4QH8RB0MLGEP46QI8V8F3Y8O");
  data.append("client_secret", "f7c8f22455680345e784fa22d57e40beb022a7be93");
  data.append("redirect_uri", "https://www.psymate.ai/");
  data.append(
    "refresh_token",
    "1000.5ced792b3307cd7995a0c9ebdb0abad2.d5889496952a0cae0fcf1e03d4a8bc2b"
  );
  data.append("grant_type", "refresh_token");
  var config = {
    method: "post",
    url: "https://accounts.zoho.in/oauth/v2/token",
    headers: {
      ...data.getHeaders()
    },
    data: data
  };
  axios(config)
    .then((response) => {
      console.log("response", response.data);
      return res.status(200).json({
        status: 200,
        data: response.data
      });
    })
    .catch((error) => {
      console.log("error", error);
      res.status(500).send(error);
    });
});

module.exports = router;
