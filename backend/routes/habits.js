const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// Alle Habits abrufen
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.find().sort();
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Neuen Habit erstellen
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

// Alle Habits löschen (zum Beispiel nach Archivierung)
router.delete('/', async (req, res) => {
    try {
        await Habit.deleteMany();
        res.json({ message: 'Alle Habits gelöscht' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Meistgenutzte Habits abrufen
router.get('/top', async (req, res) => {
    try {
        const habits = await Habit.aggregate([
            { $group: { _id: "$habit", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.json(habits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
