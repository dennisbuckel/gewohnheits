const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is not set');
}

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
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
            mongoose.Types.ObjectId(id),  // Konvertiere die ID zu ObjectId
            { date, habit, status },
            { new: true }
        );
        if (!updatedHabit) {
            return res.status(404).send('Habit not found');
        }
        res.json(updatedHabit);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/api/habits/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Deleting habit with id: ${id}`);

    try {
        const deletedHabit = await Habit.findByIdAndDelete(mongoose.Types.ObjectId(id));  // Konvertiere die ID zu ObjectId
        if (!deletedHabit) {
            console.log(`Habit with id ${id} not found`);
            return res.status(404).send('Habit not found');
        }
        console.log(`Habit with id ${id} deleted`);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.status(400).send('Error deleting habit');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
