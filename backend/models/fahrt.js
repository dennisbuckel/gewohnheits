const mongoose = require('mongoose');

const fahrtSchema = new mongoose.Schema({
    von: {
        type: String,
        required: true,
        trim: true
    },
    bis: {
        type: String,
        required: true,
        trim: true
    },
    km: {
        type: Number,
        required: true,
        min: 0
    },
    zeit: {
        type: String,
        required: true
    },
    emissionsfrei: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
}, {
    timestamps: true // Fügt createdAt und updatedAt Felder hinzu
});

module.exports = mongoose.model('Fahrt', fahrtSchema);
