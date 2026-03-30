// backend/routes/category.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect, authorize } = require('../middleware/adminAuth');

const {
  getAllCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleActive,
  deleteCategoryImage,
} = require('../controllers/categoryController');

// ── Multer setup for category images ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, "../public/uploads/categories");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `category-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ── Public routes ──────────────────────────────────────────────────────────────
router.get('/', getAllCategories);
router.get('/slug/:slug', getCategoryBySlug);    // must come before /:id
router.get('/:id', getCategory);

// ── Admin routes (protected) ───────────────────────────────────────────────────
router.post('/', protect, authorize('admin', 'super_admin'), upload.single('image'), createCategory);
router.put('/:id', protect, authorize('admin', 'super_admin'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteCategory);
router.put('/:id/toggle-active', protect, authorize('admin', 'super_admin'), toggleActive);
router.delete('/:id/image', protect, authorize('admin', 'super_admin'), deleteCategoryImage);

module.exports = router;