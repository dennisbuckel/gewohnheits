const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PastListSchema = new Schema({
    name: { type: String, required: true },
    entries: [{
        date: { type: Date, required: true },
        habit: { type: String, required: true },
        status: { type: String, required: true }
    }]
});

module.exports = mongoose.model('PastList', PastListSchema);
