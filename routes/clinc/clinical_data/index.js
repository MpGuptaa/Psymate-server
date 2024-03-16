const {
  ClinicalData,
} = require("../../../schemas/Clinc/clinical_data/clincal_data");
const express = require("express");
const router = express.Router();
const { User } = require("../../../schemas/User");
const { NewForms } = require("../../../schemas/NewForms");
const { ObjectId } = require("mongodb");
const {
  mentalStatusExamination,
} = require("../../../templates/mentalStatusExamination");
const {
  generatePDFFromHTML,
} = require("../../../utils/pdf/GeneratePDFFromHTML");
const { uploadToS3Bucket } = require("../../../utils/s3Service");
const fs = require("fs").promises; // Import the built-in 'fs' library to read the PDF file
const sendgrid = require("@sendgrid/mail");
const { Timeline } = require("../../../schemas/Timeline");
const { processContent } = require("../../../utils/Helper");
const uuid = require("uuid").v4;

router.get("/", async (req, res, next) => {
  const { body, query } = req;
  const { patientId, formId } = query;

  try {
    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(400).json({
        status: 400,
        message: "Invalid patient ID",
      });
    }
    const data = await ClinicalData.find({
      "patient._id": new ObjectId(patientId),
      "form._id": new ObjectId(formId),
    }).sort({ createdAt: 1 });

    if (data.length === 0) {
      return res.json({ message: "No Data found for this user." });
    } else {
      // Retrieve related documents and timelines
      return res.status(201).json({
        status: 201,
        data: data,
        message: "Clinical data Returned",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/", async (req, res, next) => {
  const { body } = req;
  const { patientId, doctorId, formId, data } = body;

  try {
    // Check if a valid patient ID is provided
    const form = await NewForms.findById(formId);

    if (!form) {
      return res.status(400).json({
        status: 400,
        message: "Invalid Form ID",
      });
    }

    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(400).json({
        status: 400,
        message: "Invalid patient ID",
      });
    }

    // Check if a valid doctor ID is provided
    const doctor = await User.findById(doctorId);

    if (!doctor) {
      return res.status(400).json({
        status: 400,
        message: "Invalid doctor ID",
      });
    }
    const date = new Date().toDateString();

    const confirmPath = `${form.displayName}-${
      patient.displayName
    }-${date}-${uuid()}.pdf`;

    const head = form.head;
    const formData = { ...form };
    delete formData._doc.head;

    const emailTemplate = processContent(`${head}`, {
      form: JSON.stringify(formData._doc),
      response: JSON.stringify(data),
      patient: JSON.stringify(patient),
    });

    var reference;
    var timeline = {};

    timeline = {
      userId: [patientId, doctorId],
      type: "lab",
      title: `reports`,
      description: `${form.displayName} Report Generated for ${patient.displayName}-${patient.psyID} by ${doctor.displayName} on ${date}`,
    };

    await generatePDFFromHTML(emailTemplate, confirmPath)
      .then(async () => {
        console.log(`PDF saved to ${confirmPath}`);

        // Read the PDF file
        const pdfFile = await fs.readFile(confirmPath);

        // Upload the PDF to AWS S3
        const uploadToS3 = await uploadToS3Bucket([
          {
            originalname: confirmPath,
            buffer: pdfFile,
            filename:"reports",
          },
        ]);
        reference = uploadToS3;
        console.log("Uploaded to S3 : ", uploadToS3[0].Location);

        timeline.reference = { document: uploadToS3 };

        const sendDoctorEmail = {
          to: doctor.email,
          from: process.env.MAIL_FROM,
          subject: timeline.description,
          html: emailTemplate,
          attachments: [
            {
              content: pdfFile.toString("base64"), // Convert PDF to base64
              filename: confirmPath, // Specify the filename for the attachment
              type: "application/pdf", // Set the content type
              disposition: "attachment", // Specify as an attachment
            },
          ],
        };
        if (doctor.email) {
          await sendgrid.send(sendDoctorEmail);
          console.log(
            `Email sent to doctor with PDF attachment to ${doctor.email}`
          );
        }
      })
      .catch(async (error) => {
        console.error("Error generating PDF:", error);
      });

    const clinicalData = new ClinicalData({
      doctor: {
        phone: doctor.phone,
        email: doctor.email,
        displayName: doctor.displayName,
        _id: doctor._id,
        psyID: doctor.psyID,
      },
      form: {
        _id: form._id,
        displayName: form.displayName,
      },
      patient: {
        phone: patient.phone,
        email: patient.email,
        displayName: patient.displayName,
        _id: patient._id,
        psyID: patient.psyID,
      },
      data,
      reference,
    });
    timeline.postId = clinicalData._id;
    const time = new Timeline(timeline);
    await time
      .save()
      .then(() => {
        console.log(
          `Timeline saved successfully for ${patient.displayName} with ${doctor.displayName}`
        );
      })
      .catch((error) => {
        console.error("Error saving Timeline:", error);
      });
    await clinicalData
      .save()
      .then(() => {
        console.log(
          `${form.displayName} saved successfully for ${patient.displayName} with ${doctor.displayName}`
        );
      })
      .catch((error) => {
        console.error("Error saving Timeline:", error);
      });

    res.status(201).json({
      status: 201,
      data: clinicalData,
      message: "Clinical data created successfully",
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
