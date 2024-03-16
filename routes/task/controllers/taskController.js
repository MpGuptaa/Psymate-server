const catchAsyncErrors = require("../../../middleware/catchAsyncErrors");
const { Task, validateTask } = require("../../../schemas/Task");
const { createQuery } = require("../../../utils/Helper");
const { User } = require("../../../schemas/User");
const Joi = require('joi');
const taskIdSchema = Joi.object({
    taskId: Joi.string().required(),
});

// create new task 
const createTask = catchAsyncErrors(async (req, res) => {
    const { error } = validateTask(req.body);
    if (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    const task = await Task.create(req.body);
    res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
    });
});


// get all tasks
const getallTasks = catchAsyncErrors(async (req, res) => {
    if (req.query.taskId) {
        const { error: validationError } = taskIdSchema.validate(req.query);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError.details[0].message,
            });
        }
        const tasks = await Task.findById(req.query.taskId);
        if (!tasks) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }
        const reporter = await User.findById(tasks.reporter);
        if (!reporter) {
            return res.status(404).json({
                success: false,
                message: 'Reporter not found',
            });
        }
        const assignee = tasks.assignee;
        let assigneeDetails = [];
        assigneeDetails = await Promise.all(assignee.map(async (userId) => {
            const user = await User.findById(userId);
            return user;
        }));
        return res.status(200).json({
            tasks: { ...tasks, assigneeDetails, reporter }
        });
    }
    let query = {};
    if (req.query.itemId) {
        query = { projectId: req.query.itemId };
    }

    const search = req.query.Keyword;
    const searchBy = req.query.searchBy;
    const searchQuery = createQuery(search, searchBy);

    const combinedQuery = {
        $and: [
            query,
            searchQuery
        ]
    };
    const tasks = await Task.find(combinedQuery);
    res.status(200).json({
        tasks
    });
});

// update task status 
const updateTaskstatus = catchAsyncErrors(async (req, res) => {
    const taskId = req.params.id;

    try {
        const { error } = validateTask(req.body, { status: Joi.string().required() });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        if (req.body.status === 'Done') {
            return res.status(400).json({
                success: false,
                message: "Task is already done",
            });
        }

        if (req.body.status === task.status) {
            return res.status(400).json({
                success: false,
                message: "Task is already in this state",
            });
        }

        // Push changes to the history
        task.history.push({
            timestamp: Date.now(),
            changes: {
                field: 'status',
                from: task.status,
                to: req.body.status,
                user: req.user.id, // Assuming user information is available in the request
            },
        });

        task.status = req.body.status; // Update the status

        // Save the updated task
        await task.save();

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update task",
            error: error.message,
        });
    }
});

// Delete Task
const deleteTask = catchAsyncErrors(async (req, res) => {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
})
module.exports = { createTask, getallTasks, updateTaskstatus, deleteTask };
