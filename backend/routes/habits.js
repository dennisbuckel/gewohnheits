const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');  // Stelle sicher, dass der Pfad korrekt ist

// GET /api/habits
router.get('/', habitController.getHabits);

// POST /api/habits
router.post('/', habitController.createHabit);

// PUT /api/habits/:id
router.put('/:id', habitController.updateHabit);

// DELETE /api/habits/:id
router.delete('/:id', habitController.deleteHabit);

module.exports = router;
