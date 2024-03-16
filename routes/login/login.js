const express = require("express");
const router = express.Router();
const { User } = require("../../schemas/User");
const { Project } = require('../../schemas/Project');
const otpGenerator = require("otp-generator");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const config = process.env;
const jwt = require("jsonwebtoken");
const { SiteSettings } = require("../../schemas/SiteSettings");
const qr = require("qrcode");
const fs = require("fs"); // Import the built-in 'fs' library to read the PDF file
const { uploadToS3Bucket } = require("../../utils/s3Service");
const {
  sendPatientEmail,
  sendWhatsAppMessage,
  decryptData,
  encryptData,
  parsePhoneNumber,
  parseDisplayName,
  sendOtp,
} = require("../../utils/Helper");
const { generateOTPTemplate } = require("../../templates/otpTemplate");
const Joi = require("joi");
const sendEmail = require("../../utils/sendEmail");

const testingNumbers = [
  "1111111111",
  "2222222222",
  "3333333333",
  "4444444444",
  "5555555555",
  "6666666666",
  "7777777777",
  "8888888888",
  "9999999999",
  "8871327980",
  // "8815630135",
  "8770183178",
  "9753112076",
  "9753706498",
  "6399101000",
];

router.get("/:credential", async (req, res) => {
  try {
    const { credential } = req.params;
    console.log("cred-", credential);

    const validation = Joi.object({
      credential: Joi.number().required(),
    });

    const { error } = validation.validate({
      credential,
    });

    if (error) {
      console.log(error.message, "/:credential/");
      return res.status(400).json({ error: error.message });
    }
    const phone = parsePhoneNumber(credential).phone;
    console.log("phone-", phone);
    if (!phone) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid User phones" });
    }

    let otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("otp-", otp);

    if (testingNumbers.indexOf(phone) !== -1) {
      otp = "000000";
      console.log("OTP not sent to testing Numbers");
    } else {
      await sendOtp(phone, otp);
    }

    const encryptedOtp = encryptData(otp);

    const result = await User.findOneAndUpdate(
      { $or: [{ phone: phone }, { phoneNumber: phone }], created: true },
      { $set: { otp: encryptedOtp } }
    );

    try {
      if (result === null) {
        const lead = new User({
          countryCode: parsePhoneNumber(credential).countryCode,
          phone: parsePhoneNumber(credential).phone,
          otp: encryptedOtp,
          platform: {
            ...req.headers,
          },
          uid: uuidv4(),
          type: "lead",
          created: false,
        });

        await lead.save();

        console.log(`Lead created for ${parsePhoneNumber(credential).phone}`);
        return res.status(200).json({
          status: 200,
          login: false,
          message: `User with ${parsePhoneNumber(credential).countryCode} ${parsePhoneNumber(credential).phone
            } is not registered`,
        });
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      return res.status(500).json({
        status: 500,
        login: false,
        message: "Internal Server Error",
      });
    }

    const token = jwt.sign({ userId: result._doc.uid }, config.JWT_SECRET, {
      expiresIn: "12h",
    });

    return res.status(200).json({
      status: 200,
      login: true,

      message: `OTP sent to ${parsePhoneNumber(credential).countryCode} ${parsePhoneNumber(credential).phone
        } on SMS`,
      userData: { ...result._doc, jwt: token },

      message: `OTP sent to ${parsePhoneNumber(credential).countryCode} ${
        parsePhoneNumber(credential).phone
      } on SMS`,

    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/verify/:credential/:otp", async (req, res) => {
  try {
    const { credential, otp } = req.params;

    const validation = Joi.object({
      credential: Joi.number().required(),
      otp: Joi.number().required(),
    });

    const { error } = validation.validate({
      credential,
      otp,
    });

    if (error) {
      console.log(error.message, "verify/:credential/:otp");
      return res.status(400).json({ error: error.message });
    }

    const phone = parsePhoneNumber(credential).phone;

    const user = await User.findOne({
      $or: [{ phone: phone }, { phoneNumber: phone }],
    });

    if (!user) {
      console.log(
        `User with ${parsePhoneNumber(credential).countryCode} ${parsePhoneNumber(credential).phone
        } is not registered`
      );
      return res.status(401).json({
        status: 401,
        login: false,
        message: `User with ${parsePhoneNumber(credential).countryCode} ${parsePhoneNumber(credential).phone
          } is not registered`,
      });
    }

    const storedEncryptedOtp = user.otp;
    const decryptedOtp = decryptData(storedEncryptedOtp);

    const isOtpValid = otp === decryptedOtp;

    if (isOtpValid) {
      await User.findOneAndUpdate(
        { $or: [{ phone: phone }, { phoneNumber: phone }] },
        { $set: { encryptedOtp: null } }
      );

      const token = jwt.sign({ userId: user._doc.uid }, config.JWT_SECRET, {
        expiresIn: "12h",
      });
      console.log(
        `OTP verification for ${parsePhoneNumber(credential).countryCode} ${parsePhoneNumber(credential).phone
        } is successfull`
      );
      return res.status(200).json({
        status: 200,
        login: true,
        message: `OTP verification for ${parsePhoneNumber(credential).countryCode
          } ${parsePhoneNumber(credential).phone} is successfull`,
        userData: { ...user._doc, jwt: token },
      });
    } else {
      console.log(`${decryptedOtp} is not same as ${otp}`);
      return res
        .status(401)
        .json({ status: 401, login: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/register", async (req, res) => {
  const userData = req.body.data;
  const type = req.query.type;
  const uid = uuidv4();
  const token = jwt.sign({ userId: uid }, config.JWT_SECRET, {
    expiresIn: "12h",
  });
  console.log("userData-", token);
  const { phone, displayName, email, userId } = userData;
  const validation = Joi.object({
    phone: Joi.number().required(),
    displayName: Joi.string().required(),
  });

  const { error } = validation.validate({
    phone,
    displayName,
  });

  if (error) {
    console.log(error.message, "/register");
    return res.status(400).json({ error: error.message });
  }
  try {
    console.log("Trying the User Registeration");
    if (phone) {
      // Check if the provided Phone is unique
      const existingUserWithPhone = await User.findOne({
        phone: parsePhoneNumber(phone).phone,
        created: true,
      });
      console.log(
        `${parsePhoneNumber(phone).countryCode} ${parsePhoneNumber(phone).phone
        } is already registered`
      );
      if (existingUserWithPhone) {
        return res.status(400).json({
          status: 400,
          message: "Phone is already taken.",
        });
      }
    }
    if (email) {
      // Check if the provided userId is unique
      const existingUserWithEmail = await User.findOne({
        email: email,
      });
      console.log(
        `${parsePhoneNumber(phone).countryCode} ${parsePhoneNumber(phone).phone
        } is already registered with the given email ${email}`
      );
      if (existingUserWithEmail) {
        return res.status(400).json({
          status: 400,
          message: "Email is already taken.",
        });
      }
    }
    if (userId) {
      // Check if the provided userId is unique
      const existingUserWithuserId = await User.findOne({
        userId: userId,
      });
      console.log(
        `${parsePhoneNumber(phone).countryCode} ${parsePhoneNumber(phone).phone
        } is already registered with the given user ID ${userId}`
      );
      if (existingUserWithuserId) {
        return res.status(400).json({
          status: 400,
          message: "User ID is already taken.",
        });
      }
    }

    let existingSettings = await SiteSettings.findOne();
    console.log("existing set-", existingSettings);
    if (!existingSettings) {
      existingSettings = new SiteSettings();
    }
    existingSettings.psyID += 1;
    const psyID = existingSettings.psyID;
    console.log(`Generated the PSY ID - ${psyID}`);
    const newUser = new User({
      ...userData,
      type: type,
      uid: uid,
      status: "unverified",
      balance: 0,
      firstName: parseDisplayName(displayName).firstName,
      lastName: parseDisplayName(displayName).lastName,
      displayName: parseDisplayName(displayName).displayName,
      phone: parsePhoneNumber(phone).phone,
      countryCode: parsePhoneNumber(phone).countryCode,
      psyID: psyID,
    });
    const doctorId = newUser._id.toString();

    const pageURL = `https://www.psymate.org/profile/${doctorId}?service=checkIn`;

    if (type === "doctor") {
      console.log(
        `Generating the QR code for ${parsePhoneNumber(phone).phone} - ${psyID}`
      );

      const qrCodeData = await qr.toDataURL(pageURL);

      // Convert the QR code data URL to a Buffer
      const qrCodeBuffer = Buffer.from(
        qrCodeData.replace(/^data:image\/png;base64,/, ""),
        "base64"
      );

      // Create a unique file name
      const imagePath = `qr_${uuidv4()}.png`;

      // Save the QR code image to a file
      await fs.promises.writeFile(imagePath, qrCodeBuffer);

      // Upload the image to Amazon S3
      const uploadToS3 = await uploadToS3Bucket([
        {
          originalname: imagePath,
          buffer: qrCodeBuffer,
          filename: "profile",
        },
      ]);
      newUser.qr = uploadToS3[0].Location;
      console.log(
        `Generated and saved the QR code for ${parsePhoneNumber(phone).phone
        } - ${psyID} to location - ${uploadToS3[0].Location
        }, and sent the whatsApp message`
      );

      // Send a WhatsApp message with the PDF attachment
      await sendWhatsAppMessage(Number(newUser.phone), {
        template_name: "registeration_doctor",
        broadcast_name: "registeration_doctor",
        parameters: [
          {
            name: "doctor_name",
            value: newUser.displayName,
          },
          {
            name: "doctor_qr_url",
            value: uploadToS3[0].Location,
          },
        ],
      });
    }
    console.log("parsephone-", parsePhoneNumber(phone));
    await User.deleteMany({
      phone: parsePhoneNumber(phone)?.phone,
      created: false,
    });

    await existingSettings.save();
    await newUser.save();
    try {
      const project = new Project({ userId: newUser._id, displayName: `${newUser.firstName}'s Care Plan`, description: `Welcome, ${newUser.firstName}! Discover the Care Plan designed to make your experience seamless and enjoyable.` });
      await project.save();
    } catch (error) {
      console.log(`Error While Creating ${newUser.firstName}'s Care Plan- `, error);
    }
    console.log(
      `User creation for ${parsePhoneNumber(phone)?.countryCode} ${parsePhoneNumber(phone)?.phone
      } is successfull`
    );
    res.status(200).json({
      status: 200,
      message: `User creation for ${parsePhoneNumber(phone)?.countryCode} ${parsePhoneNumber(phone)?.phone
        } is successfull`,
      login: true,
      data: { user: newUser, jwt: token },
      jwt: token,
    });
  } catch (error) {
    console.log(
      `User creation for ${parsePhoneNumber(phone)?.countryCode} ${parsePhoneNumber(phone)?.phone
      } is unsuccessfull`
    );
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/resend/otp/:credential", async (req, res) => {
  const phone = parseInt(req.params.credential);
  console.log("phone=", typeof phone);
  if (phone) {
    let otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const encryptedOtp = encryptData(otp);

    const result = await User.findOneAndUpdate(
      { $or: [{ phone: phone }, { phoneNumber: phone }] },
      { $set: { otp: encryptedOtp } }
    );

    if (testingNumbers.indexOf(phone) !== -1) {
      otp = "000000";
      res.status(200).json({
        status: 200,
        message: `OTP not sent to testing Numbers`,
      });
    } else {
      await sendOtp(phone, otp);
      res.status(200).json({
        status: 200,
        message: `OTP Sent Again on ${phone}`,
      });
    }
  } else {
    res.status(401).json({ status: 401, message: "Invalid User Credentials" });
  }
});

router.delete("/:credential", (req, res) => {
  const credential = req.params.credential;

  User.deleteOne({
    phone: credential,
  }).then((result) => {
    res.status(404).json({ status: 401, message: "Deleted" });
  });
});

router.post("/email", (req, res) => {
  const userId = req.body.userId;
  const password = req.body.password;

  User.findOne({
    userId: userId,
    password: password,
  }).then((result) => {
    if (result === null) {
      res.status(404).json({ status: 401, message: "User does not exist" });
    } else {
      if (result._doc) {
        if (password != result._doc.password) {
          res.status(500).json({
            status: 500,
            message: "incorrect password",
          });
        }
        const token = jwt.sign({ userId: result._doc.uid }, config.JWT_SECRET, {
          expiresIn: "12h",
        });
        res.status(200).json({
          status: 200,
          data: { ...result._doc, jwt: token },
          jwt: token,
        });
      } else {
        res.status(401).json({
          status: 404,
          message: "User password not assigned/activated yet",
        });
      }
    }
  });
});

router.post("/verified/:id", (req, res) => {
  const { userId, password, type, roles } = req.body;
  // Assuming you have a mongoose model named User
  User.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        userId: userId,
        password: password,
        type: type,
        roles: roles,
        status: "verified",
      },
    }
  )
    .then(async (result) => {
      if (result.email)
        await sendEmail(
          result.email,
          `Your status is verified - Psymate Healthcare`,
          "",
          "",
          "",
          `<!DOCTYPE html>
          <html
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            lang="en"
          >
            <head>
              <title></title>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
              <link
                href="https://fonts.googleapis.com/css2?family=Mada:wght@400;500&display=swap"
                rel="stylesheet"
              />
              <style>
                *,
                *::before,
                *::after {
                  margin: 0;
                  padding: 0;
                  box-sizing: inherit;
                }
          
                html {
                  box-sizing: border-box;
                }
          
                body {
                  font-family: "Mada", sans-serif;
                  font-size: 16px;
                }
          
                a[x-apple-data-detectors] {
                  color: inherit !important;
                  text-decoration: inherit !important;
                }
          
                .email {
                  background-color: #ffffff;
                  -webkit-text-size-adjust: none;
                  text-size-adjust: none;
                  padding: 20px 0;
                }
          
                .email__container {
                  background-color: #f9f9f9;
                  margin: 0 auto;
                  width: 550px;
                  max-width: 95%;
                  padding-bottom: 50px;
                }
          
                /* HEADER */
                header {
                  padding: 30px 0 20px 0;
                }
          
                header img:not(:last-child) {
                  margin-bottom: 30px;
                }
          
                header img {
                  margin: 0 auto;
                  display: block;
                }
          
                .email__p {
                  max-width: 80%;
                  margin: 0 auto;
                  color: #7c7c7c;
                  font-size: 14px;
                  line-height: 152%;
                  margin-bottom: 15px;
                }
          
                .email__cta {
                  align-self: flex-start;
                  text-decoration: none;
                  font-weight: 500;
                  font-size: 14px;
                  line-height: 162%;
                  letter-spacing: 1px;
                  color: #ffffff;
                  background: #f8b133;
                  border-radius: 4px;
                  padding: 6px 20px;
                  margin-bottom: 30px;
                  margin-top: 5px;
                  display: inline-block;
                }
          
                .center_content {
                  text-align: center;
                }
          
                .separator {
                  max-width: 80%;
                  margin: 10px auto;
                  border-bottom: 1px solid #f0f0f0;
                }
          
                .table td {
                  padding: 10px 30px;
                  background-color: white;
                }
          
                .table__detail {
                  font-weight: 500;
                  color: black;
                }
          
                .table__paid {
                  font-weight: 500;
                  color: green;
                  display: inline-block;
                  padding: 4px 14px;
                  margin-left: 10px;
                  border-radius: 5px;
                  background-color: rgb(214, 255, 214);
                }
          
                footer {
                  margin-top: 20px;
                }
          
                .footer__socials {
                  max-width: 80%;
                  margin: 0 auto;
                  display: flex;
                }
          
                .footer__social {
                  display: inline-block;
                  margin-right: 10px;
                }
          
                @media only screen and (max-width: 480px) {
                  .email__p {
                    max-width: 90%;
                  }
          
                  .email__misc {
                    max-width: 90%;
                  }
          
                  .table td {
                    padding: 15px 15px;
                  }
          
                  .table__email {
                    font-size: 12px;
                  }
                }
              </style>
            </head>
          
            <body class="email">
              <div class="email__container">
                <header class="email__header">
                  <img
                    src="https://iili.io/hgTI5v.png"
                    alt="PRIXLED"
                    class="email__logo"
                    height="55.5"
                    width="160"
                    title="Logo"
                  />
                </header>
                <main>
                  <p class="email__p">Here are your User Credentials.</p>
                  <p class="email__p">You are now verified at Psymate:</p>
          
                  <div class="email__p">
                    <table class="table">
                      <tbody>
                        <tr>
                          <td>User Id</td>
                          <td class="table__detail">${userId}</td>
                        </tr>
                        <tr>
                          <td>Password</td>
                          <td class="table__detail">${password}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
          
                  <p class="email__p">
                    Please Note: This is a Auto Generated Email. Please do not reply.
                  </p>
          
                  <p class="email__p">
                    <a href="${req?.headers?.referer}" class="email__cta">Visit Dashboard</a>
                  </p>
                </main>
                <div class="separator"></div>
                <footer>
                  <div class="footer__socials">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <div class="footer__social">
                            <a href="https://www.instagram.com/psymatehealthcare/">
                              <img
                                src="https://iili.io/hgTDpR.md.png"
                                alt="instagram"
                                width="24"
                                title="instagram"
                              />
                            </a>
                          </div>
                          <div class="footer__social">
                            <a href="https://twitter.com/psymatehealthcr">
                              <img
                                src="https://iili.io/hgufp4.md.png"
                                alt="twitter"
                                width="24"
                                title="twitter"
                              />
                            </a>
                          </div>
                          <div class="footer__social">
                            <a
                              href="https://www.linkedin.com/in/psymate-healthcare-851377202/"
                            >
                              <img
                                src="https://iili.io/hgTZYJ.md.png"
                                alt="linkedin"
                                width="24"
                                title="linkedin"
                              />
                            </a>
                          </div>
                          <div class="footer__social">
                            <a href="https://www.facebook.com/psymatehealthcr/">
                              <img
                                src="https://iili.io/hgTtkv.md.png"
                                alt="facebook"
                                width="24"
                                title="facebook"
                              />
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
                </footer>
              </div>
            </body>
          </html>
          `
        );
      else {
        console.log(
          `Patient ${result.displayName}-${result.phone}-${result.psyID} does not have an email`
        );
      }
      if (!result) {
        res.status(404).json({ status: 401, message: "User does not exist" });
      } else {
        res.status(200).json({
          status: 200,
          message: "User updated successfully",
          data: result,
        });
      }
    })
    .catch((error) => {
      console.error("Error updating user:", error);
      res.status(500).json({ status: 500, message: "Internal server error" });
    });
});

module.exports = router;
