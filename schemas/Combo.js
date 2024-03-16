const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        collections: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        }
    }
);

const Combo = mongoose.model("Combo", comboSchema);

module.exports = Combo;