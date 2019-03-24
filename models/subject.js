const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const Joi = require('joi');

const enums = require('../utils/enums');

const subjectSchema = new Schema({
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
        default: enums.SubjectStatus[0],
        enum: enums.SubjectStatus
    },
    ideasCount: {
        type: Number,
        default: 0
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    domains: {
        type: [{ 
            type: Schema.Types.ObjectId,
            ref: 'Domain'
        }],
        required: true
    }
});

subjectSchema.plugin(mongoosePaginate);
const Subject = mongoose.model('Subject', subjectSchema);

const subjectValidator = Joi.object().keys({
    title: Joi.string().min(8).required(),
    description: Joi.string().min(8).required(),
    domains: Joi.array().items(Joi.string()).required()
});

module.exports = { Subject, subjectValidator }; 