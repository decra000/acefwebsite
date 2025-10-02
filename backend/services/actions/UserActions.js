const User = require('../models/User');

// Create User
async function createUser(data) {
  try {
    const newItem = new User(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all User
async function getAllUser() {
  try {
    return await User.find();
  } catch (err) {
    throw err;
  }
}

// Get User by ID
async function getUserById(id) {
  try {
    return await User.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update User
async function updateUser(id, data) {
  try {
    return await User.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete User
async function deleteUser(id) {
  try {
    return await User.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser
};
