const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { Blog } = require("../../schemas/Blogs");

const blogSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  keywords: Joi.array().items(Joi.string()),
  index: Joi.string().required(),
  category: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  thumbnail: Joi.string().allow(""),
  author: Joi.object({
    _id: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    displayName: Joi.string(),
  }),
  publishedDate:Joi.string().allow(""),
  content: Joi.string().required(),
  socialMedia: Joi.object({
    twitter: Joi.string(),
    facebook: Joi.string(),
    instagram: Joi.string(),
    linked_in: Joi.string(),
  }),
});

router.get("/", (req, res) => {
  const { id } = req.query;
  Blog.findOne({ _id: id })
    .then((response) => {
      if (response) {
        res.json({ status: 200, data: response, message: `Success` });
      } else {
        res.status(404).json({
          status: 404,
          message: "No data found for the provided id",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    });
});


router.post("/", async (req, res) => {
  try {
    const { error } = blogSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    req.body.platform = { ...req.headers };

    const newBlog = await Blog.create(req.body);

    res
      .status(201)
      .json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/", (req, res) => {
  const {id} = req.query;
  const data = req.body;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Blog.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "Blog does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully updated Blog data",
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

router.delete("/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res
      .status(200)
      .json({ message: "Blog deleted successfully", blog: deletedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
