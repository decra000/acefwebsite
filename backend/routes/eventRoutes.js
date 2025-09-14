const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { uploadSingle, cleanupOnError, getFileUrl } = require('../middleware/upload');

// Get all events
router.get('/', eventController.getEvents);

// Get one event
router.get('/:id', eventController.getEvent);

// Create new event (with optional image)
router.post(
  '/',
  uploadSingle('image'), // ✅ Accept one file
  cleanupOnError,        // ✅ Cleanup if error
  (req, res, next) => {
    if (req.file) {
      req.body.image_url = getFileUrl(req, req.file.filename, 'events'); 
    }
    next();
  },
  eventController.createEvent
);

// Update event (with optional new image)
router.put(
  '/:id',
  uploadSingle('image'),
  cleanupOnError,
  (req, res, next) => {
    if (req.file) {
      req.body.image_url = getFileUrl(req, req.file.filename, 'events');
    }
    next();
  },
  eventController.updateEvent
);

// Delete event
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
