const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', countryController.getCountries);
router.post('/', auth, adminAuth, countryController.addCountry);
router.delete('/:id', auth, adminAuth, countryController.deleteCountry);

module.exports = router;
