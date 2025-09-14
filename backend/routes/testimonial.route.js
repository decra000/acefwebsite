const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonial.controller');
const multer = require('multer');
const path = require('path');

// File upload setup
const uploadDir = path.join(__dirname, '../uploads/testimonials');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage });

// Routes
router.get('/:projectId', testimonialController.getTestimonialsByProject);
router.post('/:projectId', upload.single('image'), testimonialController.createTestimonial);
router.put('/:id', upload.single('image'), testimonialController.updateTestimonial);
router.delete('/:id', testimonialController.deleteTestimonial);

module.exports = router;
