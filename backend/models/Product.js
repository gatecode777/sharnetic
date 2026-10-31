const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },

    moq: {
      type: String,
      default: "10 Pieces",
      trim: true
    },

    unit: {
      type: String,
      default: "Piece",
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    images: [
      {
        url: {
          type: String
        },
        alt: {
          type: String
        }
      }
    ],

    pricing: {
      price: {
        type: Number,
        required: true,
        min: 0
      },
      oldPrice: {
        type: Number,
        min: 0
      }
    },

    stock: {
      quantity: {
        type: Number,
        default: 0
      },
      inStock: {
        type: Boolean,
        default: true
      }
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

ProductSchema.pre("save", function (next) {
  // Only auto-generate slug if not explicitly set
  if (!this.slug) {
    const base = (this.name || "product")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "product";
    this.slug = `${base}-${Math.random().toString(36).substring(2, 7)}`;
  }
  if (typeof next === "function") next();
});

ProductSchema.index({ seller: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", ProductSchema);
