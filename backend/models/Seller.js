// backend/models/Seller.js
const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    contactPerson: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: 'Jaipur',
    },
    state: {
      type: String,
      trim: true,
      default: 'Rajasthan',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    businessType: {
      type: String,
      default: 'Manufacturer & Wholesaler',
    },
    yearEstablished: {
      type: Number,
      default: 2015,
    },
    gstin: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.6,
      min: 1,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 45,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    trustSeal: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

sellerSchema.index({ mainCategory: 1 });
sellerSchema.index({ city: 1 });
sellerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Seller', sellerSchema);

