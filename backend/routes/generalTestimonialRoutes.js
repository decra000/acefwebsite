const express = require('express');
const router = express.Router();
const multer = require('multer');
const testimonialController = require('../controllers/testimonialController');
const { auth, adminAuth } = require('../middleware/auth');

// Upload config for testimonial images
const storage = multer.diskStorage({
  destination: 'uploads/testimonials',
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `testimonial_${Date.now()}.${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

// PUBLIC ROUTES (no auth required)
router.get('/public', testimonialController.getPublicTestimonials);
router.get('/public/featured', testimonialController.getFeaturedTestimonials);

// ADMIN ROUTES (auth required)
router.use(auth); // Apply auth middleware to all routes below

router.get('/', testimonialController.getAllTestimonials);
router.get('/:id', testimonialController.getTestimonialById);
router.post('/', upload.single('image'), testimonialController.createTestimonial);
router.put('/:id', upload.single('image'), testimonialController.updateTestimonial);
router.put('/:id/type', testimonialController.updateTestimonialType);
router.put('/:id/featured', testimonialController.updateTestimonialFeatured);
router.delete('/:id', testimonialController.deleteTestimonial);

module.exports = router;