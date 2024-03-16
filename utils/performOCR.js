const tesseract = require("node-tesseract-ocr");

async function performOCR(buffer) {
  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
    binary: process.env.TESSERACT_PATH, // Add the full path to the tesseract executable
  };

  try {
    const result = await tesseract.recognize(buffer, config);
    return result;
  } catch (error) {
    console.error("OCR Error:", error.message);
    throw error;
  }
}

module.exports = { performOCR };
