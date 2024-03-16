const mongoose = require("mongoose");
const Joi = require("joi");
const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide the task title"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    assignee: [{
        type: mongoose.Schema.ObjectId,
        ref: "User",
    }],
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done'],
        default: 'To Do',
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    projectId: {
        type: mongoose.Schema.ObjectId,
        ref: "Project",
    },
    reporter: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    endDate: {
        type: Date,
        required: [true, "Please provide the task deadline"],
    },
    ticketNumber: {
        type: Number,
        default: 1,
    },
    history: [
        {
            timestamp: {
                type: Date,
                default: Date.now,
            },
            changes: {
                field: {
                    type: String,
                    trim: true,
                },
                from: {
                    type: String,
                    trim: true,
                },
                to: {
                    type: String,
                    trim: true,
                },
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: "User",
                }
            },
        },
    ],
});

const taskValidationSchema = Joi.object({
    title: Joi.string().required().trim(),
    description: Joi.string().trim(),
    assignee: Joi.array().items(Joi.string().trim()),
    status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do'),
    createdBy: Joi.string().trim(),
    createdAt: Joi.date(),
    updatedAt: Joi.date().allow(null).allow(''),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Low'),
    projectId: Joi.string().trim(),
    reporter: Joi.string().trim().allow(''),
    endDate: Joi.string().required(),
    ticketNumber: Joi.number().default(1),
    history: Joi.array().items(
        Joi.object({
            timestamp: Joi.date().default(Date.now),
            changes: Joi.object({
                field: Joi.string().trim(),
                from: Joi.string().trim(),
                to: Joi.string().trim(),
                user: Joi.string().trim(),
            }),
        })
    ),
});
function validateTask(task) {
    return taskValidationSchema.validate(task);
}
const Task = mongoose.model("Task", taskSchema);
module.exports = { Task, validateTask };