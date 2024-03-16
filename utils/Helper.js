const { default: axios } = require("axios");
const sendgrid = require("@sendgrid/mail");
const { ObjectId } = require("mongodb");
const { Cart } = require("../schemas/Cart");
const crypto = require("crypto");

function generateRandomId(type, length) {
  let characters;

  if (type === "number") {
    characters = "0123456789";
  } else if (type === "mixed") {
    characters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789${new Date().getTime()}`;
  } else {
    throw new Error("Invalid type specified");
  }

  let randomId = "";
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return randomId;
}

const sendOtp = async (phone, otp) => {
  try {
    // Send SMS using 2Factor API
    await axios.get(
      `https://2factor.in/API/V1/${process.env.API_KEY_2FACTOR}/SMS/${phone}/${otp}/OtpSMS1`
    );

    // Send WhatsApp message
    await sendWhatsAppMessage(phone, {
      template_name: "send_otp",
      broadcast_name: "send_otp",
      parameters: [
        {
          name: "otp",
          value: otp,
        },
      ],
    });

    console.log(
      `OTP sent to ${phone}
      } on SMS and whats app`
    );
  } catch (error) {
    console.error("Error sending messages:", error.message);
    throw error;
  }
};

const newCreateQuery = (search, searchBy, exact, boolean, operation, type) => {
  const query 
  = {};

  if (search && searchBy) {
    const searchTerms = search.split(",");
    const searchFields = searchBy.split(",");
    if (searchTerms.length === searchFields.length) {
      searchTerms.forEach((term, index) => {
        const field = searchFields[index].trim();
        const searchTerm = term.trim();

        if (field === "index") {
          query[field] = searchTerm;
        } else {
          switch (true) {
            case exact === field:
              query[field] =
                field === "_id"
                  ? new ObjectId(searchTerm)
                  : getTypeValue(searchTerm, type.split(".")[1] || "text");
              break;

            case boolean === field:
              query[field] = searchTerm === "true";
              break;

            case operation.split(".")[0] === field:
              const operationType = operation.split(".")[1];
              if (operation.split(".")[0] === type.split(".")[0])
                var arrayValues = searchTerm
                  .split(".")
                  .map((i) => getTypeValue(i, type.split(".")[1] || "text"));

              switch (operationType) {
                case "in":
                  query[field] = { $in: arrayValues };
                  break;

                default:
                  query[field] = {
                    $lt: getTypeValue(searchTerm, type.split(".")[1] || "text"),
                  };
                  break;
              }
              break;
            default:
              query[field] = {
                $regex: getTypeValue(searchTerm, type.split(".")[1] || "text"),
                $options: "i",
              };
              break;
          }
        }
      });
    }
  }

  return query;
};

const getTypeValue = (searchTerm, type) => {
  switch (type) {
    case "number":
      return parseFloat(searchTerm);
    case "date":
      return new Date(searchTerm);
    default:
      return searchTerm;
  }
};

async function sendWhatsAppMessage(whatsappNumber, message) {
  try {
    const response = await axios.post(
      `${process.env.WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${whatsappNumber}`,
      message,
      {
        headers: {
          Authorization: process.env.WATI_BEARER_TOKEN,
        },
      }
    );
    console.log(`WhatsApp Message Sent to ${whatsappNumber}: `);
  } catch (error) {
    console.error(
      `WhatsApp Message Sending Error to ${whatsappNumber}: `,
      error
    );
  }
}

// function parsePhoneNumber(phoneNumber) {
//   // Remove any non-numeric characters
//   const cleanedNumber = phoneNumber.replace(/\D/g, "");

//   if (cleanedNumber.length === 12) {
//     // If the number is 12 digits, consider the first two as the country code
//     return {
//       countryCode: cleanedNumber.substring(0, 2),
//       phone: cleanedNumber.substring(2),
//     };
//   } else if (cleanedNumber.length === 10) {
//     // If the number is 10 digits, consider it as the phone number and set default country code to 91
//     return {
//       countryCode: "91",
//       phone: cleanedNumber,
//     };
//   } else {
//     // Handle invalid phone numbers or other cases as needed
//     return null;
//   }
// }
function parsePhoneNumber(phoneNumber) {
  // Ensure phoneNumber is a string
  if (typeof phoneNumber !== "string") {
    // Handle the case where phoneNumber is not a string (e.g., set default value or throw an error)
    phoneNumber = String(phoneNumber);
  }

  // Remove any non-numeric characters
  const cleanedNumber = phoneNumber.replace(/\D/g, "");

  if (cleanedNumber.length === 12) {
    // If the number is 12 digits, consider the first two as the country code
    return {
      countryCode: cleanedNumber.substring(0, 2),
      phone: cleanedNumber.substring(2),
    };
  } else if (cleanedNumber.length === 10) {
    // If the number is 10 digits, consider it as the phone number and set default country code to 91
    return {
      countryCode: "91",
      phone: cleanedNumber,
    };
  } else {
    // Handle invalid phone numbers or other cases as needed
    return {
      countryCode: "",
      phone: "",
    };
  }
}

function parseDisplayName(displayName) {
  // Check if displayName is a string
  if (typeof displayName !== "string") {
    // Handle the case where displayName is not a string
    console.error("Error: displayName is not a valid string");
    return {
      firstName: "",
      lastName: "",
      displayName: displayName,
    };
  }

  const nameParts = displayName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  return {
    firstName: firstName,
    lastName: lastName,
    displayName: displayName,
  };
}
function paginateQuery(query, page = 1, limit = 10, sort) {
  const skip = (page - 1) * limit;
  return query
    .sort(sort ? sort : { createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

const processContent = (reportTemplate, content) => {
  // Replace variables in the report
  const processedReport = reportTemplate.replace(
    /{{\s*([\w.]+)\s*}}/g,
    (match, variableName) => {
      return content[variableName] || match;
    }
  );

  return processedReport;
};

function getAllUniqueTagsLowercased(dataArray, index) {
  const tagsSet = new Set();

  dataArray?.forEach((item) => {
    const tag = item?.tag?.toLowerCase().split(",")[index];
    tagsSet.add(tag && tag);
  });

  return Array.from(tagsSet);
}

const createQuery = (search, searchBy, exact, boolean, operation, operator) => {
  const query = {};

  if (search && searchBy) {
    const searchTerms = search.split(",");
    const searchFields = searchBy.split(",");

    if (searchTerms.length === searchFields.length) {
      searchTerms.forEach((term, index) => {
        const field = searchFields[index].trim();
        const searchTerm = term.trim();

        if (field === "index") {
          query[field] = searchTerm;
        } else {
          switch (true) {
            case exact === "true":
              query[field] =
                field === "_id" ? new ObjectId(searchTerm) : searchTerm;
              break;

            case boolean === "true":
              query[field] = searchTerm === "true";
              break;

            case operation === "true":
              const arrayValues = searchTerm.split(".");
              query[field] = { [`$${operator}`]: arrayValues };
              break;

            default:
              query[field] = { $regex: searchTerm, $options: "i" };
              break;
          }
        }
      });
    }
  }
  console.log(query);

  return query;
};

const sendPatientEmail = async (email, subject, template) => {
  try {
    if (!email) {
      throw new Error("Email is missing");
    }

    const emailOptions = {
      to: email,
      from: process.env.MAIL_FROM,
      subject: subject,
      html: template,
    };

    await sendgrid.send(emailOptions);
    console.log(`Email sent to patient without PDF attachment to ${email}`);
  } catch (err) {
    console.error(
      `Error in sending email to patient with PDF attachment to ${email}`,
      err
    );
    throw err; // Re-throw the error for handling at the higher level
  }
};

const addToCart = async (userId, items) => {
  // Create/update cart items
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        updatedAt: new Date(),
      },
      $addToSet: {
        items: {
          $each: items,
        },
      },
    },
    { upsert: true, new: true }
  );
  return cart;
};

function encryptData(value) {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.CRYPTO_KEY);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decryptData(value) {
  const decipher = crypto.createDecipher("aes-256-cbc", process.env.CRYPTO_KEY);
  let decrypted = decipher.update(value, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  generateRandomId,
  paginateQuery,
  sendPatientEmail,
  processContent,
  getAllUniqueTagsLowercased,
  createQuery,
  sendWhatsAppMessage,
  addToCart,
  getTypeValue,
  encryptData,
  decryptData,
  parsePhoneNumber,
  parseDisplayName,
  sendOtp,
};
