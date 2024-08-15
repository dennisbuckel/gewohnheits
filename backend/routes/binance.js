const express = require('express');
const router = express.Router();
const binanceController = require('../controllers/binanceController');

// Route zum Abrufen von Account-Informationen
router.get('/account-info', binanceController.getAccountInfo);

// Route zum Abrufen des gesamten Kontostands
router.get('/total-balance', binanceController.getTotalBalance);

module.exports = router;
