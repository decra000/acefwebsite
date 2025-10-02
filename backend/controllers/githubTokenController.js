// controllers/githubTokenController.js
const GithubToken = require('../models/GithubToken');

// Validation helper
const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return 'Token is required';
  }

  const cleaned = token.trim();
  
  if (cleaned.length < 10) {
    return 'Token is too short';
  }
  
  if (cleaned.length > 500) {
    return 'Token is too long';
  }
  
  return null;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, 255);
};

exports.getAll = async (req, res) => {
  try {
    console.log('🔵 GithubToken Controller - getAll() called');
    const tokens = await GithubToken.getAll();
    
    // Mask tokens in response (show only last 4 characters)
    const maskedTokens = tokens.map(t => ({
      ...t,
      token: `****${t.token.slice(-4)}`
    }));
    
    console.log('✅ GithubToken Controller - getAll() successful, count:', tokens?.length || 0);
    res.json(maskedTokens);
  } catch (err) {
    console.error('❌ GithubToken Controller - getAll() error:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Failed to fetch tokens', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid token ID' });
    }

    const token = await GithubToken.getById(parseInt(id));
    
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    // Mask token in response
    res.json({
      ...token,
      token: `****${token.token.slice(-4)}`
    });
  } catch (err) {
    console.error('Error fetching GitHub token:', err);
    res.status(500).json({ 
      message: 'Failed to fetch token', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.getActive = async (req, res) => {
  try {
    console.log('🔵 GithubToken Controller - getActive() called');
    const token = await GithubToken.getActiveToken();
    
    if (!token) {
      return res.status(404).json({ message: 'No active token found' });
    }
    
    // Return full token (for internal API use)
    res.json(token);
  } catch (err) {
    console.error('❌ GithubToken Controller - getActive() error:', err);
    res.status(500).json({ 
      message: 'Failed to fetch active token', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('🔵 GithubToken Controller - create() called');
    const { token, description, is_active } = req.body;
    
    if (!token) {
      console.log('❌ GithubToken Controller - create() validation failed: missing token');
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const tokenValidationError = validateToken(token);
    if (tokenValidationError) {
      console.log('❌ GithubToken Controller - create() validation failed:', tokenValidationError);
      return res.status(400).json({ message: tokenValidationError });
    }
    
    const sanitizedData = {
      token: sanitizeInput(token),
      description: description ? sanitizeInput(description) : '',
      is_active: is_active === true || is_active === 1
    };
    
    console.log('🔵 GithubToken Controller - create() sanitized data');
    
    const newToken = await GithubToken.create(sanitizedData);
    console.log('✅ GithubToken Controller - create() successful:', newToken.id);
    
    // Mask token in response
    res.status(201).json({
      ...newToken,
      token: `****${newToken.token.slice(-4)}`
    });
    
  } catch (err) {
    console.error('❌ GithubToken Controller - create() error:', {
      message: err.message,
      stack: err.stack
    });
    
    if (err.message.includes('already exists')) {
      return res.status(409).json({ message: err.message });
    }
    
    res.status(500).json({ 
      message: 'Failed to create token', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { token, description, is_active } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid token ID' });
    }
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const tokenValidationError = validateToken(token);
    if (tokenValidationError) {
      return res.status(400).json({ message: tokenValidationError });
    }
    
    const existingToken = await GithubToken.getById(parseInt(id));
    if (!existingToken) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    const sanitizedData = {
      token: sanitizeInput(token),
      description: description ? sanitizeInput(description) : '',
      is_active: is_active === true || is_active === 1
    };
    
    const updated = await GithubToken.update(parseInt(id), sanitizedData);
    
    // Mask token in response
    res.json({
      ...updated,
      token: `****${updated.token.slice(-4)}`
    });
    
  } catch (err) {
    console.error('Error updating GitHub token:', err);
    
    if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
      return res.status(409).json({ message: 'Token already exists' });
    }
    
    res.status(500).json({ 
      message: 'Failed to update token', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid token ID' });
    }
    
    const existingToken = await GithubToken.getById(parseInt(id));
    if (!existingToken) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    await GithubToken.delete(parseInt(id));
    res.json({ message: 'Token deleted successfully' });
    
  } catch (err) {
    console.error('Error deleting GitHub token:', err);
    res.status(500).json({ 
      message: 'Failed to delete token', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.setActive = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid token ID' });
    }
    
    const updated = await GithubToken.setActive(parseInt(id));
    
    // Mask token in response
    res.json({
      ...updated,
      token: `****${updated.token.slice(-4)}`,
      message: 'Token activated successfully'
    });
    
  } catch (err) {
    console.error('Error activating GitHub token:', err);
    res.status(500).json({ 
      message: 'Failed to activate token', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};