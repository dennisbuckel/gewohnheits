const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HabitSchema = new Schema({
    date: { type: Date, required: true },
    habit: { type: String, required: true },
    status: { type: String, required: true },
});

module.exports = mongoose.model('Habit', HabitSchema);
