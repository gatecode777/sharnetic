import connectDB from './_db.js';
import mongoose from 'mongoose';
import Product from '../src/server/models/Product.js';
import Seller from '../src/server/models/Seller.js';
import Category from '../src/server/models/Category.js';

async function inspect() {
  await connectDB();
  console.log('Connected to MongoDB');

  const totalProducts = await Product.countDocuments();
  const totalSellers = await Seller.countDocuments();
  const totalCategories = await Category.countDocuments();

  console.log(`Total Products: ${totalProducts}`);
  console.log(`Total Sellers: ${totalSellers}`);
  console.log(`Total Categories: ${totalCategories}`);

  // Products by category
  const catCounts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const categories = await Category.find();
  const catMap = new Map();
  categories.forEach(c => catMap.set(c._id.toString(), c.name));

  console.log('\nProducts per Category:');
  for (const c of catCounts) {
    const name = catMap.get(c._id ? c._id.toString() : '') || 'No Category';
    console.log(`- ${name}: ${c.count}`);
  }

  // How many products currently have sellers assigned
  const prodsWithSeller = await Product.countDocuments({ seller: { $exists: true, $ne: null } });
  console.log(`\nProducts with seller assigned: ${prodsWithSeller} / ${totalProducts}`);

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});

