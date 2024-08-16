const Binance = require('binance-api-node').default;
const crypto = require('crypto');
require('dotenv').config();

// Binance API-Client initialisieren
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY,
});

// Funktion zur Überprüfung der Serverzeit
async function ensureTimeSync() {
  try {
    const serverTime = await client.time();
    const localTime = Date.now();

    // Toleranz für Zeitabweichung in Millisekunden, z.B. 1000 ms = 1 Sekunde
    const tolerance = 1000;

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
    const accountInfo = await client.account({ timestamp });
    res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching Binance account info:', error);
    res.status(500).json({ message: 'Error fetching Binance account info' });
  }
};

exports.getTotalBalance = async (req, res) => {
  try {
    const timestamp = await ensureTimeSync();
    const accountInfo = await client.account({ timestamp });

    // Guthaben in USDT umrechnen
    let totalBalance = 0;
    for (let balance of accountInfo.balances) {
      if (balance.asset !== 'USDT') {
        const price = await client.prices({ symbol: `${balance.asset}USDT` });
        totalBalance += parseFloat(balance.free) * parseFloat(price[`${balance.asset}USDT`]);
      } else {
        totalBalance += parseFloat(balance.free);
      }
    }

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

    const response = await client.account({ recvWindow, timestamp, signature });
    res.json(response);
  } catch (error) {
    console.error('Error making signed request:', error);
    res.status(500).json({ message: 'Error making signed request' });
  }
};
