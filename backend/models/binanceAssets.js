const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    asset: {
        type: String,
        required: true,           // Asset-Namen sind erforderlich
    },
    free: {
        type: Number,
        required: true,
        min: 0,                   // `free` darf nicht negativ sein
    },
    locked: {
        type: Number,
        required: true,
        min: 0,                   // `locked` darf nicht negativ sein
    },
});

const binanceAssetsSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    totalValueUSD: {
        type: Number,
        default: 0,               // Standardwert 0, falls die Berechnung ausfällt
    },
    balances: {
        type: [assetSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 100']  // Beispielhafte Validierung, um sicherzustellen, dass nicht zu viele Assets gespeichert werden
    }
});

function arrayLimit(val) {
  return val.length <= 100;  // Beispiel: maximal 100 Assets
}

module.exports = mongoose.model('BinanceAssets', binanceAssetsSchema);
