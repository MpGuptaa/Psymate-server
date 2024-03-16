const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { Medicine, MedicineCategory } = require("../../schemas/Pharmacy");
const { paginateQuery } = require("../../utils/Helper");

router.get("/", async (req, res) => {
  try {
    const { search, keyword, name, searchBy, page, limit } = req.query;
    let query = {};

    if (name) {
      query = { name: name };
    } else if (search) {
      query = {
        [searchBy ? searchBy : "category"]: { $regex: search, $options: "i" },
      };
    } else if (keyword) {
      query = { name: keyword };
    }

    // Get the total count of documents that match the query
    const totalDocuments = await Medicine.countDocuments(query);

    // Create a paginated query using the paginateQuery function
    const paginatedQuery = paginateQuery(
      Medicine.find(query),
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    // Execute the paginated query
    const data = await paginatedQuery.exec();

    if (data.length === 0) {
      return res
        .status(200)
        .json({ status: 200, message: "Component does not exist" });
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
    const medicine = new Medicine(data);
    console.log(medicine, data);
    medicine
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: medicine,
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
    Medicine.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "Medicine does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully updated Medicine data",
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
    Medicine.findOneAndDelete({ _id: id })
      .then((success) => {
        res
          .status(200)
          .json({ status: 200, message: "Medicine does not exist" });
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
