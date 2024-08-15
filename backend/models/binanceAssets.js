// models/binanceAssets.js

const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    asset: String,          // Name der Kryptowährung, z.B. BTC, ETH
    free: Number,           // Verfügbares Guthaben
    locked: Number,         // Gesperrtes Guthaben (z.B. in offenen Orders)
});

const binanceAssetsSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    totalValueUSD: Number,   // Diese Berechnung erfolgt serverseitig, wenn gewünscht
    balances: [assetSchema]  // Hier speichern wir die Balances aus der Binance API
});

module.exports = mongoose.model('BinanceAssets', binanceAssetsSchema);
