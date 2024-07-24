const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// Alle Habits abrufen
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.find().sort({ date: -1 }); // Ändere die Sortierung auf absteigend
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

// Habit aktualisieren
router.put('/:id', async (req, res) => {
    try {
        const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.json(habit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Habit löschen
router.delete('/:id', async (req, res) => {
    try {
        const habit = await Habit.findByIdAndDelete(req.params.id);
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.json({ message: 'Habit deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
