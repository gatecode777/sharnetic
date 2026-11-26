import Product from '../models/Product';
import { toPageNumber, toLimit, toSearchPattern } from '../query';

// Largest page the public API will return (the website itself asks for at most 12).
const MAX_PRODUCTS = 100;

// ==================== GET ALL PRODUCTS (PUBLIC) ====================
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      seller,
      tag,
      search,
      sort = "createdAt",
      order = "desc",
      minPrice,
      maxPrice,
    } = req.query;

    const query = { isActive: true };

    // Filter by Category
    if (category && category !== 'all') {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      if (isValidObjectId) {
        query.category = category;
      }
    }

    // Filter by Seller
    if (seller && seller !== 'all') {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(seller);
      if (isValidObjectId) {
        query.seller = seller;
      }
    }

    if (tag) {
      query.tags = tag;
    }

    const pattern = toSearchPattern(search);
    if (pattern) {
      query.name = { $regex: pattern, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query["pricing.price"] = {};
      if (minPrice) query["pricing.price"].$gte = parseFloat(minPrice);
      if (maxPrice) query["pricing.price"].$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {
      createdAt: { createdAt: order === "asc" ? 1 : -1 },
      price: { "pricing.price": order === "asc" ? 1 : -1 },
      name: { name: order === "asc" ? 1 : -1 },
    };
    const sortQuery = sortOptions[sort] || sortOptions.createdAt;

    const pageNumber = toPageNumber(page);
    const pageSize = toLimit(limit, 12, MAX_PRODUCTS);
    const skip = (pageNumber - 1) * pageSize;
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / pageSize);

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize)
      .select("-__v")
      .populate('category', 'name slug')
      .populate('seller', 'name slug city state rating isVerified trustSeal phone email contactPerson businessType');

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("getAllProducts (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET PRODUCT BY ID ====================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .select("-__v")
      .populate('category', 'name slug')
      .populate('seller', 'name slug city state address rating totalRatings isVerified trustSeal phone email contactPerson businessType yearEstablished description');

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("getProductById (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET PRODUCT BY SLUG ====================
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .select("-__v")
      .populate('category', 'name slug')
      .populate('seller', 'name slug city state address rating totalRatings isVerified trustSeal phone email contactPerson businessType yearEstablished description');

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error("getProductBySlug (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET PRODUCTS BY CATEGORY ====================
export const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const query = { isActive: true };
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(category);
    if (isValidObjectId) {
      query.category = category;
    }

    const pageNumber = toPageNumber(page);
    const pageSize = toLimit(limit, 12, MAX_PRODUCTS);
    const skip = (pageNumber - 1) * pageSize;
    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select("-__v")
      .populate('category', 'name slug')
      .populate('seller', 'name slug city state rating isVerified trustSeal');

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage: pageNumber,
      category,
    });
  } catch (error) {
    console.error("getByCategory (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== SEARCH PRODUCTS ====================
export const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    const pattern = toSearchPattern(q);
    if (!pattern) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: pattern, $options: "i" } },
        { description: { $regex: pattern, $options: "i" } },
        { tags: { $regex: pattern, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(toLimit(limit, 10, MAX_PRODUCTS))
      .select("name slug category seller pricing images tags unit moq")
      .populate('category', 'name slug')
      .populate('seller', 'name slug city state rating isVerified trustSeal');

    res.json({ success: true, products, query: q });
  } catch (error) {
    console.error("searchProducts (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== GET FEATURED / NEW / POPULAR ====================
export const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { limit = 8 } = req.query;

    const validTags = ["new", "organic", "seasonal", "popular", "discount"];
    if (!validTags.includes(tag)) {
      return res.status(400).json({ success: false, message: "Invalid tag" });
    }

    const products = await Product.find({ isActive: true, tags: tag })
      .sort({ createdAt: -1 })
      .limit(toLimit(limit, 8, MAX_PRODUCTS))
      .select("-__v")
      .populate('category', 'name slug')
      .populate('seller', 'name slug city state rating isVerified trustSeal');

    res.json({ success: true, products, tag });
  } catch (error) {
    console.error("getProductsByTag (public) error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
