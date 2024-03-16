const express = require("express");
const router = express.Router();
const { Feed } = require("../../schemas/Feed");
const { LatestFeeds } = require("../../schemas/LatestFeeds");
const { ObjectId } = require("mongodb");

function removeSpecialCharacters(url) {
  // Regular expression to match special characters
  const regex = /[^\w\s\-?@#$%*!]/g;

  // Replace special characters with empty string
  const sanitizedUrl = url.replace(regex, "");

  return sanitizedUrl;
}

function getUniqueValuesFromObjectKey(items, property) {
  const uniqueValues = {};

  items.forEach((item) => {
    if (Array.isArray(item[property])) {
      item[property].forEach((value) => {
        if (uniqueValues[value]) {
          uniqueValues[value] += 1;
        } else {
          uniqueValues[value] = 1;
        }
      });
    }
  });
  return Object.entries(uniqueValues).map(([name, count]) => ({
    name: name.toLowerCase(),
    count,
  }));
}
function getUniqueAuthors(data) {
  const uniqueAuthors = {};

  data.forEach((item) => {
    if (Array.isArray(item.author)) {
      item.author.forEach((author) => {
        if (author._id) {
          uniqueAuthors[author._id] = author;
        }
      });
    } else if (item.author && item.author._id) {
      uniqueAuthors[item.author._id] = item.author;
    }
  });

  return Object.values(uniqueAuthors);
}
router.get("/", async (req, res) => {
  try {
    const { search, keyword, category, author, tag, type } = req.query;
    let query = {};
    if (category) {
      query = {
        $or: [
          { category: { $regex: category, $options: "i" } },
          { tags: { $regex: category, $options: "i" } },
        ],
      };
    } else if (tag) {
      query = { tags: { $in: tag } };
    } else if (author) {
      query = { "author._id": author };
    } else if (search) {
      query = { id: { $regex: search, $options: "i" } };
    } else if (keyword) {
      query = { id: keyword };
    }
    else if (type) {
      query = { type };
    }
    const data = await Feed.find(query);
    if (data.length === 0) {
      return res
        .status(200)
        .json({ status: 200, message: "Component does not exist" });
    }
    const authorsFromData = getUniqueAuthors(data);
    const tagsFromData = getUniqueValuesFromObjectKey(
      data.map((i) => i),
      "tags"
    );
    const categoriesFromData = getUniqueValuesFromObjectKey(
      data.map((i) => i),
      "category"
    );
    return res.status(200).json({
      status: 200,
      message: "Success",
      count: data.length,
      data: {
        tags: tagsFromData,
        authors: authorsFromData,
        category: categoriesFromData,
        feed: data,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

// router.get("/tags", async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     let query = {};
//     if (keyword) {
//       query = {
//         $or: [
//           { category: { $regex: keyword, $options: "i" } },
//           { tags: { $regex: keyword, $options: "i" } },
//         ],
//       };
//     }
//     const data = await Feed.find(query);
//     if (data.length === 0) {
//       return res
//         .status(200)
//         .json({ status: 200, message: "Component does not exist" });
//     } else {
//       if (keyword) {
//         return res.status(200).json({
//           status: 200,
//           message: `${data.length} items found for the keyword ${keyword}`,
//           count: data.length,
//         });
//       } else {
//         // console.log(category);

//         return res.status(200).json({
//           status: 200,
//           message: "Success",
//           tags: tags,
//           authors: authors,
//           category: category,
//         });
//       }
//     }
//   } catch (err) {
//     return res.status(500).json({
//       status: 500,
//       message: "Server error in processing your request",
//     });
//   }
// });

router.post("/", (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    const form = new Feed({
      ...data,
      id: removeSpecialCharacters(
        data.displayName.toString().toLowerCase().replace(/ /g, "-")
      ),
    });
    form
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { Feed: form },
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
    Feed.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res.status(400).json({
            status: 400,
            message: "Feed does not exist",
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
    Feed.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res.status(200).json({
            status: 200,
            message: "Feed does not exist",
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted Feed`,
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

router.post("/latestFeeds", async (req, res) => {
  const feedData = req.body

  if (!feedData) {
    res.status(400).json({ status: 400, message: "Invalid data"});
  }
  try {
    const result = await LatestFeeds.create(feedData) 
    if (result) {
      res.status(200).json({
        status: 200,
        message: "Feeds has been created successfully",
      });
    }
  }
  catch(error) {

    res.status(500).json({
      status: 500,
      message: "Error in creating the feed data",
    });
  } 
})

router.get("/latestFeeds/:id", async (req, res) => {
  const feedId = req.params.id

  if (!feedId) {
    res.status(400).json({ status: 400, message: "Invalid feed id"});
  }
  try {
    const result = await LatestFeeds.find({ _id: new ObjectId(feedId) })
    if (result) {
      res.status(200).json({
        status: 200,
        data: result,
      });
    }
  }
  catch(error) {
    res.status(500).json({
      status: 500,
      message: "Error in fetching the feed data by id",
    });
  } 
})

router.get("/latestFeeds", async (req, res) => {
  try {
    const result = await LatestFeeds.find()  
    if (result) {
      res.status(200).json({
        status: 200,
        count: result.length,
        data: result,
      });
    }
  }
  catch(error) {
    res.status(500).json({
      status: 500,
      message: "Error in fetching all the feeds",
    });
  } 
})

router.put("/latestFeeds/:id", async (req, res) => {
  const feedUpdatedData = req.body
  const feedId = req.params.id

  if (!feedUpdatedData) {
    res.status(400).json({ status: 400, message: "Invalid feed update data"});
  }
  try {
    const updateDoc = {
      $set: feedUpdatedData
    }
    const result = await LatestFeeds.updateOne({ _id: new ObjectId(feedId) }, updateDoc)
    if (result) {
      res.status(200).json({
        status: 200,
        message: "Feed data has been updated successfully",
        data: result,
      });
    }
  }
  catch(error) {
    res.status(500).json({
      status: 500,
      message: "Error while updating the feed data",
    });
  } 
})

router.delete("/latestFeeds/:id", async (req, res) => {
  const feedId = req.params.id
  if (!feedId) {
    res.status(400).json({ status: 400, message: "Invalid feed id"});
  }
  try {
    const result = await LatestFeeds.deleteOne({ _id: new ObjectId(feedId) })
    if (result) {
      res.status(200).json({
        status: 200,
        message: "Feed data has been deleted successfully",
        data: result,
      });
    }
  }
  catch(error) {
    res.status(500).json({
      status: 500,
      message: "Error while deleting the feeds",
    });
  } 
})


module.exports = router;
