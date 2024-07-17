const express = require('express');
const router = express.Router();
const Habit = require('../models/habit');

// GET all habits
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.find();
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new habit
router.post('/', async (req, res) => {
    const habit = new Habit({
        date: req.body.date,
        habit: req.body.habit,
        status: req.body.status
    });

    try {
        const newHabit = await habit.save();
        res.status(201).json(newHabit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE all habits
router.delete('/', async (req, res) => {
    try {
        await Habit.deleteMany({});
        res.status(204).json({ message: 'All habits deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
