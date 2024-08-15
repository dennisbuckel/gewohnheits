const express = require('express');
const router = express.Router();
const fahrtController = require('../controllers/fahrtController');

router.get('/', fahrtController.getFahrten);
router.post('/', fahrtController.createFahrt);
router.delete('/:id', fahrtController.deleteFahrt);

module.exports = router;
