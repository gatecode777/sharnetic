import connectDB from './_db.js';
import mongoose from 'mongoose';
import Product from '../src/server/models/Product.js';

async function migrate() {
  await connectDB();
  console.log('Connected to MongoDB. Scanning for legacy image URLs...');

  const query = {
    'images.url': { $regex: /img[0-9]a\.flixcart\.com/i },
  };

  const count = await Product.countDocuments(query);
  console.log(`Found ${count} products with legacy unencrypted Flipkart CDN image URLs.`);

  if (count === 0) {
    console.log('No products to migrate.');
    await mongoose.disconnect();
    return;
  }

  const cursor = Product.find(query).cursor();
  const BATCH_SIZE = 500;
  let batch = [];
  let updatedCount = 0;

  for await (const doc of cursor) {
    let changed = false;
    const newImages = (doc.images || []).map((img) => {
      if (img.url && /img[0-9]a\.flixcart\.com/i.test(img.url)) {
        changed = true;
        const newUrl = img.url.replace(/https?:\/\/img[0-9]a\.flixcart\.com/i, 'https://rukminim1.flixcart.com');
        return {
          url: newUrl,
          alt: img.alt || doc.name,
        };
      }
      return img;
    });

    if (changed) {
      batch.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { images: newImages } },
        },
      });
    }

    if (batch.length >= BATCH_SIZE) {
      await Product.bulkWrite(batch, { ordered: false });
      updatedCount += batch.length;
      console.log(`Migrated ${updatedCount} / ${count} products...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await Product.bulkWrite(batch, { ordered: false });
    updatedCount += batch.length;
  }

  console.log(`Migration complete! Successfully updated ${updatedCount} products to https://rukminim1.flixcart.com.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});

