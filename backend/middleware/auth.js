const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Middleware: Protect routes (requires valid JWT in cookie)
const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.getById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// 👑 Middleware: Admin-only access
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only' });
  }

  next();
};

// ✍️ Middleware: Editor or Admin access
const editorAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (!['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access restricted to editors or admins' });
  }

  next();
};

module.exports = {
  auth,
  adminAuth,
  editorAuth
};
