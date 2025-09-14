const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', categoryController.getAll);
router.post('/', auth, adminAuth, categoryController.create);
router.put('/:id', auth, adminAuth, categoryController.update);
router.delete('/:id', auth, adminAuth, categoryController.remove);

module.exports = router;
