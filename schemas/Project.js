const mongoose = require('mongoose');
const Joi = require("joi");

const projectSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    displayName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'care',
        required: true,
    },
    access: [{
        type: mongoose.Schema.ObjectId,
        ref: "User",
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const projectValidationSchema = Joi.object({
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    displayName: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().default('care').required(),
    access: Joi.array().items(Joi.string().trim()), 
    createdAt: Joi.date(),
});
function validateProject(project) {
    return projectValidationSchema.validate(project);
}

const Project = mongoose.model('Project', projectSchema);
module.exports = { Project, validateProject };
