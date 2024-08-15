const Habit = require('../models/Habit');

exports.getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({});
        res.json(habits);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.createHabit = async (req, res) => {
    const { date, habit, status } = req.body;
    const newHabit = new Habit({ date, habit, status });

    try {
        await newHabit.save();
        res.status(201).json(newHabit);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.updateHabit = async (req, res) => {
    const { id } = req.params;
    const { date, habit, status } = req.body;

    try {
        const updatedHabit = await Habit.findByIdAndUpdate(
            id,
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
};

exports.deleteHabit = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedHabit = await Habit.findByIdAndDelete(id);
        if (!deletedHabit) {
            return res.status(404).send('Habit not found');
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).send('Error deleting habit');
    }
};
