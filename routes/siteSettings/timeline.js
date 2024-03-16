const express = require("express");
const router = express.Router();
const { Timeline } = require("../../schemas/Timeline");
const { ObjectID } = require("bson");
const { createQuery, paginateQuery } = require("../../utils/Helper");

router.get("/", async (req, res) => {
  try {
    const {
      search,
      exact,
      boolean,
      searchBy,
      operation,
      operator,
      page = 1,
      limit = 10,
    } = req.query;
    const query = createQuery(
      search,
      searchBy,
      exact,
      boolean,
      operation,
      operator
    );
    // Create a paginated query using the paginateQuery function
    const paginatedQuery = paginateQuery(
      Timeline.find(query),
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    const totalDocuments = await Timeline.countDocuments(query);

    // Execute the paginated query
    const data = await paginatedQuery.exec();

    if (data.length === 0) {
      return res
        .status(200)
        .json({ status: 200, message: "Timeline Does not exists" });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/", (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const form = new Timeline(data);
    form
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { Timeline: form },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

router.put("/", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    Timeline.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Timeline does not exist",
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
    Timeline.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Timeline does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Timeline`,
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
