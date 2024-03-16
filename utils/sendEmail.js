require("dotenv").config();
const sendgrid = require("@sendgrid/mail");
const axios = require("axios");

const sendEmail = async (
  address,
  subject,
  url,
  contentType,
  path,
  htmlTemplate
) => {
  try {
    let attachments = [];

    // Download the file from the URL if provided
    if (url) {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const pdfFile = Buffer.from(response.data, "binary");

      attachments.push({
        content: pdfFile.toString("base64"),
        filename: path,
        type: "application/pdf",
        disposition: "attachment",
      });
    } else if (contentType && path) {
      // If URL is not provided but contentType and path are, include the attachment
      attachments.push({
        content: contentType,
        filename: path,
        type: "application/pdf",
        disposition: "attachment",
      });
    }

    const email = {
      to: address,
      from: process.env.MAIL_FROM,
      subject: subject,
      html: htmlTemplate || "",
      attachments: attachments,
    };
// console.log(email)
    await sendgrid.send(email);
    console.log(
      `Email sent to ${address} ${attachments.length > 0 && `with attachment`}`
    );
  } catch (error) {
    console.error("Error sending email:", error);
    // Handle the error as needed, e.g., log it or send a notification
  }
};

module.exports = sendEmail;
