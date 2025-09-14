const express = require('express');
const router = express.Router();
const multer = require('multer');
const partnerController = require('../controllers/partnerController');
const { auth, adminAuth } = require('../middleware/auth');

// Upload config with better file filtering
const storage = multer.diskStorage({
  destination: 'uploads/partners',
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `partner_${Date.now()}.${ext}`);
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

// ✅ PUBLIC ROUTE for homepage use (no auth)
router.get('/public', partnerController.getAllPartners);

// ✅ ADMIN ROUTES
router.get('/', partnerController.getAllPartners);
router.get('/:id', partnerController.getPartnerById); // NEW
router.post('/', upload.single('logo'), partnerController.createPartner);
router.put('/:id', upload.single('logo'), partnerController.updatePartner); // NEW
router.put('/:id/type', partnerController.updatePartnerType);
router.put('/:id/featured', partnerController.updatePartnerFeatured); // NEW
router.delete('/:id', partnerController.deletePartner);

module.exports = router;