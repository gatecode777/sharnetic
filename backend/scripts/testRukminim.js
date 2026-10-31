const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const https = require('https');
const Product = require('../models/Product');

function checkHttps(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({ 'images.0': { $exists: true } }).limit(10);
  console.log(`Testing 10 products...`);

  for (const p of products) {
    const rawUrl = p.images[0]?.url;
    if (!rawUrl) continue;
    // Transform img5a / img6a to rukminim1 / rukminim2
    const secureUrl = rawUrl.replace(/https?:\/\/img[0-9]a\.flixcart\.com/i, 'https://rukminim1.flixcart.com');
    const res = await checkHttps(secureUrl);
    console.log(`${p.name.slice(0, 30)} => ${res.status}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

