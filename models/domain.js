const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const Joi = require('joi');

const domainSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

domainSchema.plugin(mongoosePaginate);
const Domain = mongoose.model('Domain', domainSchema);

const domainValidator = Joi.object().keys({
    name: Joi.string().min(6).required(),
    description: Joi.string().min(6).required(),
});

module.exports = { Domain, domainValidator }; 