const express = require("express");
const router = express.Router();
const { Orders } = require("../../schemas/Orders");
const { Timeline } = require("../../schemas/Timeline");
const {
  generateRandomId,
  paginateQuery,
  sendWhatsAppMessage,
} = require("../../utils/Helper");
const { ObjectId } = require("mongodb");
const { invoiceTemplate } = require("../../templates/invoiceTemplate");
const { uploadToS3Bucket } = require("../../utils/s3Service");
const { default: axios } = require("axios");
const { User } = require("../../schemas/User");
const { Establishments } = require("../../schemas/Establishments");
const { generatePDFFromHTML } = require("../../utils/pdf/GeneratePDFFromHTML");
const { Cart } = require("../../schemas/Cart");
const fs = require("fs").promises; // Import the built-in 'fs' library to read the PDF file
const sendgrid = require("@sendgrid/mail");

router.get("/", async (req, res) => {
  const { search, searchBy, orderID, keyword, invoiceId, page, limit } =
    req.query;

  let query = {};

  if (search && searchBy) {
    const searchValue = {
      $or: [
        { [searchBy]: { $regex: search, $options: "i" } }, // Regex search
        { [searchBy]: search }, // Exact match search
      ],
    };
    query = searchValue;
  }

  if (orderID) {
    query._id = orderID;
  } else if (keyword) {
    query.displayName = keyword;
  } else if (invoiceId) {
    query.invoiceId = invoiceId;
  }

  try {
    const totalDocuments = await Orders.countDocuments(query);

    const paginatedQuery = paginateQuery(
      Orders.find(query),
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    const orders = await paginatedQuery.exec();
    const uniquePhoneNumbers = new Set();
    let confirmedOrderCount = 0;
    let totalEarnings = 0;

    orders.forEach((order) => {
      if (order.amtPaid) totalEarnings += order.amtPaid;
    });

    orders.forEach((order) => {
      if (order?.user) {
        const phoneNumber = order?.user?.phone;
        uniquePhoneNumbers.add(phoneNumber);
      }
    });

    // Loop through the orders and count confirmed orders
    orders.forEach((order) => {
      if (order?.status === "confirmed") {
        confirmedOrderCount++;
      }
    });
    const uniqueUserCount = uniquePhoneNumbers.size;

    res.status(200).json({
      status: 200,
      message: "Success",
      data: orders,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      uniqueUserCount: uniqueUserCount,
      confirmed: confirmedOrderCount,
      totalEarnings: totalEarnings, // Include total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/total-earnings", async (req, res) => {
  try {
    const totalEarnings = await Orders.aggregate([
      { $group: { _id: null, total: { $sum: "$amtPaid" } } },
    ]);

    res.json({ totalEarnings: totalEarnings[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching total earnings" });
  }
});

router.post("/", async (req, res) => {
  const data = req.body.data;

  const patient = await User.findById(data.user._id);
  if (!patient) {
    return res.status(400).json({
      error: "No valid patient found.",
    });
  }

  const doctor = await User.findById(data.createdBy._id);
  if (!doctor) {
    return res.status(400).json({
      error: "No valid doctor found.",
    });
  }

  const establishment = await Establishments.findById(
    data?.company?._id ? data?.company?._id : "644cc2d1fade193c17517f7f"
  );
  if (!establishment) {
    return res.status(400).json({
      error: "No valid Company found.",
    });
  }

  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const count = await Orders.countDocuments();
    const invoiceId = `${new Date().getFullYear()}-${new Date().getMonth()}-${String(
      count + 1
    ).padStart(4, "0")}`;
    if (!data.invoiceId) data.invoiceId = invoiceId;

    // Calculate the due amount
    const totalPaid = data.payment.reduce((total, paymentItem) => {
      // Parse the amtPaid value as an integer and add it to the total
      return total + parseInt(paymentItem.amtPaid);
    }, 0);
    const totalAmount = parseFloat(data.totalAmount);
    const discount = parseFloat(data.discount || 0); // Handle the case when there's no discount
    const discountedAmount = totalAmount - discount;
    const dueAmount = discountedAmount - totalPaid;

    // Determine the status
    const status = totalPaid === discountedAmount ? "Paid" : "Due";

    // Check if paid amount is greater than total amount
    // temp remove the code
    // if (totalPaid > discountedAmount) {
    //   return res.status(400).json({
    //     status: 400,
    //     message: "Paid amount cannot be greater than the total amount",
    //   });
    // }

    const ordersData = {
      ...data,
      status: status,
      totalPaid: totalPaid,
      dueAmount: dueAmount,
      discount: discount, // Include the discount in the orders data
    };
    const timeline = {
      postId: data?._id,
      userId: [data?.user._id, data?.createdBy?._id],
      type: "orders",
      title: `Order`,
      description: `Order created for ${data.user.displayName} with a total of Rs. ${data.totalAmount}. Orders Id - ${data.invoiceId} (${status})`,
    };
    const confirmPath = `Invoice-${invoiceId}.pdf`;
    const emailTemplate = invoiceTemplate({ ...ordersData, user: patient });

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
            filename: "invoices",
          },
        ]);

        console.log("Uploaded to S3 : ", uploadToS3[0].Location);
        timeline.reference = { document: uploadToS3 };
        ordersData.download = [uploadToS3[0].Location];
        // Send a WhatsApp message with the PDF attachment
        await sendWhatsAppMessage(Number(patient.phone), {
          template_name: "invoice_with_pdf",
          broadcast_name: "invoice_with_pdf",
          parameters: [
            {
              name: "patient_name",
              value: patient.displayName,
            },
            {
              name: "invoice_id",
              value: invoiceId,
            },
            {
              name: "date",
              value: new Date().toDateString(),
            },
            {
              name: "total_amount",
              value: totalAmount,
            },
            {
              name: "due_amount",
              value: dueAmount,
            },
            {
              name: "document",
              value: uploadToS3[0].Location,
            },
          ],
        });

        if (data.type === "product") {
          const cart = await Cart.findOne({ user: patient._id.toString() });
          // if (!cart) {
          //   return res.status(404).json({ error: "Cart not found" });
          // }
          data.items.forEach(async (i) => {
            // Find the index of the product in the cart items
            const productIndex = cart.items.findIndex(
              (item) => item.id === i._id
            );

            // If the product is not in the cart, return an error
            if (productIndex === -1) {
              return res
                .status(404)
                .json({ error: "Product not found in the cart" });
            }

            // Remove the product from the cart
            cart.items.splice(productIndex, 1);
            // Save the updated cart
          });
          console.log("cart", cart);
          await cart.save();
        }
        // Compose and send email to patient and doctor with PDF attachment
        const sendPatientEmail = {
          to: patient.email,
          from: process.env.MAIL_FROM,
          subject: `Invoice generated By Psymate: #${invoiceId}`,
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
        }
      })
      .catch(async (error) => {
        console.error("Error generating PDF:", error);
      });

    // Include the status, due amount, and discount in the orders data

    const form = new Orders(ordersData);
    const time = new Timeline(timeline);

    form
      .save()
      .then((result) => {
        time.postId = result._id;
        time
          .save()
          .then((result) => {
            res.json({
              status: "200",
              message: status,
              data: { Orders: form },
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Error In adding to timeline" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error In adding to Orders" });
      });
  }
}); // Define a new route to add a payment to an existing invoice

router.post("/add-payment", async (req, res) => {
  const invoiceId = req.body.id; // ID of the original invoice
  const newPayment = req.body.payment; // New payment object

  try {
    // Retrieve the original invoice based on the provided ID
    const originalInvoice = await Orders.findById(invoiceId);

    // Check if the original invoice exists
    if (!originalInvoice) {
      return res
        .status(404)
        .json({ status: 404, message: "Original invoice not found" });
    }

    // Check if the original invoice is in 'Due' status
    if (originalInvoice.status !== "Due") {
      return res
        .status(400)
        .json({ status: 400, message: "Amount is already paid" });
    }

    // Calculate the remaining due amount and new total paid amount
    const remainingDueAmount = originalInvoice.dueAmount;
    const newTotalPaid = parseFloat(newPayment.amtPaid);
    console.log(newTotalPaid, remainingDueAmount);
    // Check if the new total paid amount is greater than the remaining due amount
    if (newTotalPaid > remainingDueAmount) {
      return res.status(400).json({
        status: 400,
        message: "Payment exceeds the remaining due amount",
      });
    }

    // Update the original invoice with the new payment
    originalInvoice.payment.push(newPayment);
    originalInvoice.dueAmount =
      remainingDueAmount - parseFloat(newPayment.amtPaid); // Reduce the due amount
    originalInvoice.status = originalInvoice.dueAmount === 0 ? "Paid" : "Due"; // Check if the due amount is fully paid

    // Save the updated invoice
    await originalInvoice.save();

    return res
      .status(200)
      .json({ status: 200, message: "Payment successfully collected" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Error in updating the invoice" });
  }
});

// ... other routes and middleware
router.put("/", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Orders.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { ...data },
      { new: true }
    )
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Orders does not exist",
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
    Orders.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Orders does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Orders`,
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
