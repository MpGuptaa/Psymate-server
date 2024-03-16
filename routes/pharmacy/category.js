const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { MedicineCategory } = require("../../schemas/Pharmacy");

router.get("/categories", (req, res) => {
  const search = req.query.search;
  if (search) {
    MedicineCategory.find({ name: { $regex: search, $options: "i" } })
      .then((response) => {
        res.json({ status: 200, data: response, message: `Success` });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  } else {
    MedicineCategory.find()
      .then((response) => {
        res.json({ status: 200, data: response, message: `Success` });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Server error in processing your request",
        });
      });
  }
});

router.get("/category", (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    MedicineCategory.findOne({ _id: id })
      .then((success) => {
        if (success === null) {
          res
            .status(200)
            .json({ status: 200, message: "Medicine Category does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: `Success`,
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

router.post("/category", (req, res) => {
  const data = req.body.data;
  console.log(req.body);
  if (!data || !data.name) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const id = uuidv4();
    const medicineCategory = new MedicineCategory({
      ...data,
      id: id,
      subcategory: [],
    });
    medicineCategory
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { _id: id },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

router.put("/category", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    MedicineCategory.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "Category does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully updated category data",
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

router.delete("/category", (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    MedicineCategory.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res
            .status(200)
            .json({ status: 200, message: "Category does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted category`,
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

router.post("/subcategory", (req, res) => {
  const categoryID = req.query.categoryID;
  const data = req.body.data;
  if (!categoryID || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const subcategoryID = uuidv4();
    MedicineCategory.findOneAndUpdate(
      { id: categoryID },
      { $push: { subcategory: { ...data, id: subcategoryID } } },
      { new: true }
    )
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "Category does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully updated category data",
            data: { ...data, id: subcategoryID },
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
router.put("/subcategory", (req, res) => {
  const categoryID = req.query.categoryID;
  const subcategoryID = req.query.subcategoryID;
  const data = req.body.data;
  if (!categoryID || !subcategoryID || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    MedicineCategory.findOneAndUpdate(
      { id: categoryID, "subcategory.id": subcategoryID },
      {
        $set: {
          "subcategory.$.name": data.name,
          "subcategory.$.products": data.products,
        },
      }
    )
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "Category does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully updated subcategory data",
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

router.delete("/subcategory", (req, res) => {
  const categoryID = req.query.categoryID;
  const subcategoryID = req.query.subcategoryID;
  if (!categoryID || !subcategoryID) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    MedicineCategory.findOneAndUpdate(
      { id: categoryID },
      {
        $pullAll: {
          subcategory: [{ id: subcategoryID }],
        },
      },
      { new: true }
    )
      .then((success) => {
        if (success === null) {
          res
            .status(200)
            .json({ status: 200, message: "Category does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted subcategory`,
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
