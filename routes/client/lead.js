const { User } = require("../../schemas/User");
const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { SiteSettings } = require("../../schemas/SiteSettings");
const { createQuery, parsePhoneNumber } = require("../../utils/Helper");
const config = process.env;
const Joi = require("joi");

router.post("/", async (req, res) => {
  const leadData = req.body; // Assuming lead data is sent in the request body

  if (!(leadData.hasOwnProperty("email") || leadData.hasOwnProperty("phone"))) {
    return res.status(400).json({ error: "Either email or phone is required" });
  }
  if (leadData.hasOwnProperty("email")) {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(leadData.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
  }

  // Check if phone is provided and valid
  if (leadData.hasOwnProperty("phone")) {
    const phoneRegex = /^\d{10,12}$/;
    if (!phoneRegex.test(leadData.phone)) {
      return res
        .status(400)
        .json({
          error: "Invalid phone number format (should be 10 or 12 digits only if has country code)",
        });
    }
  }

  if (parsePhoneNumber(leadData.phone).phone) {
    console.log(`Check ${parsePhoneNumber(leadData.phone).phone}`);

    // Check if the provided Phone is unique
    const existingUserWithPhone = await User.findOne({
      phone: parsePhoneNumber(leadData.phone).phone,
      created: true,
    });

    if (existingUserWithPhone) {
      console.log(
        `${parsePhoneNumber(leadData.phone).countryCode} ${
          parsePhoneNumber(leadData.phone).phone
        } is already registered`
      );
      return res.status(400).json({
        status: 400,
        message: "Phone is already taken.",
      });
    }
  }
  if (leadData.email) {
    console.log(`Check ${leadData.email}`);

    // Check if the provided userId is unique
    const existingUserWithEmail = await User.findOne({
      email: leadData.email,
    });
    if (existingUserWithEmail) {
      console.log(`${leadData.email} is already registered`);

      return res.status(400).json({
        status: 400,
        message: "Email is already taken.",
      });
    }
  }
  try {
    const newLead = new User({
      ...leadData,
      phone: parsePhoneNumber(leadData.phone).phone,
      countryCode: parsePhoneNumber(leadData.phone).countryCode,
      platform: {
        ...req.headers,
      },
      uid: uuidv4(),
      created: false, // Set created to false for leads
    });
    console.log(
      `${parsePhoneNumber(leadData.phone).countryCode} ${
        parsePhoneNumber(leadData.phone).phone
      } is created`
    );
    await newLead.save();

    res.status(200).json({
      status: 200,
      message: "Successfully created lead",
      data: { ...newLead },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.put("/lead/convert/:leadId", async (req, res) => {
  const leadId = req.params.leadId;
  const leadData = req.body; // Assuming lead data is sent in the request body

  const token = jwt.sign({ userId: leadId }, config.JWT_SECRET, {
    expiresIn: "12h",
  });

  if (!req.body.type) {
    return res.status(404).json({
      status: 404,
      message: "Type not found",
    });
  }

  let existingSettings = await SiteSettings.findOne();
  if (!existingSettings) {
    existingSettings = new SiteSettings();
  }

  existingSettings.psyID += 1;
  const psyID = existingSettings.psyID;

  try {
    const lead = await User.findOne({
      _id: new ObjectId(leadId),
      created: false,
    });

    if (!lead) {
      return res.status(404).json({
        status: 404,
        message: "Lead not found",
      });
    }

    lead.created = true;
    Object.assign(lead, leadData);
    Object.assign(psyID, psyID);

    await lead.save();

    res.status(200).json({
      status: 200,
      message: "Lead status updated successfully",
      data: { ...lead, jwt: token },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

module.exports = router;
