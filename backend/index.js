const dotenv = require('dotenv');
const path = require("path");

// Load environment variables from .env in backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin, allowedOrigins, localhost, or Vercel deployments
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Fallback handlers for missing uploaded files
app.use('/uploads/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/uploads/products/default-product.png'));
});
app.use('/uploads/categories', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/uploads/categories/default-category.png'));
});

// API Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/publicProductRoutes"));
app.use("/api/sellers", require("./routes/sellerRoutes"));
app.use("/api/enquiries", require("./routes/enquiryRoutes"));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminAuthRoutes"));
app.use("/api/admin/users", require("./routes/adminUserRoutes")); 
app.use("/api/admin/products", require("./routes/adminProductRoutes")); 
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB per file.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 images.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please free the port or change PORT in .env.`);
  } else {
    console.error('Server error:', err);
  }
});
