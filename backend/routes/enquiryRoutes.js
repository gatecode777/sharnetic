// backend/routes/enquiryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
  getStats,
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/adminAuth');

// Public route to submit an enquiry
router.post('/', createEnquiry);

// Admin routes
router.get('/stats', protect, getStats);
router.get('/', protect, getAllEnquiries);
router.get('/:id', protect, getEnquiryById);
router.put('/:id/status', protect, updateEnquiryStatus);
router.delete('/:id', protect, deleteEnquiry);

module.exports = router;

