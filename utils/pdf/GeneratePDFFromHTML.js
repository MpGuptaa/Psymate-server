const puppeteer = require("puppeteer");

async function generatePDFFromHTML(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    // executablePath: "/usr/bin/chromium-browser",
    // executablePath:
    //   "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    // executablePath:
    //   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    executablePath: process.env.PUPPETEER_CHROMIUM_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return outputPath;
}

module.exports = { generatePDFFromHTML };
