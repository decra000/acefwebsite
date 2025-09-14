const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
app.use('/api/auth', (req, res, next) => {
  console.log(`🔍 AUTH MIDDLEWARE: ${req.method} ${req.path}`);
  console.log('📋 Request details:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    body: req.method === 'POST' ? req.body : 'N/A',
    headers: {
      'content-type': req.headers['content-type'],
      'cookie': req.headers.cookie ? 'Present' : 'Missing'
    }
  });
  next();
});
// Enhanced logging middleware (move this early)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Enhanced CORS configuration (MUST come before routes)
app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 CORS check for origin:', origin); // Add logging
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log('✅ Allowed origins:', allowedOrigins); // Add logging
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for development - tighten in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parsing middleware (MUST come after CORS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Test database connection on startup
(async () => {
  try {
    const { executeQuery } = require('./config/database');
    await executeQuery('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database configuration');
  }
})();



// Ensure Upload Directories Exist
const uploadDirs = ['uploads/partners', 'uploads/projectimages', 'uploads/team', 'uploads/blogs', 'uploads/logos',  'uploads/transaction-logos'   // NEW: Transaction method logos
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});
const jobRoutes = require('./routes/jobRoutes');
const jobApplicationRoutes = require('./routes/jobApplicationRoutes');

// Use routes
app.use('/api/jobs', jobRoutes);
app.use('/api/job-applications', jobApplicationRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/test', (req, res) => {
  res.json({
    message: 'ACEF API is running successfully!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const donationRoutes = require('./routes/donationRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// SPECIFIC API Routes (order matters - most specific first)
// Newsletter routes - NOW AFTER CORS configuration
app.use('/api/newsletter', (req, res, next) => {
  console.log('📧 Newsletter route accessed:', req.method, req.originalUrl);
  next();
}, newsletterRoutes);

app.use('/api/transaction-details',  require('./routes/transactionDetails'));


app.use('/api/pillars', require('./routes/pillarRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/countries', require('./routes/countryRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/visits', require('./routes/visitRoutes'));
// In your main server file (app.js or server.js)
// app.use('/api/visits', require('./routes/visits')); // or wherever your routes are
app.use('/api/projects', require('./routes/projectRoute'));
app.use('/api/testimonials', require('./routes/testimonial.route'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/team', require('./routes/team'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/country-contacts', require('./routes/countryContactRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));
app.use('/api/impacts', require('./routes/impactRoutes'));
app.use('/api/video-sections', require('./routes/videoSectionRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));  // ✅ Events CRUD with image upload
app.use('/api/event-interests', require('./routes/eventInterestRoutes'));
app.use('/api/highlights', require('./routes/highlights'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/collaboration', require('./routes/collaboration'));


// DONATION ROUTES - with enhanced logging
app.use('/api/donations', (req, res, next) => {
  console.log(`🎯 Donation route accessed: ${req.method} ${req.originalUrl}`);
  next();
}, donationRoutes);

// Logo Management Routes
app.use('/api/logos', require('./routes/logoRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Page Content Routes  
app.use('/api/page-content', require('./routes/pageContentRoutes'));

// Volunteer forms routes
const volunteerFormsRoutes = require('./routes/volunteerFormsRoutes');
app.use('/api/volunteer-forms', volunteerFormsRoutes);

// Chat routes
app.use('/api/chat', require('./routes/chat'));

// Enhanced 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  console.log('Available newsletter routes:');
  console.log('  POST /api/newsletter/subscribe');
  console.log('Available donation routes:');
  console.log('  GET  /api/donations/test');
  console.log('  POST /api/donations/');
  console.log('  GET  /api/donations/health');
  console.log('  GET  /api/donations/admin/all');
  console.log('  GET  /api/donations/admin/pending');
  
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Enhanced Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:');
  console.error('Path:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});
// Add this temporarily to server.js
app.get('/api/debug/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadBase = path.join(__dirname, 'uploads');
  const transactionLogos = path.join(uploadBase, 'transaction-logos');
  
  const result = {
    uploadBase: uploadBase,
    transactionLogos: transactionLogos,
    uploadBaseExists: fs.existsSync(uploadBase),
    transactionLogosExists: fs.existsSync(transactionLogos),
    contents: {}
  };
  
  if (result.transactionLogosExists) {
    result.contents.transactionLogos = fs.readdirSync(transactionLogos);
  }
  
  if (fs.existsSync(path.join(uploadBase, 'logos'))) {
    result.contents.logos = fs.readdirSync(path.join(uploadBase, 'logos'));
  }
  
  res.json(result);
});
// Add this line with your other route imports in server.js
const transactionDetailsRoutes = require('./routes/transactionDetails');

app.use('/api/transaction-details', transactionDetailsRoutes);

// Add this to your console.log section in the server startup
// Start Server

// Add this temporarily after your other routes
app.get('/api/highlights/debug', (req, res) => {
  res.json({
    message: 'Highlights route is working!',
    timestamp: new Date().toISOString()
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 ACEF Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
  console.log(`📧 Newsletter API: http://localhost:${PORT}/api/newsletter`);
  console.log(`💰 Donations API: http://localhost:${PORT}/api/donations`);
  console.log(`🧪 Test donations at: http://localhost:${PORT}/api/donations/test`);
  console.log(`🏥 Health check at: http://localhost:${PORT}/api/donations/health`);
  console.log(`💰 Transactions API: http://localhost:${PORT}/api//transaction-details`);
  console.log(`📹 Video Sections API: http://localhost:${PORT}/api/video-sections`);
console.log(`🏛️ Pillars API: http://localhost:${PORT}/api/pillars`);
  console.log('🚀 Registering transaction details routes...');
console.log('✅ Transaction details routes registered');

});

module.exports = app;