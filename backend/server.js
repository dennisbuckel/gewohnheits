const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Lädt die Umgebungsvariablen

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

// Verbinde mit MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Beendet den Server bei einem Fehler
});

// Routen
const habitRoutes = require('./routes/habits');
const fahrtenbuchRoutes = require('./routes/fahrtenbuch');

app.use('/api/habits', habitRoutes);
app.use('/api/fahrtenbuch', fahrtenbuchRoutes);

// Setzt Caching-Header für statische Dateien
app.use(express.static(path.join(__dirname, 'frontend'), {
    maxAge: '30d',
    etag: false 
}));

// Beispiel für eine spezifische Route, bei der das Caching konfiguriert wird
app.get('/tracker.html', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'frontend', 'tracker.html'));
});

// Fehlerbehandlungsmiddleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
