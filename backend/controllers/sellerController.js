// backend/controllers/sellerController.js
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Category = require('../models/Category');
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

// ==================== EXPORT SELLERS ====================
exports.exportSellers = async (req, res) => {
  try {
    const sellers = await Seller.find()
      .populate('mainCategory', 'name')
      .sort({ createdAt: -1 });

    const formatted = sellers.map((s) => ({
      name: s.name || '',
      mainCategory: s.mainCategory?.name || '',
      contactPerson: s.contactPerson || '',
      email: s.email || '',
      phone: s.phone || '',
      city: s.city || '',
      state: s.state || '',
      address: s.address || '',
      businessType: s.businessType || 'Manufacturer & Wholesaler',
      yearEstablished: s.yearEstablished || 2015,
      gstin: s.gstin || '',
      rating: s.rating || 4.8,
      isVerified: s.isVerified !== false ? 'Yes' : 'No',
      trustSeal: s.trustSeal !== false ? 'Yes' : 'No',
      isActive: s.isActive !== false ? 'Active' : 'Inactive',
      description: s.description || '',
    }));

    res.json({
      success: true,
      count: formatted.length,
      sellers: formatted,
    });
  } catch (error) {
    console.error('exportSellers error:', error);
    res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
};

// ==================== BULK IMPORT SELLERS ====================
exports.bulkImportSellers = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided for import' });
    }

    const categories = await Category.find();
    const catMap = new Map();
    categories.forEach((c) => {
      catMap.set(c.name.toLowerCase().trim(), c._id);
      catMap.set(c._id.toString(), c._id);
    });

    const defaultCatId = categories[0]?._id;
    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;

      if (!item.name || !item.name.trim()) {
        errors.push({ row: rowNum, error: 'Supplier name is required' });
        continue;
      }

      const name = item.name.trim();

      // Resolve mainCategory
      let mainCategoryId = null;
      const catKey = (item.mainCategory || item.category || '').toLowerCase().trim();
      if (catKey && catMap.has(catKey)) {
        mainCategoryId = catMap.get(catKey);
      } else if (catKey) {
        try {
          const newSlug = slugify(item.mainCategory || item.category, { lower: true, strict: true }) || `cat-${Date.now()}`;
          const newCat = await Category.create({
            name: (item.mainCategory || item.category).trim(),
            slug: newSlug,
          });
          mainCategoryId = newCat._id;
          catMap.set(catKey, newCat._id);
        } catch (e) {
          mainCategoryId = defaultCatId;
        }
      } else {
        mainCategoryId = defaultCatId;
      }

      if (!mainCategoryId) {
        errors.push({ row: rowNum, error: 'Could not assign a main category' });
        continue;
      }

      const existingSeller = await Seller.findOne({ name });

      if (existingSeller) {
        if (mainCategoryId) existingSeller.mainCategory = mainCategoryId;
        if (item.contactPerson !== undefined) existingSeller.contactPerson = item.contactPerson.trim();
        if (item.email !== undefined) existingSeller.email = item.email.trim();
        if (item.phone !== undefined) existingSeller.phone = item.phone.trim();
        if (item.city !== undefined) existingSeller.city = item.city.trim();
        if (item.state !== undefined) existingSeller.state = item.state.trim();
        if (item.address !== undefined) existingSeller.address = item.address.trim();
        if (item.businessType !== undefined) existingSeller.businessType = item.businessType.trim();
        if (item.yearEstablished) existingSeller.yearEstablished = parseInt(item.yearEstablished) || 2015;
        if (item.gstin !== undefined) existingSeller.gstin = item.gstin.trim();
        if (item.rating) existingSeller.rating = parseFloat(item.rating) || 4.8;
        if (item.isVerified !== undefined) existingSeller.isVerified = String(item.isVerified).toLowerCase() !== 'no' && String(item.isVerified).toLowerCase() !== 'false';
        if (item.trustSeal !== undefined) existingSeller.trustSeal = String(item.trustSeal).toLowerCase() !== 'no' && String(item.trustSeal).toLowerCase() !== 'false';
        if (item.isActive !== undefined) existingSeller.isActive = String(item.isActive).toLowerCase() !== 'inactive' && String(item.isActive).toLowerCase() !== 'false';
        if (item.description !== undefined) existingSeller.description = item.description.trim();

        await existingSeller.save();
        updatedCount++;
      } else {
        let baseSlug = slugify(name, { lower: true, strict: true }) || 'supplier';
        let slug = baseSlug;
        const slugExists = await Seller.findOne({ slug });
        if (slugExists) {
          slug = `${baseSlug}-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
        }

        await Seller.create({
          name,
          slug,
          mainCategory: mainCategoryId,
          categories: [mainCategoryId],
          contactPerson: item.contactPerson?.trim() || '',
          email: item.email?.trim() || '',
          phone: item.phone?.trim() || '',
          city: item.city?.trim() || 'Jaipur',
          state: item.state?.trim() || 'Rajasthan',
          address: item.address?.trim() || '',
          businessType: item.businessType?.trim() || 'Manufacturer & Wholesaler',
          yearEstablished: parseInt(item.yearEstablished) || 2015,
          gstin: item.gstin?.trim() || '',
          rating: parseFloat(item.rating) || 4.8,
          isVerified: String(item.isVerified).toLowerCase() !== 'no' && String(item.isVerified).toLowerCase() !== 'false',
          trustSeal: String(item.trustSeal).toLowerCase() !== 'no' && String(item.trustSeal).toLowerCase() !== 'false',
          isActive: String(item.isActive).toLowerCase() !== 'inactive' && String(item.isActive).toLowerCase() !== 'false',
          description: item.description?.trim() || '',
        });
        createdCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${createdCount} created, ${updatedCount} updated, ${errors.length} errors.`,
      createdCount,
      updatedCount,
      errorCount: errors.length,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    console.error('bulkImportSellers error:', error);
    res.status(500).json({ success: false, message: 'Bulk import failed', error: error.message });
  }
};

