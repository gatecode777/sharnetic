// backend/routes/sellerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller,
} = require('../controllers/sellerController');
const { protect } = require('../middleware/adminAuth');

// Public routes
router.get('/', getAllSellers);
router.get('/:id', getSellerById);

// Admin routes
router.post('/', protect, createSeller);
router.put('/:id', protect, updateSeller);
router.delete('/:id', protect, deleteSeller);

module.exports = router;

