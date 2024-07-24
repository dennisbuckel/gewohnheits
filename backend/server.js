const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

mongoose.connect('YOUR_MONGODB_CONNECTION_STRING', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const HabitSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    habit: { type: String, required: true },
    status: { type: String, required: true }
});

const Habit = mongoose.model('Habit', HabitSchema);

app.get('/api/habits', async (req, res) => {
    try {
        const habits = await Habit.find({});
        res.json(habits);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/api/habits', async (req, res) => {
    const { date, habit, status } = req.body;
    const newHabit = new Habit({ date, habit, status });

    try {
        await newHabit.save();
        res.status(201).json(newHabit);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.put('/api/habits/:id', async (req, res) => {
    const { id } = req.params;
    const { date, habit, status } = req.body;

    try {
        const updatedHabit = await Habit.findByIdAndUpdate(
            id,
            { date, habit, status },
            { new: true }
        );
        res.json(updatedHabit);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/api/habits/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Habit.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
