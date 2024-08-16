const https = require('https');
const crypto = require('crypto');
require('dotenv').config();

// Funktion zum Erstellen einer Signatur
function createSignature(query) {
  return crypto.createHmac('sha256', process.env.BINANCE_SECRET_KEY)
               .update(query)
               .digest('hex');
}

// Funktion zur Überprüfung der Serverzeit
async function ensureTimeSync() {
  try {
    const serverTime = await getServerTime();
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

// Funktion zum Abrufen der Binance-Serverzeit
function getServerTime() {
  return new Promise((resolve, reject) => {
    https.get('https://api.binance.com/api/v3/time', (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        const json = JSON.parse(data);
        resolve(json.serverTime);
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
}

// Funktion zur Durchführung von GET-Anfragen an die Binance-API
function binanceGetRequest(path, query) {
  return new Promise((resolve, reject) => {
    const signature = createSignature(query);
    const options = {
      hostname: 'api.binance.com',
      path: `${path}?${query}&signature=${signature}`,
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': process.env.BINANCE_API_KEY
      }
    };

    https.request(options, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(JSON.parse(data));
      });

    }).on("error", (err) => {
      reject(err);
    }).end();
  });
}

// Funktion zur Abrufung von Konto-Informationen
exports.getAccountInfo = async (req, res) => {
  try {
    const timestamp = await ensureTimeSync();
    const { omitZeroBalances } = req.query;
    const recvWindow = 5000;
    const query = `recvWindow=${recvWindow}&timestamp=${timestamp}` + (omitZeroBalances ? `&omitZeroBalances=${omitZeroBalances}` : '');

    const accountInfo = await binanceGetRequest('/api/v3/account', query);
    res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching Binance account info:', error);
    res.status(500).json({ message: 'Error fetching Binance account info' });
  }
};

// Funktion zur Abrufung des Gesamtguthabens
exports.getTotalBalance = async (req, res) => {
  try {
    const timestamp = await ensureTimeSync();
    const recvWindow = 5000;
    const query = `recvWindow=${recvWindow}&timestamp=${timestamp}`;

    const accountInfo = await binanceGetRequest('/api/v3/account', query);

    const totalBalance = accountInfo.balances.reduce((acc, balance) => {
      return acc + parseFloat(balance.free) + parseFloat(balance.locked);
    }, 0);
    res.json({ totalBalance });
  } catch (error) {
    console.error('Error fetching total balance:', error);
    res.status(500).json({ message: 'Error fetching total balance' });
  }
};

// Funktion zur Abrufung von Trades für ein bestimmtes Konto und Symbol
exports.getAccountTrades = async (req, res) => {
  try {
    const { symbol, orderId, startTime, endTime, fromId, limit } = req.query;
    const timestamp = await ensureTimeSync();
    const recvWindow = 5000;
    const query = `symbol=${symbol}&recvWindow=${recvWindow}&timestamp=${timestamp}`
                + (orderId ? `&orderId=${orderId}` : '')
                + (startTime ? `&startTime=${startTime}` : '')
                + (endTime ? `&endTime=${endTime}` : '')
                + (fromId ? `&fromId=${fromId}` : '')
                + (limit ? `&limit=${limit}` : '');

    const trades = await binanceGetRequest('/api/v3/myTrades', query);
    res.json(trades);
  } catch (error) {
    console.error('Error fetching account trades:', error);
    res.status(500).json({ message: 'Error fetching account trades' });
  }
};

// Controller zum Pingen der Binance API
exports.pingBinanceAPI = async (req, res) => {
  try {
    const pingResult = await new Promise((resolve, reject) => {
      https.get('https://api.binance.com/api/v3/ping', (resp) => {
        if (resp.statusCode === 200) {
          resolve({ success: true });
        } else {
          reject(new Error('Ping failed'));
        }
      }).on("error", (err) => {
        reject(err);
      });
    });

    res.json(pingResult);
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

    const response = await binanceGetRequest('/api/v3/account', query);
    res.json(response);
  } catch (error) {
    console.error('Error making signed request:', error);
    res.status(500).json({ message: 'Error making signed request' });
  }
};
