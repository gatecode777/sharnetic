const Product = require("../models/Product");
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

    // Filter by active status
    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    const products = await Product.find(query)
      .populate("category", "name slug")
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
    const product = await Product.findById(req.params.id).populate("category", "name slug");
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
      description,
      price,
      oldPrice,
      stockQuantity,
      inStock,
      isActive,
    } = req.body;

    // Validation
    if (!name || !category || !price) {
      // Delete uploaded files if validation fails
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

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
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
    
    // Populate category before sending response
    await product.populate("category", "name slug");
    
    res.status(201).json({ 
      success: true, 
      product, 
      message: "Product created successfully" 
    });
  } catch (error) {
    console.error("createProduct error:", error);
    // Delete uploaded files if product creation fails
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
      // Delete uploaded files if product not found
      if (req.files) {
        req.files.forEach(file => deleteFile(file.filename));
      }
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      category,
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

    // Update other fields
    if (category) product.category = category;
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

    // Handle images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ 
        url: file.filename, 
        alt: product.name 
      }));
      
      if (keepExistingImages === "true" || keepExistingImages === true) {
        // Keep existing images and add new ones
        product.images = [...product.images, ...newImages];
      } else {
        // Replace all images - delete old ones
        product.images.forEach(img => deleteFile(img.url));
        product.images = newImages;
      }
    }

    await product.save();
    await product.populate("category", "name slug");
    
    res.json({ 
      success: true, 
      product, 
      message: "Product updated successfully" 
    });
  } catch (error) {
    console.error("updateProduct error:", error);
    // Delete uploaded files if update fails
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

    // Check if product has orders (you might want to add this check)
    // const orderCount = await Order.countDocuments({ "items.product": product._id });
    // if (orderCount > 0) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: `Cannot delete. Product is in ${orderCount} order(s).` 
    //   });
    // }

    // Delete all product images from disk
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img.url) deleteFile(img.url);
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

    // Check if image exists in product
    const imageExists = product.images.some(img => img.url === filename);
    if (!imageExists) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Remove from images array
    product.images = product.images.filter((img) => img.url !== filename);
    await product.save();

    // Delete file from disk
    deleteFile(filename);

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