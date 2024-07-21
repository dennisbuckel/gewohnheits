const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    habit: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Habit', habitSchema);
