const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Passwort überprüfen
app.post('/api/check-password', (req, res) => {
    const { password } = req.body;
    const correctPassword = process.env.CORRECT_PASSWORD; // Passwort aus .env-Datei

    if (password === correctPassword) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Falsches Passwort' });
    }
});

app.use('/api/habits', require('./routes/habits'));
app.use('/api/pastLists', require('./routes/pastLists'));

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

