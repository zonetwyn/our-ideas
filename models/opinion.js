const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const opinionSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

opinionSchema.plugin(mongoosePaginate);
const Opinion = mongoose.model('Opinion', opinionSchema);

module.exports = { Opinion }