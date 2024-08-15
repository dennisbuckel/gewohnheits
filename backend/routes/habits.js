const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

// Alle Habits abrufen
router.get('/', habitController.getAllHabits);

// Neuen Habit erstellen
router.post('/', habitController.createHabit);

// Habit aktualisieren
router.put('/:id', habitController.updateHabit);

// Habit löschen
router.delete('/:id', habitController.deleteHabit);

module.exports = router;
