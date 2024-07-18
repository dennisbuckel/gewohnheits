const express = require('express');
const router = express.Router();
const PastList = require('../models/pastlists');

// GET all past lists
router.get('/', async (req, res) => {
    try {
        const pastLists = await PastList.find();
        res.json(pastLists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }z
});

// POST a new past list
router.post('/', async (req, res) => {
    const pastList = new pastList({
        name: req.body.name,
        entries: req.body.entries
    });

    try {
        const newPastList = await pastList.save();
        res.status(201).json(newPastList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
