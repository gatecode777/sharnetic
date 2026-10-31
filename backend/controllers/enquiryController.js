// backend/controllers/enquiryController.js
const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');
const Seller = require('../models/Seller');

// @desc    Submit a new enquiry (buyer request for product or seller)
// @route   POST /api/enquiries
// @access  Public
exports.createEnquiry = async (req, res) => {
  try {
    const {
      product,
      productName,
      seller,
      sellerName,
      buyerName,
      buyerEmail,
      buyerPhone,
      quantity,
      message,
      city,
    } = req.body;

    if (!buyerName || !buyerEmail || !buyerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone number are required',
      });
    }

    let finalProductName = productName || 'General Requirement';
    let finalSellerId = seller || null;
    let finalSellerName = sellerName || '';

    // If product is provided, populate details
    if (product) {
      const prod = await Product.findById(product).populate('seller', 'name');
      if (prod) {
        finalProductName = prod.name;
        if (!finalSellerId && prod.seller) {
          finalSellerId = prod.seller._id;
          finalSellerName = prod.seller.name;
        }
      }
    }

    // If seller is provided, get seller name
    if (finalSellerId && !finalSellerName) {
      const sell = await Seller.findById(finalSellerId);
      if (sell) {
        finalSellerName = sell.name;
      }
    }

    const enquiry = new Enquiry({
      product: product || null,
      productName: finalProductName,
      seller: finalSellerId,
      sellerName: finalSellerName,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim().toLowerCase(),
      buyerPhone: buyerPhone.trim(),
      quantity: quantity || '10 Units',
      message: message ? message.trim() : '',
      city: city ? city.trim() : '',
      status: 'Pending',
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      enquiry,
      message: 'Enquiry submitted successfully! The supplier will contact you soon.',
    });
  } catch (error) {
    console.error('createEnquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const { status, search, seller, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (seller) {
      query.seller = seller;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { buyerName: { $regex: s, $options: 'i' } },
        { buyerEmail: { $regex: s, $options: 'i' } },
        { buyerPhone: { $regex: s, $options: 'i' } },
        { productName: { $regex: s, $options: 'i' } },
        { sellerName: { $regex: s, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalEnquiries = await Enquiry.countDocuments(query);
    const totalPages = Math.ceil(totalEnquiries / parseInt(limit));

    const enquiries = await Enquiry.find(query)
      .populate('product', 'name images pricing')
      .populate('seller', 'name city state phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      enquiries,
      totalEnquiries,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('getAllEnquiries error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single enquiry
// @route   GET /api/enquiries/:id
// @access  Admin
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('product', 'name images pricing')
      .populate('seller', 'name city state phone email contactPerson');

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.json({ success: true, enquiry });
  } catch (error) {
    console.error('getEnquiryById error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id/status
// @access  Admin
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (!['Pending', 'Contacted', 'In Progress', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    enquiry.status = status;
    await enquiry.save();

    res.json({ success: true, enquiry, message: `Status updated to ${status}` });
  } catch (error) {
    console.error('updateEnquiryStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
// @access  Admin
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await enquiry.deleteOne();
    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('deleteEnquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get enquiry statistics
// @route   GET /api/enquiries/stats
// @access  Admin
exports.getStats = async (req, res) => {
  try {
    const [total, pending, contacted, closed] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'Pending' }),
      Enquiry.countDocuments({ status: 'Contacted' }),
      Enquiry.countDocuments({ status: 'Closed' }),
    ]);

    res.json({
      success: true,
      stats: { total, pending, contacted, closed },
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

