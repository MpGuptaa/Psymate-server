const express = require("express");
const Combo = require('../../schemas/Combo');
const { paginateQuery } = require("../../utils/Helper");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { body, validationResult } = require("express-validator");

const validateCombo = [
    body("id").notEmpty().withMessage("ID is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("collections").notEmpty().withMessage("Collections is required"),
    body("displayName").notEmpty().withMessage("Display Name is required"),
    body("quantity").isNumeric().withMessage("Quantity must be a number")
];

router.get("/", async (req, res) => {
    try {
        const { search, keyword, name, searchBy, page = 1, limit = 10 } = req.query;
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
        const totalDocuments = await Combo.countDocuments(query);

        // Create a paginated query using the paginateQuery function
        const paginatedQuery = paginateQuery(
            Combo.find(query),
            parseInt(page, 10),
            parseInt(limit, 10)
        );

        // Execute the paginated query
        const data = await paginatedQuery.exec();

        if (data.length === 0) {
            return res
                .status(200)
                .json({ status: 200, message: "Combo does not exist" });
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

router.post("/", validateCombo, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if a combo with the same ID already exists
        const existingCombo = await Combo.findOne({ id: req.body.id });

        if (existingCombo) {
            return res.status(400).json({ message: "Combo with this ID already exists" });
        }

        // Create a new combo
        const combo = new Combo(req.body);
        await combo.save();

        res.status(200).json({ message: `Combo created successfully`, combo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id", validateCombo, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const comboId = req.params.id;

        // Find the existing combo based on _id
        const existingCombo = await Combo.findOne({ id: req.body.id, _id: { $ne: comboId } });

        if (existingCombo) {
            return res.status(400).json({ message: "Combo with this ID already exists" });
        }

        // Find the combo based on _id
        const combo = await Combo.findById(comboId);

        if (!combo) {
            return res.status(404).json({ message: "Combo not found" });
        }

        // Update the combo's fields based on the request body
        Object.assign(combo, req.body);

        // Save the updated combo
        await combo.save();

        res
            .status(200)
            .json({ message: "Combo updated successfully", combo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a specific combo by ID
router.delete("/:id", async (req, res) => {
    try {
        const comboId = req.params.id;

        // Find the combo based on _id
        const combo = await Combo.findByIdAndDelete(comboId);

        if (!combo) {
            return res.status(404).json({ message: "Combo not found" });
        }

        res.status(200).json({
            message: "Combo deleted successfully",
            deletedCombo: combo,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;