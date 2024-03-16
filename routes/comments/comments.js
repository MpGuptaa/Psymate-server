const express = require("express");
const router = express.Router();
const { Comment, Reply } = require("../../schemas/Comment");
const Joi = require('joi');

// Validation schema using Joi
const commentSchema = Joi.object({
    text: Joi.string().required(),
    author: Joi.string().required(),
    reference: Joi.string().required(),
});

const replySchema = Joi.object({
    text: Joi.string().required(),
    author: Joi.string().required(),
});

// Middleware function for request validation
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        next();
    };
};

router.post("/", validateRequest(commentSchema), async (req, res) => {
    try {
        const { text, author, reference } = req.body;

        if (!text || !author || !reference) {
            return res.status(400).json({ success: false, message: 'Please provide valid text, author, and reference for the comment.' });
        }

        const newComment = await Comment.create({ text, author, reference });
        res.json({
            success: true,
            message: 'Comment created successfully',
            comment: newComment,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating comment', error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching comments', error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        res.json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching comment', error: error.message });
    }
});

router.post("/:id/replies", validateRequest(replySchema), async (req, res) => {
    try {
        const { text, author } = req.body;
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (!text || !author) {
            return res.status(400).json({ success: false, message: 'Please provide valid text and author for the reply.' });
        }

        const newReply = { text, author, reference: req.params.id };
        comment.replies.push(newReply);
        await comment.save();
        res.json({ success: true, message: 'Reply added successfully', comment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding reply', error: error.message });
    }
});

router.put("/:id/:userId", validateRequest(commentSchema), async (req, res) => {
    try {
        const { text } = req.body;
        const commentId = req.params.id;
        const userId = req.params.userId;

        // Validate if the user has the correct permissions (e.g., you may have a user authentication system)
        if (userId !== 'someExpectedUserId') {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }

        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { $set: { text } },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (!text) {
            return res.status(400).json({ success: false, message: 'Please provide valid text for the comment update.' });
        }

        res.json({ success: true, message: 'Comment updated successfully', comment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating comment', error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting comment', error: error.message });
    }
});

router.delete("/:commentId/replies/:replyId", async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        comment.replies.pull({ _id: req.params.replyId });
        await comment.save();
        res.json({ success: true, message: 'Reply deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting reply', error: error.message });
    }
});



module.exports = router;