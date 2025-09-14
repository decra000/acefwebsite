const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail, sendUserInvitationEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Available permissions for Assistant Admin
const AVAILABLE_PERMISSIONS = [
  'manage_content',
  'manage_projects',
  'manage_team',
  'manage_partners',
  'manage_contacts',
  'manage_volunteers',
  'manage_newsletter',
  'view_donations',
  'manage_videos',
  'manage_impact',
  'manage_jobs'
];

// Get all users (admin only) - FIX: Consistent response format
exports.getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called by user:', req.user);
    
  

    const users = await User.getAll();
    console.log('Retrieved users:', users);
    
    // FIX: Return users array directly (not wrapped in users object)
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Could not fetch users', error: error.message });
  }
};

// Login - FIX: Better error handling
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.getWithPassword(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account not activated. Please check your email for activation instructions.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res
      .cookie('token', token, COOKIE_OPTIONS)
      .json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions || []
        }
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get profile - FIX: Better error handling
exports.getProfile = async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || []
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Could not fetch profile', error: error.message });
  }
};

// Invite user (admin only) - FIX: Better error handling and validation

// Replace your inviteUser method in authController.js with this:

exports.inviteUser = async (req, res) => {
  console.log('=== INVITE USER DEBUG START ===');
  console.log('1. Request body:', JSON.stringify(req.body, null, 2));
  console.log('2. Request user:', req.user);
  console.log('3. Headers:', req.headers);

  try {
    const { name, email, role = 'Content Manager', invitedBy, permissions = [] } = req.body;

    // Step-by-step validation with logging
    console.log('4. Extracted fields:', { name, email, role, invitedBy, permissions });

    // Auth check
    if (!req.user || req.user.role !== 'admin') {
      console.log('5. FAIL: Authorization check failed');
      return res.status(403).json({ message: 'Unauthorized' });
    }
    console.log('5. PASS: Authorization check');

    // Field validation
    if (!name || !email) {
      console.log('6. FAIL: Missing required fields');
      return res.status(400).json({ message: 'Name and email are required' });
    }
    console.log('6. PASS: Required fields present');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('7. FAIL: Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }
    console.log('7. PASS: Email format valid');

    // Check existing user
    console.log('8. Checking if user exists...');
    let existing;
    try {
      existing = await User.getByEmail(email);
      console.log('8. PASS: User existence check completed, existing:', existing ? 'YES' : 'NO');
    } catch (dbError) {
      console.log('8. FAIL: Database error during user lookup:', dbError.message);
      return res.status(500).json({ message: 'Database error during user lookup', error: dbError.message });
    }

    if (existing) {
      console.log('9. FAIL: User already exists');
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    console.log('9. PASS: User does not exist');

    // Generate tokens
    console.log('10. Generating activation token...');
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    console.log('10. PASS: Token generated, expires:', activationTokenExpires.toISOString());

    // Create user data
    const userData = {
      name,
      email,
      role,
      activationToken,
      activationTokenExpires,
      permissions: role === 'Assistant Admin' ? permissions : []
    };
    console.log('11. User data prepared:', userData);

    // Database insert
    console.log('12. Attempting database insert...');
    let newUser;
    try {
      newUser = await User.createPendingUser(userData);
      console.log('12. PASS: Database insert successful:', newUser);
    } catch (dbError) {
      console.log('12. FAIL: Database insert error:', {
        message: dbError.message,
        code: dbError.code,
        errno: dbError.errno,
        sqlState: dbError.sqlState,
        sqlMessage: dbError.sqlMessage
      });
      return res.status(500).json({ 
        message: 'Database error during user creation', 
        error: dbError.message,
        code: dbError.code
      });
    }

    // Email attempt (non-blocking)
    console.log('13. Attempting to send email...');
    let emailSent = false;
    try {
      await sendUserInvitationEmail({
        recipientEmail: email,
        recipientName: name,
        role,
        invitedBy: invitedBy || req.user.name,
        activationToken,
        permissions: role === 'Assistant Admin' ? permissions : []
      });
      emailSent = true;
      console.log('13. PASS: Email sent successfully');
    } catch (emailError) {
      console.log('13. WARN: Email failed (non-blocking):', emailError.message);
    }

    console.log('14. SUCCESS: Sending response');
    res.status(201).json({
      message: emailSent 
        ? 'User invitation sent successfully! They will receive an email to activate their account.' 
        : 'User created successfully, but invitation email failed to send',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: false,
        permissions: newUser.permissions || []
      },
      emailSent
    });

    console.log('=== INVITE USER DEBUG END - SUCCESS ===');

  } catch (error) {
    console.log('=== INVITE USER DEBUG END - ERROR ===');
    console.error('UNHANDLED ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};



// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['admin', 'Content Manager', 'Assistant Admin'];
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    await User.updateRole(id, role);
    
    // If changing from Assistant Admin, clear permissions
    if (role !== 'Assistant Admin') {
      await User.updatePermissions(id, []);
    }
    
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

// Update user permissions (admin only)
exports.updateUserPermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    // Validate permissions array
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    // Validate that all permissions are in the allowed list
    const invalidPermissions = permissions.filter(p => !AVAILABLE_PERMISSIONS.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({ 
        message: `Invalid permissions: ${invalidPermissions.join(', ')}` 
      });
    }

    await User.updatePermissions(id, permissions);
    res.status(200).json({ message: 'User permissions updated successfully' });
  } catch (err) {
    console.error('Error updating permissions:', err);
    res.status(500).json({ message: 'Failed to update permissions' });
  }
};

// Update user (admin-only)
exports.updateUser = async (req, res) => {
  try {
    console.log('updateUser called with:', { userId: req.params.id, body: req.body, user: req.user });
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    // Check if email already exists for another user
    const existingUser = await User.getByEmail(email);
    if (existingUser && existingUser.id !== parseInt(id)) {
      return res.status(400).json({ message: 'Email already exists for another user' });
    }
    
    console.log('Updating user with:', { id, name, email });
    await User.updateUser(id, { name, email });
    
    // Return the updated user data
    const updatedUser = await User.getById(id);
    console.log('User updated successfully:', updatedUser);
    
    res.json({ 
      message: 'User updated successfully',
      user: updatedUser 
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.deleteById(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Register
exports.register = async (req, res) => {
  const { name, email, password, role = 'Content Manager' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const existing = await User.getByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully' });
};

// Resend invitation (admin only)
exports.resendInvitation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isActive) {
      return res.status(400).json({ message: 'User is already active' });
    }

    // Generate new activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await User.updateActivationToken(userId, activationToken, activationTokenExpires);

    // Send invitation email
    try {
      if (sendUserInvitationEmail) {
        await sendUserInvitationEmail({
          recipientEmail: user.email,
          recipientName: user.name,
          role: user.role,
          invitedBy: req.user.name,
          activationToken,
          permissions: user.permissions || []
        });
      }
    } catch (emailError) {
      console.error('Failed to resend invitation email:', emailError);
      return res.status(500).json({ message: 'Failed to resend invitation email' });
    }

    res.status(200).json({ message: 'Invitation resent successfully' });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ message: 'Failed to resend invitation', error: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.getByEmail(email);
    if (!user) return res.status(404).json({ message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await User.updateResetToken(user.id, token, expires);

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    if (sendPasswordResetEmail) {
      await sendPasswordResetEmail(user.email, user.name || user.email, resetLink);
    }

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Could not send reset email', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.getByResetToken(token);
    if (!user || new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(user.id, hashedPassword);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Reset failed', error: error.message });
  }
};





// Validate activation token (public)
exports.validateActivationToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.getByActivationToken(token);
    if (!user || new Date(user.activationTokenExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired activation token' });
    }

    res.status(200).json({ 
      message: 'Token is valid',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Token validation failed' });
  }
};

// Activate user account (from email link)
exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.getByActivationToken(token);
    if (!user || new Date(user.activationTokenExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired activation token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.activateUser(user.id, hashedPassword);

    res.status(200).json({ message: 'Account activated successfully' });
  } catch (error) {
    console.error('Account activation error:', error);
    res.status(500).json({ message: 'Account activation failed' });
  }
};

exports.testInvite = (req, res) => {
  console.log('🧪 TEST INVITE ENDPOINT REACHED');
  console.log('📦 Body:', req.body);
  console.log('👤 User:', req.user);
  
  res.json({
    message: 'Test endpoint working',
    method: req.method,
    body: req.body,
    user: req.user ? { id: req.user.id, role: req.user.role } : null,
    timestamp: new Date().toISOString()
  });
};