// Importiere die Binance-Bibliothek
const Binance = require('binance-api-node').default;

// Initialisiere den Client mit deinen API-Schlüsseln
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,    // API-Schlüssel aus Umgebungsvariablen
  apiSecret: process.env.BINANCE_API_SECRET,  // API-Secret aus Umgebungsvariablen
});

// Teste die API-Verbindung
client.ping()
  .then(() => console.log('API-Verbindung erfolgreich'))
  .catch(error => console.error('Fehler bei der API-Verbindung:', error));
