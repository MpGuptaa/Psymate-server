const express = require("express");
const { Appointment } = require("../../../../schemas/Appointment");
const { User } = require("../../../../schemas/User");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { Orders } = require("../../../../schemas/Orders");
const { default: axios } = require("axios");
const { uploadToS3Bucket } = require("../../../../utils/s3Service");
const {
  generatePDFFromHTML,
} = require("../../../../utils/pdf/GeneratePDFFromHTML");
const {
  generateBookingTemplate,
} = require("../../../../templates/generateTemplate");
const fs = require("fs").promises; // Import the built-in 'fs' library to read the PDF file
const sendgrid = require("@sendgrid/mail");
const { Timeline } = require("../../../../schemas/Timeline");
const { sendWhatsAppMessage } = require("../../../../utils/Helper");

router.post("/in", async (req, res) => {
  try {
    const { doctorId, patientCredential } = req.body;

    // Validate input
    if (!doctorId || !patientCredential) {
      return res
        .status(400)
        .json({ error: "Doctor ID and patient email are required." });
    }

    // Parse the current time
    const currentTime = new Date();
    const twoHoursFromNow = new Date(currentTime);
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

    // Query the database for the appointment
    const appointment = await Appointment.findOne({
      "doctor._id": doctorId,
      $or: [
        { "patient.email": patientCredential },
        { "patient.phone": patientCredential },
      ],
      endTime: { $gte: currentTime, $lt: twoHoursFromNow },
      status: "confirmed",
    });

    if (!appointment) {
      return res.json({
        message: "No active appointment found in the next two hours.",
      });
    }

    // Calculate the delay in minutes
    const delayMinutes = Math.floor(
      (currentTime - appointment.startTime) / (1000 * 60)
    );

    // Set the maximum delay time in minutes (e.g., 10 minutes)
    const maxDelayMinutes = 0;

    // Update the appointment status to "completed"
    await Appointment.updateOne(
      { _id: new ObjectId(appointment._id) },
      { $set: { status: "engaged", startTime: currentTime } }
    );

    if (delayMinutes <= maxDelayMinutes) {
      return res.json({
        message: "Appointment checked in within the allowed time.",
      });
    }

    // Calculate the amount to deduct and add to balances
    const amountToDeduct = delayMinutes - maxDelayMinutes;

    // Find the doctor in the database
    const doctor = await User.findOne({ _id: new ObjectId(doctorId) });

    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found." });
    }

    // Find the patient in the database
    const patient = await User.findOne({ email: patientCredential });

    if (!patient) {
      return res.status(400).json({ error: "Patient not found." });
    }

    await User.updateOne(
      { _id: new ObjectId(doctorId) },
      {
        $inc: { balance: -amountToDeduct },
        $set: { updatedAt: new Date() },
      }
    );

    await User.updateOne(
      {
        $or: [{ email: patientCredential }, { phone: patientCredential }],
      },
      {
        $inc: { balance: amountToDeduct },
        $set: { updatedAt: new Date() },
      }
    );

    return res.json({
      message: `Appointment delayed by ${delayMinutes} minutes. ${amountToDeduct} deducted from doctor and added to patient balance.`,
    });
  } catch (error) {
    console.error("Error in check-in API:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
});

router.post("/out", async (req, res) => {
  try {
    const { doctorId, patientCredential } = req.body;

    // Validate input
    if (!doctorId || !patientCredential) {
      return res
        .status(400)
        .json({ error: "Doctor ID and patient email are required." });
    }

    const doctor = await User.findOne({
      _id: new ObjectId(doctorId),
    });

    if (!doctor) {
      console.log(`No valid Doctor not found`);
      return res.status(400).json({ error: "No valid Doctor not found." });
    }

    // Find the patient in the database
    const patient = await User.findOne({
      $or: [
        {
          email: patientCredential,
        },
        {
          phone: patientCredential,
        },
      ],
    });

    if (!patient) {
      console.log(`No valid Patient not found`);
      return res.status(400).json({ error: "No valid Patient not found." });
    }

    // Query the database for the appointment
    const appointment = await Appointment.findOne({
      "doctor._id": doctorId,
      $or: [
        { "patient.email": patientCredential },
        { "patient.phone": patientCredential },
      ],
      status: "engaged",
    });

    if (!appointment) {
      console.log(`No engaged appointment found`);
      return res.json({ message: "No engaged appointment found." });
    } else {
      console.log(`Appointment found for ${appointment.bookingId}`);
    }

    // Calculate the total duration of the appointment in minutes
    const durationInMinutes = Math.floor(
      (new Date() - appointment.startTime) / (1000 * 60)
    );

    // Find the associated order or bill based on the appointment's bookingId
    const order = await Orders.findOne({ invoiceId: appointment.bookingId });

    if (!order) {
      console.log(`No order found for ${appointment.bookingId}`);
      return res.json({ message: "No order found for this appointment." });
    } else {
      console.log(`Order found for ${appointment.bookingId}`);
    }

    // Calculate the new total amount based on the updated appointment duration
    const newTotalAmount = durationInMinutes * doctor.price;

    // Check if the patient has already paid the full amount (or more)
    const amountPaid = order.payment.reduce(
      (total, payment) => total + payment.amtPaid,
      0
    );

    let paymentToUpdate = null;

    if (newTotalAmount <= amountPaid) {
      // Patient has overpaid, calculate the refund
      const refund = amountPaid - newTotalAmount;

      // Update the payment object for the refund
      paymentToUpdate = { amtPaid: -refund, method: "PsymateCoins" };
    } else {
      // Patient needs to pay the remaining amount
      const amountToPay = newTotalAmount - amountPaid;

      // Update the payment object for the additional payment
      paymentToUpdate = { amtPaid: amountToPay, method: "PsymateCoins" };
    }

    // Update the order's payment, total amount, and due amount
    order.payment.push(paymentToUpdate);
    order.totalAmount = newTotalAmount;
    order.dueAmount = 0; // Assuming the due amount is set to 0 when fully paid
    order.updatedAt = new Date();
    appointment.payment.push(paymentToUpdate);
    appointment.totalAmount = newTotalAmount;
    appointment.status = "completed";
    appointment.duration = durationInMinutes;
    appointment.endTime = new Date();
    appointment.updatedAt = new Date();
    appointment.dueAmount = 0;
    // Update the appointment status to "completed" and set the end time to current time
    // Save the updated order
    await order
      .save()
      .then(() => {
        console.log(
          `Order Updated successfully with invoice Id - ${order.invoiceId} for ${patient.displayName} with ${doctor.displayName}`
        );
      })
      .catch((error) => {
        console.error("Error updating Order:", error);
      });
    await appointment
      .save()
      .then(() => {
        console.log(
          `Appointment Updated successfully with invoice Id - ${order.invoiceId} for ${patient.displayName} with ${doctor.displayName}`
        );
      })
      .catch((error) => {
        console.error("Error updating appointment:", error);
      });

    await User.updateOne(
      {
        $or: [{ email: patientCredential }, { phone: patientCredential }],
      },
      {
        $inc: {
          balance:
            paymentToUpdate.amtPaid > 0
              ? Number(`-${paymentToUpdate.amtPaid}`)
              : paymentToUpdate.amtPaid,
        },
        $set: { updatedAt: new Date() },
      }
    )
      .then(() => {
        console.log(
          `${patient.displayName}'s Psymate balance Updated with ${paymentToUpdate.amtPaid} successfully for invoice Id - ${order.invoiceId} and ${doctor.displayName}`
        );
      })
      .catch((error) => {
        console.error(
          `Error updating Psymate balance for ${patient.displayName} - ${order.invoiceId}`,
          error
        );
      });
    const confirmPath = `${patient.displayName}-Invoice-${order.invoiceId}.pdf`;
    const emailTemplate = generateBookingTemplate({
      sendPatientEmail: patient.email,
      patientNumber: patient.phone,
      patientName: patient.displayName,
      doctorName: `${doctor.prefix} ${doctor.displayName}`,
      practiceName: patient.email,
      appointmentId: order.invoiceId,
      appointmentDate: appointment.appointmentDate,
      appointmentSlot: appointment.slot,
      paymentStatus: "Paid",
      address: appointment.establishment.displayName,
      bookingType: "Completed",
    });
    var timeline = {};
    timeline = {
      postId: order?._id,
      userId: [patient._id, doctorId],
      type: "orders",
      title: `Appointment`,
      description: `Order Updated for ${patient.displayName} with a total of Rs. ${paymentToUpdate.amtPaid} for Appointment completed for ${patient.displayName} with ${doctor.prefix} ${doctor.displayName} at ${appointment.slot}. Order Id - ${order.invoiceId} (${order.status})`,
    };
    generatePDFFromHTML(emailTemplate, confirmPath)
      .then(async () => {
        console.log(`PDF saved to ${confirmPath}`);

        // Read the PDF file
        const pdfFile = await fs.readFile(confirmPath);

        // Upload the PDF to AWS S3
        const uploadToS3 = await uploadToS3Bucket([
          {
            originalname: confirmPath,
            buffer: pdfFile,
            filename:"visits",
          },
        ]);

        console.log("Uploaded to S3 : ", uploadToS3[0].Location);
        timeline.reference = { document: uploadToS3 };

        // Send a WhatsApp message with the PDF attachment
        await sendWhatsAppMessage(Number(patient.phone), {
          template_name: "appointment_completed_patient",
          broadcast_name: "appointment_completed_patient",
          parameters: [
            {
              name: "patient_name",
              value: patient.displayName,
            },
            {
              name: "doctor_name",
              value: `${doctor.prefix} ${doctor.displayName}`,
            },
            {
              name: "location",
              value: appointment.establishment.displayName,
            },
            {
              name: "duration",
              value: durationInMinutes,
            },
            {
              name: "total_amount",
              value: newTotalAmount,
            },
            {
              name: "document",
              value: uploadToS3[0].Location,
            },
          ],
        });
        await sendWhatsAppMessage(Number(doctor.phone), {
          template_name: "appointment_completed_doctor",
          broadcast_name: "appointment_completed_doctor",
          parameters: [
            {
              name: "patient_name",
              value: patient.displayName,
            },
            {
              name: "doctor_name",
              value: `${doctor.prefix} ${doctor.displayName}`,
            },
            {
              name: "location",
              value: appointment.establishment.displayName,
            },
            {
              name: "duration",
              value: durationInMinutes,
            },
          ],
        });

        // Compose and send email to patient and doctor with PDF attachment
        const sendPatientEmail = {
          to: patient.email,
          from: process.env.MAIL_FROM,
          subject: `Booking ${"Completed"} with Psymate: #${order.invoiceId}`,
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
        const sendDoctorEmail = {
          to: doctor.email,
          from: process.env.MAIL_FROM,
          subject: `Booking ${"Completed"} with Psymate: #${order.invoiceId}`,
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
        // Send the email to patient and doctor
        if (patient.email) {
          await sendgrid.send(sendPatientEmail);
          console.log(
            `Email sent to patient with PDF attachment to ${patient.email}`
          );
        } else {
          console.log(`Email not found for patient ${patient.displayName}`);
        }
        if (doctor.email) {
          await sendgrid.send(sendDoctorEmail);
          console.log(
            `Email sent to doctor with PDF attachment to ${doctor.email}`
          );
        } else {
          console.log(`Email not found for doctor ${doctor.displayName}`);
        }
      })
      .catch(async (error) => {
        console.error(
          `WhatsApp Message and Email Not triggered for checkout with invoice Id - ${order.invoiceId}. Error in generating PDF:`,
          error
        );
      });
    const time = new Timeline(timeline);
    await time
      .save()
      .then(() => {
        console.log(
          `Timeline saved successfully with invoice Id - ${order.invoiceId} for ${patient.displayName} with ${doctor.displayName}`
        );
      })
      .catch((error) => {
        console.error("Error saving Timeline:", error);
      });

    return res.json({
      message: `Check-out successful. Appointment completed. lasted for ${durationInMinutes} mins, the bill has been updated`,
    });
  } catch (error) {
    console.error("Error in check-out API:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
});

module.exports = router;
