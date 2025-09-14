const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

router.get('/', whatsappController.getAll);
router.get('/:id', whatsappController.getOne);
router.post('/', whatsappController.create);
router.put('/:id', whatsappController.update);
router.delete('/:id', whatsappController.delete);

module.exports = router;
