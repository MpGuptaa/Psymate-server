const express = require("express");
const router = express.Router();
const { Courses } = require("../../schemas/Courses");
const { ObjectId } = require("mongodb");

router.get("/all", (req, res) => {
  const search = req.query.search;
  if (search) {
    Courses.find({ title: { $regex: search, $options: "i" } })
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
    Courses.find()
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

router.get("/", (req, res) => {
  const search = req.query.search;
  const keyword = req.query.keyword;
  const type = req.query.type;
  const userId = req.query.userId;
  if (id) {
    Courses.findOne({ _id: id })
      .then((success) => {
        if (success === null) {
          res
            .status(200)
            .json({ status: 200, message: "Courses does not exist" });
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
  } else if (search) {
    Courses.find({ displayName: { $regex: search, $options: "i" } })
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
  } else if (keyword) {
    Courses.find({ displayName: keyword })
      .then((response) => {
        console.log("reached keyword");
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
    Courses.find({})
      .then((success) => {
        if (success === null) {
          res
            .status(200)
            .json({ status: 200, message: "Courses does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: `Success`,
            data: success,
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
// get course by id
router.get("/:id", async (req, res) => {
  const courseId = req.params.id;

  if (!courseId) {
    res.status(400).json({ status: 400, message: "Invalid course id id" });
  }
  try {
    const result = await Courses.find({ _id: new ObjectId(courseId) });
    if (result) {
      res.status(200).json({
        status: 200,
        data: result,
        count: result.length,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error in fetching the details details data by id",
    });
  }
});


router.post("/", (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const form = new Courses(data);
    form
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { Courses: form },
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
    Courses.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Courses does not exist",
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
    Courses.findOneAndDelete({ _id: new ObjectId(id) })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Courses does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Courses`,
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
