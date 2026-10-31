// backend/controllers/sellerController.js
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const slugify = require('slugify');

// @desc    Get all sellers (with optional filters)
// @route   GET /api/sellers
// @access  Public
exports.getAllSellers = async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    if (category) {
      query.$or = [{ mainCategory: category }, { categories: category }];
    }

    if (city) {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { contactPerson: { $regex: s, $options: 'i' } },
        { city: { $regex: s, $options: 'i' } },
        { businessType: { $regex: s, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalSellers = await Seller.countDocuments(query);
    const totalPages = Math.ceil(totalSellers / parseInt(limit));

    const sellers = await Seller.find(query)
      .populate('mainCategory', 'name slug')
      .populate('categories', 'name slug')
      .sort({ isVerified: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Attach product count for each seller
    const sellersWithCounts = await Promise.all(
      sellers.map(async (seller) => {
        const count = await Product.countDocuments({ seller: seller._id, isActive: true });
        const obj = seller.toObject();
        obj.productCount = count;
        return obj;
      })
    );

    res.json({
      success: true,
      sellers: sellersWithCounts,
      totalSellers,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('getAllSellers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single seller by ID or Slug + their catalog
// @route   GET /api/sellers/:id
// @access  Public
exports.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const query = isObjectId ? { _id: id } : { slug: id };
    const seller = await Seller.findOne(query)
      .populate('mainCategory', 'name slug')
      .populate('categories', 'name slug');

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Fetch seller's products
    const products = await Product.find({ seller: seller._id, isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      seller,
      products,
      productCount: products.length,
    });
  } catch (error) {
    console.error('getSellerById error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new seller
// @route   POST /api/sellers
// @access  Admin
exports.createSeller = async (req, res) => {
  try {
    const {
      name,
      mainCategory,
      categories,
      contactPerson,
      email,
      phone,
      city,
      state,
      address,
      businessType,
      yearEstablished,
      gstin,
      rating,
      description,
      isVerified,
      trustSeal,
    } = req.body;

    if (!name || !mainCategory) {
      return res.status(400).json({ success: false, message: 'Name and Main Category are required' });
    }

    let slug = slugify(name, { lower: true, strict: true });
    const existing = await Seller.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const seller = new Seller({
      name: name.trim(),
      slug,
      mainCategory,
      categories: categories || [mainCategory],
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      city: city || 'Jaipur',
      state: state || 'Rajasthan',
      address: address || '',
      businessType: businessType || 'Manufacturer & Wholesaler',
      yearEstablished: yearEstablished || new Date().getFullYear(),
      gstin: gstin || '',
      rating: rating ? parseFloat(rating) : 4.6,
      description: description || '',
      isVerified: isVerified !== undefined ? isVerified : true,
      trustSeal: trustSeal !== undefined ? trustSeal : true,
    });

    await seller.save();
    await seller.populate('mainCategory', 'name slug');

    res.status(201).json({ success: true, seller, message: 'Seller created successfully' });
  } catch (error) {
    console.error('createSeller error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update seller
// @route   PUT /api/sellers/:id
// @access  Admin
exports.updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const fields = [
      'name',
      'mainCategory',
      'categories',
      'contactPerson',
      'email',
      'phone',
      'city',
      'state',
      'address',
      'businessType',
      'yearEstablished',
      'gstin',
      'rating',
      'description',
      'isVerified',
      'trustSeal',
      'isActive',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        seller[field] = req.body[field];
      }
    });

    if (req.body.name && req.body.name !== seller.name) {
      let slug = slugify(req.body.name, { lower: true, strict: true });
      const existing = await Seller.findOne({ slug, _id: { $ne: seller._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      seller.slug = slug;
    }

    await seller.save();
    await seller.populate('mainCategory', 'name slug');

    res.json({ success: true, seller, message: 'Seller updated successfully' });
  } catch (error) {
    console.error('updateSeller error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete seller
// @route   DELETE /api/sellers/:id
// @access  Admin
exports.deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Unassign products from this seller
    await Product.updateMany({ seller: seller._id }, { $unset: { seller: 1 } });

    await seller.deleteOne();
    res.json({ success: true, message: 'Seller deleted successfully' });
  } catch (error) {
    console.error('deleteSeller error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

