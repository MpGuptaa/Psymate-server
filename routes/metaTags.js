const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { links } = req.body;
    const metadata = [];

    for (let index = 0; index < links.length; index++) {
      const element = links[index];
      const response = await fetch(element.link);
      const html = await response.text();

      // Dynamically import the 'cheerio' module using import()
      const { load } = await import("cheerio");

      const $ = load(html);
      const metadataObj = {
        displayName: $("head title").text() || "",
        href: element.link || "",
        description: $('meta[name="description"]').attr("content") || "",
        date:
          $('meta[property="article:published_time"]').attr("content") || "",
        featuredImage: $('meta[property="og:image"]').attr("content") || "",
        // Add more properties as needed
      };
      metadata.push(metadataObj);
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: metadata,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

module.exports = router;
