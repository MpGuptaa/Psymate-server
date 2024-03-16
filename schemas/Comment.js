const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        reference: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        hide: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true
    }
);

const CommentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        reference: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        replies: [ReplySchema],
        hide: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true
    }
);

const Reply = mongoose.model("Reply", ReplySchema);

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = { Reply, Comment };