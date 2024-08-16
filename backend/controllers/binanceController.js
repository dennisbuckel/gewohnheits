const Binance = require('binance-api-node').default;
const crypto = require('crypto');
require('dotenv').config();

// Binance API-Client initialisieren
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY,
});

// Funktion zum Erstellen einer Signatur
function createSignature(query) {
  return crypto.createHmac('sha256', process.env.BINANCE_SECRET_KEY)
               .update(query)
               .digest('hex');
}

// Funktion zur Überprüfung der Serverzeit
async function ensureTimeSync() {
  try {
    const serverTime = await client.time();
    const localTime = Date.now();

    const tolerance = 1000; // Toleranz für Zeitabweichung in Millisekunden

    if (Math.abs(serverTime - localTime) > tolerance) {
      console.warn(`Zeitabweichung festgestellt. Binance Serverzeit: ${serverTime}, Lokale Zeit: ${localTime}`);
      return serverTime;
    }

    return localTime;
  } catch (error) {
    console.error('Fehler bei der Synchronisierung mit der Binance-Serverzeit:', error);
    throw new Error('Zeitsynchronisation fehlgeschlagen');
  }
}

exports.getAccountInfo = async (req, res) => {
  try {
    const timestamp = await ensureTimeSync();
    const recvWindow = 5000;
    const query = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
    const signature = createSignature(query);

    const accountInfo = await client.futuresAccountV3({
      timestamp,
      recvWindow,
      signature,
    });

    res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching Binance account info:', error);
    res.status(500).json({ message: 'Error fetching Binance account info' });
  }
};

exports.getTotalBalance = async (req, res) => {
  try {
    const timestamp = await ensureTimeSync();
    const recvWindow = 5000;
    const query = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
    const signature = createSignature(query);

    const accountInfo = await client.futuresAccountV3({
      timestamp,
      recvWindow,
      signature,
    });

    const totalBalance = parseFloat(accountInfo.totalWalletBalance);
    res.json({ totalBalance });
  } catch (error) {
    console.error('Error fetching total balance:', error);
    res.status(500).json({ message: 'Error fetching total balance' });
  }
};

// Controller zum Pingen der Binance API
exports.pingBinanceAPI = async (req, res) => {
  try {
    await ensureTimeSync();
    const pingResult = await client.ping();
    res.json({ success: true, pingResult });
  } catch (error) {
    console.error('Error pinging Binance API:', error);
    res.status(500).json({ success: false, error: 'Error pinging Binance API' });
  }
};

// Zusätzliche Funktion zur Erstellung einer signierten Anfrage (falls notwendig)
exports.makeSignedRequest = async (req, res) => {
  try {
    const timestamp = await ensureTimeSync();
    const recvWindow = 5000;
    const query = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
    const signature = createSignature(query);

    // Beispiel einer signierten Anfrage (hier könntest du spezifische Endpunkte anpassen)
    const response = await client.futuresAccountV3({
      timestamp,
      recvWindow,
      signature,
    });

    res.json(response);
  } catch (error) {
    console.error('Error making signed request:', error);
    res.status(500).json({ message: 'Error making signed request' });
  }
};
