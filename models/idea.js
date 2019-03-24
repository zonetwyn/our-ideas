const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const Joi = require('joi');

const enums = require('../utils/enums');

const ideaSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    unlikes: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: enums.IdeaStatus[0],
        enum: enums.IdeaStatus
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    }
});

ideaSchema.plugin(mongoosePaginate);
const Idea = mongoose.model('Idea', ideaSchema);

const ideaValidator = Joi.object().keys({
    content: Joi.string().min(8).required(),
    subject: Joi.string().required()
});

module.exports = { Idea, ideaValidator }; 