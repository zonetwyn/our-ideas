const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const Joi = require('joi');

const messageSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

messageSchema.plugin(mongoosePaginate);
const Message = mongoose.model('Message', messageSchema);

const messageValidator = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required()
});

module.exports = { Message, messageValidator };