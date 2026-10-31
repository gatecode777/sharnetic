const Product = require("../models/Product");
const Category = require("../models/Category");
const Seller = require("../models/Seller");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");

// Helper function to delete file
const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "../public/uploads/products", filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("File delete error:", e);
    }
  }
};

// ==================== GET ALL PRODUCTS (ADMIN) ====================
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category = "all",
      seller = "all",
      status = "all",
    } = req.query;

    const query = {};

    // Search by name
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by seller
    if (seller && seller !== "all") {
      query.seller = seller;
    }

    // Filter by active status
    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("seller", "name city state")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== GET SINGLE PRODUCT (ADMIN) ====================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("seller", "name city state");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      seller,
      moq,
      unit,
      description,
      price,
      oldPrice,
      stockQuantity,
      inStock,
      isActive,
    } = req.body;

    // Validation
    if (!name || !category || !price) {
      if (req.files) {
        req.files.forEach(file => deleteFile(file.filename));
      }
      return res.status(400).json({
        success: false,
        message: "Name, category, and price are required",
      });
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Handle images (URLs from body and/or uploaded files)
    const images = [];
    let parsedUrls = [];
    if (req.body.imageUrls) {
      try {
        parsedUrls = typeof req.body.imageUrls === 'string'
          ? (req.body.imageUrls.startsWith('[') ? JSON.parse(req.body.imageUrls) : req.body.imageUrls.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean))
          : req.body.imageUrls;
      } catch (e) {
        parsedUrls = String(req.body.imageUrls).split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
      }
    } else if (req.body.images && typeof req.body.images === 'string') {
      try {
        parsedUrls = req.body.images.startsWith('[') ? JSON.parse(req.body.images) : req.body.images.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
      } catch (e) {
        parsedUrls = [req.body.images.trim()];
      }
    }

    if (Array.isArray(parsedUrls)) {
      parsedUrls.forEach((u) => {
        const urlStr = typeof u === 'string' ? u : u?.url;
        if (urlStr && urlStr.trim()) images.push({ url: urlStr.trim(), alt: name });
      });
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({ 
          url: file.filename, 
          alt: name 
        });
      });
    }

    // Create product according to schema
    const product = new Product({
      name: name.trim(),
      slug,
      category,
      seller: seller || null,
      moq: moq || "10 Pieces",
      unit: unit || "Piece",
      description: description || "",
      images,
      pricing: {
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      },
      stock: {
        quantity: parseInt(stockQuantity) || 0,
        inStock: inStock === "true" || inStock === true,
      },
      isActive: isActive === "false" || isActive === false ? false : true,
    });

    await product.save();
    await product.populate("category", "name slug");
    await product.populate("seller", "name city state");
    
    res.status(201).json({ 
      success: true, 
      product, 
      message: "Product created successfully" 
    });
  } catch (error) {
    console.error("createProduct error:", error);
    if (req.files) {
      req.files.forEach(file => deleteFile(file.filename));
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error" 
    });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.files) {
        req.files.forEach(file => deleteFile(file.filename));
      }
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      category,
      seller,
      moq,
      unit,
      description,
      price,
      oldPrice,
      stockQuantity,
      inStock,
      isActive,
      keepExistingImages,
    } = req.body;

    // Update slug if name changed
    if (name && name !== product.name) {
      let slug = slugify(name, { lower: true, strict: true });
      const existing = await Product.findOne({ slug, _id: { $ne: product._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      product.slug = slug;
      product.name = name.trim();
    }

    // Update fields
    if (category) product.category = category;
    if (seller !== undefined) product.seller = seller || null;
    if (moq !== undefined) product.moq = moq;
    if (unit !== undefined) product.unit = unit;
    if (description !== undefined) product.description = description;

    // Update pricing
    if (price !== undefined) {
      product.pricing.price = parseFloat(price);
    }
    if (oldPrice !== undefined) {
      product.pricing.oldPrice = oldPrice ? parseFloat(oldPrice) : null;
    }

    // Update stock
    if (stockQuantity !== undefined) {
      product.stock.quantity = parseInt(stockQuantity);
    }
    if (inStock !== undefined) {
      product.stock.inStock = inStock === "true" || inStock === true;
    }

    // Update status
    if (isActive !== undefined) {
      product.isActive = isActive === "false" || isActive === false ? false : true;
    }

    // Handle image URLs (passed directly or in JSON)
    if (req.body.imageUrls !== undefined || req.body.images !== undefined) {
      const incoming = req.body.imageUrls !== undefined ? req.body.imageUrls : req.body.images;
      let parsed = [];
      try {
        parsed = typeof incoming === 'string'
          ? (incoming.startsWith('[') ? JSON.parse(incoming) : incoming.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean))
          : incoming;
      } catch (e) {
        parsed = String(incoming).split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
      }

      if (Array.isArray(parsed)) {
        product.images = parsed.map(item => {
          const urlStr = typeof item === 'string' ? item : item?.url;
          return { url: urlStr?.trim(), alt: product.name };
        }).filter(img => img.url);
      }
    }

    // Handle uploaded file images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ 
        url: file.filename, 
        alt: product.name 
      }));
      
      if (keepExistingImages === "true" || keepExistingImages === true || req.body.imageUrls !== undefined) {
        product.images = [...(product.images || []), ...newImages];
      } else {
        product.images.forEach(img => {
          if (!img.url?.startsWith('http')) deleteFile(img.url);
        });
        product.images = newImages;
      }
    }

    await product.save();
    await product.populate("category", "name slug");
    await product.populate("seller", "name city state");
    
    res.json({ 
      success: true, 
      product, 
      message: "Product updated successfully" 
    });
  } catch (error) {
    console.error("updateProduct error:", error);
    if (req.files) {
      req.files.forEach(file => deleteFile(file.filename));
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error" 
    });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete all product images from disk
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img.url && !img.url.startsWith('http')) deleteFile(img.url);
      });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== DELETE SINGLE IMAGE ====================
exports.deleteProductImage = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const imageExists = product.images.some(img => img.url === filename);
    if (!imageExists) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    product.images = product.images.filter((img) => img.url !== filename);
    await product.save();

    if (!filename.startsWith('http')) {
      deleteFile(filename);
    }

    res.json({ 
      success: true, 
      message: "Image deleted successfully",
      images: product.images 
    });
  } catch (error) {
    console.error("deleteProductImage error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== TOGGLE ACTIVE STATUS ====================
exports.toggleActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      isActive: product.isActive,
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("toggleActive error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== TOGGLE IN-STOCK STATUS ====================
exports.toggleInStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.stock.inStock = !product.stock.inStock;
    await product.save();

    res.json({
      success: true,
      inStock: product.stock.inStock,
      message: `Product marked as ${product.stock.inStock ? "In Stock" : "Out of Stock"}`,
    });
  } catch (error) {
    console.error("toggleInStock error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== GET STATS ====================
exports.getStats = async (req, res) => {
  try {
    const [totalProducts, active, inactive, outOfStock] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ "stock.inStock": false }),
    ]);

    res.json({
      success: true,
      stats: { 
        totalProducts, 
        active, 
        inactive, 
        outOfStock 
      },
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== EXPORT PRODUCTS ====================
exports.exportProducts = async (req, res) => {
  try {
    const { category, seller, status, search } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }
    if (category && category !== "all") query.category = category;
    if (seller && seller !== "all") query.seller = seller;
    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("seller", "name")
      .sort({ createdAt: -1 });

    const formatted = products.map((p) => ({
      name: p.name || "",
      category: p.category?.name || "",
      seller: p.seller?.name || "",
      price: p.pricing?.price || 0,
      oldPrice: p.pricing?.oldPrice || "",
      unit: p.unit || "Piece",
      moq: p.moq || "10 Pieces",
      quantity: p.stock?.quantity || 0,
      inStock: p.stock?.inStock !== false ? "Yes" : "No",
      isActive: p.isActive !== false ? "Active" : "Inactive",
      description: p.description || "",
      images: p.images?.map((img) => img.url).join(";") || "",
    }));

    res.json({
      success: true,
      count: formatted.length,
      products: formatted,
    });
  } catch (error) {
    console.error("exportProducts error:", error);
    res.status(500).json({ success: false, message: "Export failed", error: error.message });
  }
};

// ==================== BULK IMPORT PRODUCTS ====================
exports.bulkImportProducts = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided for import" });
    }

    // Cache categories & sellers for rapid lookup
    const [categories, sellers] = await Promise.all([
      Category.find(),
      Seller.find(),
    ]);

    const catMap = new Map();
    categories.forEach((c) => {
      catMap.set(c.name.toLowerCase().trim(), c._id);
      catMap.set(c._id.toString(), c._id);
    });

    const sellerMap = new Map();
    sellers.forEach((s) => {
      sellerMap.set(s.name.toLowerCase().trim(), s._id);
      sellerMap.set(s._id.toString(), s._id);
    });

    const defaultSellerId = sellers[0]?._id || null;
    let defaultCatId = categories[0]?._id || null;

    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;

      if (!item.name || !item.name.trim()) {
        errors.push({ row: rowNum, error: "Product name is required" });
        continue;
      }

      const name = item.name.trim();
      const price = parseFloat(item.price);
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, error: `Invalid price: ${item.price}` });
        continue;
      }

      // Resolve category
      let categoryId = null;
      const catKey = (item.category || item.categoryName || "").toLowerCase().trim();
      if (catKey && catMap.has(catKey)) {
        categoryId = catMap.get(catKey);
      } else if (catKey) {
        try {
          const newSlug = slugify(item.category || item.categoryName, { lower: true, strict: true }) || `cat-${Date.now()}`;
          const newCat = await Category.create({
            name: (item.category || item.categoryName).trim(),
            slug: newSlug,
          });
          categoryId = newCat._id;
          catMap.set(catKey, newCat._id);
          catMap.set(newCat._id.toString(), newCat._id);
        } catch (e) {
          categoryId = defaultCatId;
        }
      } else {
        categoryId = defaultCatId;
      }

      // Resolve seller
      let sellerId = null;
      const sellerKey = (item.seller || item.sellerName || "").toLowerCase().trim();
      if (sellerKey && sellerMap.has(sellerKey)) {
        sellerId = sellerMap.get(sellerKey);
      } else {
        sellerId = defaultSellerId;
      }

      // Resolve images
      let images = [];
      if (Array.isArray(item.images)) {
        images = item.images.map(img => typeof img === 'string' ? { url: img, alt: name } : img);
      } else if (typeof item.images === 'string' && item.images.trim()) {
        images = item.images.split(/[;,]/).map(url => ({ url: url.trim(), alt: name })).filter(img => img.url);
      }

      // Check if product with same name exists
      const existingProduct = await Product.findOne({ name });

      if (existingProduct) {
        existingProduct.pricing.price = price;
        if (item.oldPrice) existingProduct.pricing.oldPrice = parseFloat(item.oldPrice) || undefined;
        if (categoryId) existingProduct.category = categoryId;
        if (sellerId) existingProduct.seller = sellerId;
        if (item.unit) existingProduct.unit = item.unit.trim();
        if (item.moq) existingProduct.moq = item.moq.trim();
        if (item.description !== undefined) existingProduct.description = item.description.trim();
        if (item.quantity !== undefined) existingProduct.stock.quantity = parseInt(item.quantity) || 0;
        if (item.inStock !== undefined) existingProduct.stock.inStock = String(item.inStock).toLowerCase() !== 'no' && String(item.inStock).toLowerCase() !== 'false';
        if (item.isActive !== undefined) existingProduct.isActive = String(item.isActive).toLowerCase() !== 'inactive' && String(item.isActive).toLowerCase() !== 'false';
        if (images.length > 0) existingProduct.images = images;

        await existingProduct.save();
        updatedCount++;
      } else {
        let baseSlug = slugify(name, { lower: true, strict: true }) || 'product';
        let slug = baseSlug;
        const slugExists = await Product.findOne({ slug });
        if (slugExists) {
          slug = `${baseSlug}-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
        }

        await Product.create({
          name,
          slug,
          category: categoryId,
          seller: sellerId,
          pricing: {
            price,
            oldPrice: item.oldPrice ? parseFloat(item.oldPrice) || undefined : undefined,
          },
          unit: item.unit?.trim() || "Piece",
          moq: item.moq?.trim() || "10 Pieces",
          description: item.description?.trim() || "",
          images,
          stock: {
            quantity: item.quantity ? parseInt(item.quantity) || 0 : 50,
            inStock: String(item.inStock).toLowerCase() !== 'no' && String(item.inStock).toLowerCase() !== 'false',
          },
          isActive: String(item.isActive).toLowerCase() !== 'inactive' && String(item.isActive).toLowerCase() !== 'false',
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
    console.error("bulkImportProducts error:", error);
    res.status(500).json({ success: false, message: "Bulk import failed", error: error.message });
  }
};
