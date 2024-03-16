const express = require("express");
const router = express.Router();
const { NewForms } = require("../../schemas/NewForms");
const { ObjectId } = require("mongodb");
const {
  generateRandomId,
  createQuery,
  paginateQuery,
} = require("../../utils/Helper");

const ISO6391 = require('iso-639-1');
const countryList = require('country-state-city').Country
const StateList = require('country-state-city').State
router.get('/languages', (req, res) => {
  const languages = ISO6391.getAllNames().map(language => ({
    label: language,
    value: language
  }));
   res.send(languages);
});
router.get("/country", (req, res) => {
  const countryName = countryList.getAllCountries().map(country => ({
    label: country.name,
    value:country.name,
    countryisoCode: country.isoCode
  }));
  res.send(countryName);

})
router.get("/state/:stateIsoCode", (req, res) => {
  // // console.log(countryList.getCountryByCode("IN"));
  const { stateIsoCode } = req.params
  const AllState = StateList.getStatesOfCountry(stateIsoCode)
  const sortedStates = AllState
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(state => ({
      label: state.name,
      value: state.isoCode // Assuming state has an isoCode property
    }));

  res.send(sortedStates);

})

router.get("/", async (req, res) => {
  try {
    const {
      exact,
      searchBy,
      search,
      id,
      boolean,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};

    if (id) {
      query = NewForms.findOne({ _id: id });
    } else {
      query = createQuery(search, searchBy, exact, boolean);
    }
    // Get the total count of documents that match the query
    const totalDocuments = await NewForms.countDocuments(query);

    // Create a paginated query using the paginateQuery function
    const paginatedQuery = paginateQuery(
      NewForms.find(query),
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
    const form = new NewForms(data);
    form
      .save()
      .then((result) => {
        res.json({
          status: "200",
          message: "Success",
          data: { forms: form },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error. Please try again" });
      });
  }
});

router.post("/inputs", async (req, res) => {
  try {
    const updatedUser = await NewForms.findOneAndUpdate(
      { _id: new ObjectId(req.body._id) },
      {
        $push: {
          items: { ...req.body.item, id: generateRandomId("number", 10) },
        },
      }, // Use $push to push the new item into the 'items' array
      { returnOriginal: false }
    );

    // Extract only the necessary data from the updatedUser object to avoid circular references
    const responseData = {
      _id: updatedUser._id,
      items: updatedUser.items,
      // Add other properties that you want to include in the response
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    NewForms.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "NewForms does not exist" });
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
router.put("/hard/save", (req, res) => {
  const id = req.query.id;
  const data = req.body.data;

  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    NewForms.findOneAndUpdate({ _id: id }, { ...data }, { new: true })
      .then((result) => {
        if (result === null) {
          res
            .status(400)
            .json({ status: 400, message: "NewForms does not exist" });
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
router.put("/inputs", async (req, res) => {
  try {
    const { id } = req.query;
    // Use findOneAndUpdate with $set to update the specific item in the 'items' array
    const updatedUser = await NewForms.findOneAndUpdate(
      { "items.id": id },
      { $set: { "items.$[elem]": req.body } },
      {
        returnOriginal: false,
        arrayFilters: [{ "elem.id": id }],
      }
    );

    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({
        code: 404,
        error: "User with the provided ID not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update item" });
  }
});
router.delete("/", (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    NewForms.findOneAndDelete({ _id: id })
      .then((success) => {
        if (success === null) {
          res
            .status(200)
            .json({ status: 200, message: "NewForms does not exist" });
        } else {
          res.status(200).json({
            status: 200,
            message: `Successfully deleted NewForms`,
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
router.delete("/inputs", async (req, res) => {
  try {
    const { id } = req.query;
    // Use findOneAndUpdate with $set to update the specific item in the 'items' array
    const updatedUser = await NewForms.findOneAndUpdate(
      { "items.id": id },
      { $pull: { items: { id: id } } },
      { returnOriginal: false }
    );

    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({
        code: 404,
        error: "User with the provided ID not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update item" });
  }
});
module.exports = router;
