const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const Joi = require('joi');

const enums = require('../utils/enums');

const userSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: enums.UserRoles[0],
        enum: enums.UserRoles
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: enums.UserStatus[0],
        enum: enums.UserStatus
    }
});

userSchema.plugin(mongoosePaginate);
const User = mongoose.model('User', userSchema);

const userValidator = Joi.object().keys({
    role: Joi.string().valid(enums.UserRoles).required(),
    username: Joi.string().min(4).required(),
    password: Joi.string().min(4).required()
});

module.exports = { User, userValidator }; 