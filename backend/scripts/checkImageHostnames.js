const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const prods = await Product.find({ 'images.0': { $exists: true } }).select('images').limit(2000);
  const domains = new Set();
  prods.forEach(p => {
    (p.images || []).forEach(img => {
      const u = typeof img === 'string' ? img : img.url;
      if (u && u.startsWith('http')) {
        try {
          const host = new URL(u).hostname;
          domains.add(host);
        } catch(e) {}
      }
    });
  });
  console.log('Unique Image Hostnames in DB:', Array.from(domains));
  await mongoose.disconnect();
}

check().catch(console.error);

