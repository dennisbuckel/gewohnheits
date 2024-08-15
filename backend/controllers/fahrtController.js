const Fahrt = require('../models/fahrt');

exports.getFahrten = async (req, res) => {
    try {
        const fahrten = await Fahrt.find({});
        res.json({ success: true, entries: fahrten });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};

exports.createFahrt = async (req, res) => {
    const neueFahrt = new Fahrt(req.body);
    try {
        const savedFahrt = await neueFahrt.save();
        res.json({ success: true, entry: savedFahrt });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};

exports.deleteFahrt = async (req, res) => {
    try {
        const deletedFahrt = await Fahrt.findByIdAndDelete(req.params.id);
        if (!deletedFahrt) {
            return res.status(404).json({ success: false, message: 'Fahrt not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};
