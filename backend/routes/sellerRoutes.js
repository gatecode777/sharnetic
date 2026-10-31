// backend/routes/sellerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller,
  exportSellers,
  bulkImportSellers,
} = require('../controllers/sellerController');
const { protect } = require('../middleware/adminAuth');

// Export & Bulk Import (must be before /:id)
router.get('/export', protect, exportSellers);
router.post('/bulk-import', protect, bulkImportSellers);

// Public routes
router.get('/', getAllSellers);
router.get('/:id', getSellerById);

// Admin routes
router.post('/', protect, createSeller);
router.put('/:id', protect, updateSeller);
router.delete('/:id', protect, deleteSeller);

module.exports = router;
