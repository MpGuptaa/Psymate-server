const express = require("express");
const router = express.Router();
const { Prescriptions } = require("../../schemas/Prescriptions");
const { Timeline } = require("../../schemas/Timeline");
const { generateRandomId, processContent } = require("../../utils/Helper");
const { User } = require("../../schemas/User");
const { Establishments } = require("../../schemas/Establishments");
const { generatePDFFromHTML } = require("../../utils/pdf/GeneratePDFFromHTML");
const { uploadToS3Bucket } = require("../../utils/s3Service");
const fs = require("fs").promises; // Import the built-in 'fs' library to read the PDF file
const sendgrid = require("@sendgrid/mail");
const sendEmail = require("../../utils/sendEmail");
const { Cart } = require("../../schemas/Cart");
const {
  prescriptionTemplate,
} = require("../../templates/prescriptionTemplate");

router.get("/", (req, res) => {
  const { search, keyword, id, prescriptionID, number } = req.query;
  let query = {};

  if (id) {
    query = { "user._id": id };
  } else if (search) {
    query = { number: { $regex: search, $options: "i" } };
  } else if (prescriptionID) {
    query = { _id: prescriptionID };
  } else if (keyword) {
    query = { displayName: keyword };
  } else if (number) {
    query = { number: number };
  }

  Prescriptions.find(query)
    .then((success) => {
      if (!success) {
        return res
          .status(200)
          .json({ status: 200, message: "User Prescriptions does not exist" });
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

router.post("/", async (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
    return;
  }
  // Finding the patient, doctor, and establishment in the database
  const patient = await User.findById(data.user);
  if (!patient) {
    return res.status(400).json({
      error: "No valid patient found.",
    });
  }

  const createdBy = await User.findById(data.createdBy);
  if (!createdBy) {
    return res.status(400).json({
      error: "No valid User found.",
    });
  }

  const establishment = await Establishments.findById(
    data.company || "642a98e6e901488c1add54fe"
  );

  if (!establishment) {
    return res.status(400).json({
      error: "No valid establishment found.",
    });
  }

  try {
    const nextnumber = generateRandomId("mixed", 10);
    const form = new Prescriptions({
      ...req.body.data,
      user: {
        displayName: patient.displayName,
        _id: patient._id,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        psyID: patient.psyID,
      },
      createdBy: {
        displayName: createdBy.displayName,
        prefix: createdBy.prefix,
        _id: createdBy._id,
        email: createdBy.email,
        phone: createdBy.phone,
      },
      company: establishment,
      number: nextnumber,
    });
    const confirmPath = `RX-${patient.displayName}-${nextnumber}.pdf`;
    const emailTemplate = processContent(prescriptionTemplate(), {
      data: JSON.stringify({
        ...data,
        items: data?.items?.map((item) => {
          const { head, ...rest } = item;
          return rest;
        }),
      }),
      createdBy: JSON.stringify(createdBy),
      patient: JSON.stringify(patient),
      company: JSON.stringify(establishment),
      date: new Date().toDateString(),
      number: `RX-${nextnumber}`,
    });
    console.log(emailTemplate);
    var timeline = {};
    timeline = {
      userId: [patient._id.toString(), createdBy._id.toString()],
      type: "prescriptions",
      title: `Prescription`,
      description: `Prescription added by ${createdBy.displayName} in the name of ${patient.displayName}`,
      postId: `RX-${nextnumber}`,
    };

    await generatePDFFromHTML(emailTemplate, confirmPath)
      .then(async () => {
        console.log(`PDF saved to ${confirmPath}`);
        const pdfFile = await fs.readFile(confirmPath);
        const uploadToS3 = await uploadToS3Bucket([
          {
            originalname: confirmPath,
            buffer: pdfFile,
            filename: "prescription",
          },
        ]);
        reference = uploadToS3;
        console.log("Uploaded to S3 : ", uploadToS3[0].Location);
        timeline.reference = { document: uploadToS3 };
        if (patient.email)
          await sendEmail(
            patient.email,
            timeline.description,
            "",
            pdfFile.toString("base64"),
            confirmPath,
            "Prescription"
          );
      })
      .catch(async (error) => {
        console.error("Error generating PDF:", error);
      });
    await Timeline.findOneAndUpdate(
      { postId: data.appointment },
      {
        $push: {
          updates: {
            id: `RX-${nextnumber}`,
            collection: "Prescriptions",
            document: timeline.reference,
            title: form.title,
            type: form.type,
          },
        },
      },
      { new: true }
    );

    const time = new Timeline(timeline);
    await form.save();
    await time.save();

    res.json({
      status: "200",
      message: "Success",
      data: { Prescriptions: form },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error in adding prescription" });
  }
});

router.put("/", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Prescriptions.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Prescriptions does not exist",
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
    Prescriptions.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Prescriptions does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Prescriptions`,
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
