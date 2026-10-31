// backend/models/Enquiry.js
const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    productName: {
      type: String,
      trim: true,
      default: 'General Requirement',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      default: null,
    },
    sellerName: {
      type: String,
      trim: true,
      default: '',
    },
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    buyerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      trim: true,
      default: '10 Units',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'In Progress', 'Closed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ seller: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);

