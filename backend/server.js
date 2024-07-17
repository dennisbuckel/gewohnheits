const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();  // Dies lädt die Umgebungsvariablen aus der .env-Datei

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/habits', require('./routes/habits'));
app.use('/api/pastLists', require('./routes/pastLists'));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all handler to serve the index.html file for any request that doesn't match the API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
