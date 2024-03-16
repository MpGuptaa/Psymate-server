const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { Roles } = require("../../schemas/roles");
const Joi = require('joi');

const roleSchema = Joi.object({
  displayName: Joi.string().required(),
  description:Joi.string().required(),
  code: Joi.number().required()})


// GET Route: Get Roles with pagination and search
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, searchBy, search, exact, boolean, id } = req.query;
    let query = {};

    if (id) {
      query = Roles.findOne({ _id: id });
    } else {
     
      query = createQuery(search, searchBy, exact, boolean);
    }

    // Get the total count of documents that match the query
    const totalDocuments = await Roles.countDocuments(query);

    // Create a paginated query using the paginateQuery function
    const paginatedQuery = paginateQuery(
      Roles.find(query),
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    // Execute the paginated query
    const data = await paginatedQuery.exec();

    if (data.length === 0) {
      return res.status(200).json({ status: 200, message: "Roles do not exist" });
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

router.post("/", async (req, res) => {
  try {
    // Validate the request body using Joi schema
    const { error, value } = roleSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Invalid role details",
        error: error.details,
      });
    }

    // Create a new role based on the validated data
    const newRole = new Roles(value);

    // Save the new role to the database
    const savedRole = await newRole.save();

    return res.status(201).json({
      status: 201,
      message: "Role created successfully",
      data: savedRole,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Error creating role in the database",
    });
  }
});


router.put('/', async (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  const schema = Joi.object({
    id: Joi.string().required(),
    data: Joi.object().required(),
  });
  const { error } = schema.validate({
    id: id,
    data: data,
  });
  if (error) {
    return res
      .status(400)
      .json({ status: 400, message: error.details[0].message });
  }
  try {
    const result = await Roles.findOneAndUpdate(
      { _id: id },
      { ...data },
      { new: true }
    );
    if (result === null) {
      res.status(400).json({ status: 400, message: 'Feed does not exist' });
    } else {
      res.status(200).json({
        status: 200,
        message: 'Successfully updated feed data',
        data: { ...result._doc },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Error. Please try again',
    });
  }
});

// DELETE Route: Turn off the Active key for a role
router.delete("/roles/:id", async (req, res) => {
  try {
    const roleId = req.params.id;

    const updatedRole = await Roles.findByIdAndUpdate(roleId, { active: false }, { new: true });

    if (!updatedRole) {
      return res.status(404).json({ status: 404, message: "Role not found" });
    }

    return res.status(200).json({ status: 200, message: "Role deactivated successfully", data: updatedRole });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 500, message: "Error deactivating role in the database" });
  } 
});

// Helper function to create a paginated query
function paginateQuery(query, page, limit) {
  const startIndex = (page - 1) * limit;
  return query.skip(startIndex).limit(limit);
}

function createQuery(search, searchBy, exact, boolean) {
  // Add your custom logic to create the query based on searchBy, search, exact, boolean
  // For simplicity, I'm returning an empty query
  return {};
}
module.exports = router;


