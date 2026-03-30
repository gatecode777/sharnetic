// backend/controllers/categoryController.js
const Category = require('../models/Category');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Helper function to delete image file
const deleteImageFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, '..', 'uploads', 'categories', filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted image: ${filename}`);
    } catch (err) {
      console.error(`Error deleting image ${filename}:`, err);
    }
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          isActive: true,
        });
        
        const obj = category.toObject();
        obj.productCount = productCount;
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount,
      total: categoriesWithCount.length,
    });
  } catch (error) {
    console.error('getAllCategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    const obj = category.toObject();
    obj.productCount = productCount;

    res.status(200).json({ success: true, category: obj });
  } catch (error) {
    console.error('getCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category', error: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    const obj = category.toObject();
    obj.productCount = productCount;

    res.status(200).json({ success: true, category: obj });
  } catch (error) {
    console.error('getCategoryBySlug error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category', error: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, order, isActive } = req.body;

    if (!name) {
      // Delete uploaded file if validation fails
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Check duplicate name
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const categoryData = {
      name: name.trim(),
      description: description || '',
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    };

    // Add image if uploaded
    if (req.file) {
      categoryData.image = req.file.filename;
    }

    const category = await Category.create(categoryData);

    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully', 
      category 
    });
  } catch (error) {
    console.error('createCategory error:', error);
    // Delete uploaded file if category creation fails
    if (req.file) deleteImageFile(req.file.filename);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, description, order, isActive } = req.body;

    // Check name conflict only if name is being changed
    if (name && name !== category.name) {
      const existing = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });
      if (existing) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = parseInt(order) || 0;
    if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (category.image) {
        deleteImageFile(category.image);
      }
      category.image = req.file.filename;
    }

    await category.save();

    res.status(200).json({ 
      success: true, 
      message: 'Category updated successfully', 
      category 
    });
  } catch (error) {
    console.error('updateCategory error:', error);
    // Delete uploaded file if update fails
    if (req.file) deleteImageFile(req.file.filename);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Block delete if products use this category
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${productCount} product(s) are using this category.`,
      });
    }

    // Delete category image if exists
    if (category.image) {
      deleteImageFile(category.image);
    }

    await category.deleteOne();

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('deleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};

// @desc    Toggle isActive
// @route   PUT /api/categories/:id/toggle-active
// @access  Private/Admin
exports.toggleActive = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      category,
    });
  } catch (error) {
    console.error('toggleActive error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

// @desc    Delete category image
// @route   DELETE /api/categories/:id/image
// @access  Private/Admin
exports.deleteCategoryImage = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (!category.image) {
      return res.status(404).json({ success: false, message: 'No image to delete' });
    }

    // Delete image file
    deleteImageFile(category.image);
    
    // Remove image reference from category
    category.image = '';
    await category.save();

    res.status(200).json({ 
      success: true, 
      message: 'Category image deleted successfully',
      category 
    });
  } catch (error) {
    console.error('deleteCategoryImage error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image', error: error.message });
  }
};