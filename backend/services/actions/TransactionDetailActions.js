const TransactionDetail = require('../models/TransactionDetail');

// Create TransactionDetail
async function createTransactionDetail(data) {
  try {
    const newItem = new TransactionDetail(data);
    return await newItem.save();
  } catch (err) {
    throw err;
  }
}

// Get all TransactionDetail
async function getAllTransactionDetail() {
  try {
    return await TransactionDetail.find();
  } catch (err) {
    throw err;
  }
}

// Get TransactionDetail by ID
async function getTransactionDetailById(id) {
  try {
    return await TransactionDetail.findById(id);
  } catch (err) {
    throw err;
  }
}

// Update TransactionDetail
async function updateTransactionDetail(id, data) {
  try {
    return await TransactionDetail.findByIdAndUpdate(id, data, { new: true });
  } catch (err) {
    throw err;
  }
}

// Delete TransactionDetail
async function deleteTransactionDetail(id) {
  try {
    return await TransactionDetail.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createTransactionDetail,
  getAllTransactionDetail,
  getTransactionDetailById,
  updateTransactionDetail,
  deleteTransactionDetail
};
