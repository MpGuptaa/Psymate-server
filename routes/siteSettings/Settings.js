const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { createQuery } = require("../../utils/Helper");
const { Blog } = require("../../schemas/Blogs");

router.get("/:collection", async (req, res) => {
  const { search, exact, searchBy, boolean, id } = req.query;
  const { collection } = req.params;
  const Collection = mongoose.connection.collection(collection);
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let query = createQuery(search, searchBy, exact, boolean);

  if (id != "" && id != undefined) {
    try {
      const data = await Blog.findById(id);
      if (!data) {
        return res.status(404).json({
          status: 404,
          message: "Blog not found",
        });
      }
      res.status(200).json({
        status: 200,
        message: "Success",
        data: data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    }
  } else {
    try {
      const totalDocuments = await Collection.countDocuments(query);
      const totalPages = Math.ceil(totalDocuments / limit);
      const data = await Collection.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      res.status(200).json({
        status: 200,
        message: "Success",
        data: data,
        total: totalDocuments,
        totalPages: totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    }
  }
});

router.post("/:collection", async (req, res) => {
  const collection = req.params.collection;
  const requestData = Joi.object({
    data: Joi.required(),
  });

  const { error } = requestData.validate({
    data: req.body,
  });

  try {
    if (error) {
      res.status(400).json({ status: 400, message: error.message });
    } else {
      const Collection = mongoose.connection.collection(collection);

      const result = await Collection.insertOne({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.json({
        status: 200,
        message: "Success",
        data: result,
      });
    }
  } catch (error) {
    console.error(error);
    // Handle other errors (e.g., database errors) with a 500 Internal Server Error response
    res.status(500).json({ message: "Error. Please try again" });
  }
});

router.put("/:collection", async (req, res) => {
  const { collection } = req.params;
  const { search, searchBy, exact, boolean } = req.query,
    query = createQuery(search, searchBy, exact, boolean);

  const data = req.body;
  const Collection = mongoose.connection.collection(collection);

  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    try {
      data._id && delete data._id;
      const result = await Collection.findOneAndUpdate(query, {
        $set: { ...data, updatedAt: new Date() },
      });
      if (!result) {
        res.status(400).json({ status: 400, message: "Data does not exist" });
      } else {
        res.status(200).json({
          status: 200,
          message: "Successfully updated data",
          data: result,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "Error. Please try again" });
    }
  }
});

router.delete("/:collection", async (req, res) => {
  const { collection } = req.params;
  const { search, searchBy, exact, boolean } = req.query,
    query = createQuery(search, searchBy, exact, boolean);

  const Collection = mongoose.connection.collection(collection);

  if (!search) {
    res.status(401).json({ status: 401, message: "No Query Found" });
  } else {
    try {
      const result = await Collection.findOneAndDelete(query);

      if (!result) {
        res.status(200).json({ status: 200, message: "Data does not exist" });
      } else {
        res.status(200).json({
          status: 200,
          message: `Successfully deleted data`,
          data: result,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "Server error" });
    }
  }
});

module.exports = router;
