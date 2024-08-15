const mongoose = require('mongoose');
const Habit = require('../models/habit');

exports.getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({});
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createHabit = async (req, res) => {
    const { date, habit, status } = req.body;
    const newHabit = new Habit({ date, habit, status });

    try {
        await newHabit.save();
        res.status(201).json(newHabit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateHabit = async (req, res) => {
    const { id } = req.params;
    const { date, habit, status } = req.body;

    try {
        // Konvertiere die ID in ein ObjectId
        const objectId = mongoose.Types.ObjectId(id);

        const updatedHabit = await Habit.findByIdAndUpdate(
            objectId,  // Verwende das konvertierte ObjectId
            { date, habit, status },
            { new: true }
        );
        if (!updatedHabit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.json(updatedHabit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteHabit = async (req, res) => {
    const { id } = req.params;

    try {
        // Konvertiere die ID in ein ObjectId
        const objectId = mongoose.Types.ObjectId(id);

        const deletedHabit = await Habit.findByIdAndDelete(objectId);
        if (!deletedHabit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.status(204).json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
