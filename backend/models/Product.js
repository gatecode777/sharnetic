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
  // Generate slug when name changes
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

module.exports = mongoose.model("Product", ProductSchema);