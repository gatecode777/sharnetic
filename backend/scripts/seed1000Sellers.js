// backend/scripts/seed1000Sellers.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const slugify = require('slugify');

const Category = require('../models/Category');
const Seller = require('../models/Seller');
const Product = require('../models/Product');

const CITIES = [
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Tiruppur', state: 'Tamil Nadu' },
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Rajkot', state: 'Gujarat' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Jodhpur', state: 'Rajasthan' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Panipat', state: 'Haryana' },
  { city: 'Moradabad', state: 'Uttar Pradesh' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Vadodara', state: 'Gujarat' },
  { city: 'Nashik', state: 'Maharashtra' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Bhiwandi', state: 'Maharashtra' },
];

const ADDRESSES = [
  'Plot 42, Sitapura Industrial Area, Tonk Road',
  'GIDC Industrial Estate, Phase 2, Vatva',
  'MIDC Industrial Area, Bhosari',
  'Millennium Textile Market, Ring Road',
  'Krishi Upaj Mandi, Mandore Road',
  'Peenya Industrial Estate, 3rd Stage',
  'Focal Point, Phase IV, GT Road',
  'Ambad Industrial Area, MIDC',
  'Pithampur Industrial Area, Sector 3',
  'Ambattur Industrial Estate, 4th Cross',
  'Udyog Vihar Phase 5, Expressway',
  'RIICO Industrial Area, Mansarovar',
  'Panki Industrial Area, Site 2',
  'Makarpura GIDC Estate',
  'Sanand Industrial Park, Phase 1',
  'Sachin GIDC Textile Hub',
  'Sipcot Industrial Complex',
  'Hathras Road Industrial Area',
  'Okhla Industrial Area, Phase 3',
  'Electronic City, Phase 1',
  'Industrial Model Township (IMT), Sector 8',
  'Baddi Industrial Corridor, Phase 2',
];

const FIRST_NAMES = [
  'Rajesh', 'Sunil', 'Amit', 'Suresh', 'Praveen', 'Ananya', 'Ramesh', 'Gaurav',
  'Vikram', 'Pooja', 'Manoj', 'Deepak', 'Sanjay', 'Alok', 'Dinesh', 'Kavita',
  'Ashok', 'Neeraj', 'Manish', 'Rahul', 'Pradeep', 'Arun', 'Kiran', 'Nitin',
  'Vijay', 'Kamal', 'Harish', 'Sachin', 'Anil', 'Mukesh', 'Rohit', 'Chetan',
  'Vishal', 'Tarun', 'Anand', 'Hemant', 'Mohit', 'Vivek', 'Naveen', 'Siddharth'
];

const LAST_NAMES = [
  'Sharma', 'Mehta', 'Agarwal', 'Patel', 'Joshi', 'Verma', 'Gupta', 'Singh',
  'Bansal', 'Shah', 'Rathore', 'Choudhary', 'Jain', 'Mittal', 'Khandelwal',
  'Trivedi', 'Yadav', 'Rao', 'Reddy', 'Nair', 'Deshmukh', 'Saxena', 'Pandey',
  'Purohit', 'Soni', 'Bhatia', 'Malhotra', 'Singhal', 'Chauhan', 'Thakur'
];

const PREFIXES = [
  'Apex', 'Vardhman', 'Surat Weaves', 'Kaveri', 'Heritage', 'Krishna', 'Shree Ram',
  'Mahalaxmi', 'Royal', 'Navkar', 'Shakti', 'Siddhi', 'Om', 'Radhe', 'Vibrant',
  'Zenith', 'Prestige', 'Golden', 'Silver', 'Classic', 'Swastik', 'Lotus',
  'Galaxy', 'Crown', 'Elite', 'Paramount', 'Imperial', 'Kohinoor', 'Sunlight',
  'Elegance', 'Trendset', 'Urban', 'Metro', 'Shreeji', 'Kuber', 'Ganesh',
  'Tirupati', 'Ambica', 'Bharat', 'National', 'Universal', 'Pioneer', 'Falcon',
  'Vanguard', 'Matrix', 'Nexus', 'Prime', 'Global', 'Standard', 'Dynamic'
];

const SUFFIXES = [
  'Pvt Ltd', 'Industries', 'Enterprises', 'Exports', 'Corp', 'India',
  'International', 'Works', 'Ltd', 'Co', 'Solutions', 'Holdings'
];

const BUSINESS_TYPES = [
  'Manufacturer & Exporter',
  'OEM & ODM Manufacturer',
  'Wholesale Distributor & Impex',
  'Bulk Supplier & Fabricator',
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGstin(state) {
  const stateCodes = {
    'Rajasthan': '08',
    'Gujarat': '24',
    'Maharashtra': '27',
    'Punjab': '03',
    'Delhi': '07',
    'Tamil Nadu': '33',
    'Karnataka': '29',
    'Madhya Pradesh': '23',
    'Uttar Pradesh': '09',
    'West Bengal': '19',
    'Telangana': '36',
    'Haryana': '06',
  };
  const code = stateCodes[state] || '08';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let pan = '';
  for (let i = 0; i < 5; i++) pan += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) pan += digits[Math.floor(Math.random() * digits.length)];
  pan += letters[Math.floor(Math.random() * letters.length)];
  return `${code}${pan}1Z${digits[Math.floor(Math.random() * digits.length)]}`;
}

function getCategoryMidWord(categoryName) {
  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('cloth') || lower.includes('apparel')) {
    return getRandomItem(['Garments', 'Textiles', 'Apparels', 'Fabrics', 'Knitwear', 'Fashions', 'Weaves', 'Cotton Mills', 'Silks', 'Outfitters']);
  }
  if (lower.includes('footwear')) {
    return getRandomItem(['Footwear', 'Leather Works', 'Shoe Crafts', 'Footstyle', 'Soles & Steps', 'Leathercraft', 'Comfort Shoes']);
  }
  if (lower.includes('jewel')) {
    return getRandomItem(['Jewels', 'Gems & Jewellery', 'Ornaments', 'Jewellers', 'Diamonds & Gold', 'Jewel Crafters', 'Silver Works']);
  }
  if (lower.includes('auto')) {
    return getRandomItem(['Automotive', 'Auto Spares', 'Engineering Works', 'Motors & Parts', 'Auto Components', 'Drive Systems']);
  }
  if (lower.includes('comput') || lower.includes('mobil') || lower.includes('camera') || lower.includes('gam')) {
    return getRandomItem(['Electronics', 'Digital Systems', 'Tech Components', 'Micro Devices', 'Infotech', 'Smart Devices']);
  }
  if (lower.includes('furnit') || lower.includes('decor') || lower.includes('furnish')) {
    return getRandomItem(['Furnishings', 'Woodcraft', 'Living Designs', 'Timber Works', 'Interiors & Decor', 'Wood Works']);
  }
  if (lower.includes('tool') || lower.includes('hardw') || lower.includes('improv')) {
    return getRandomItem(['Tools & Hardware', 'Precision Fasteners', 'Forge & Tools', 'Industrial Hardwares', 'Machine Tools']);
  }
  if (lower.includes('beauty') || lower.includes('person')) {
    return getRandomItem(['Cosmetics', 'Botanicals', 'Herbal Labs', 'Personal Care', 'Skin Formulations', 'Wellness Labs']);
  }
  if (lower.includes('kitchen')) {
    return getRandomItem(['Kitchenwares', 'Steel Industries', 'Cookware Products', 'Appliance Works', 'Utensil Crafts']);
  }
  if (lower.includes('bag')) {
    return getRandomItem(['Leather Goods', 'Luggage & Bags', 'Leathercraft', 'Bag Works', 'Travel Accessories']);
  }
  if (lower.includes('watch')) {
    return getRandomItem(['Timepieces', 'Watches & Clocks', 'Chronocraft', 'Precision Watches', 'Horology']);
  }
  if (lower.includes('toy') || lower.includes('baby') || lower.includes('school')) {
    return getRandomItem(['Toycraft', 'Kids World', 'Educational Supplies', 'Play & Learn', 'Baby Care Products']);
  }
  if (lower.includes('sport')) {
    return getRandomItem(['Sports Goods', 'Fitness Equipment', 'Active Gear', 'Athletic Works']);
  }
  return getRandomItem(['Industries', 'Trading Co', 'Manufacturing Corp', 'Enterprises', 'Supplies', 'Impex', 'Products Corp']);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const categories = await Category.find();
  if (categories.length === 0) {
    console.error('No categories found. Aborting.');
    process.exit(1);
  }

  // Count existing products per category
  const prodsByCat = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const catProdCountMap = new Map();
  prodsByCat.forEach(p => {
    if (p._id) catProdCountMap.set(p._id.toString(), p.count);
  });

  const TOTAL_NEW_SELLERS = 1000;
  console.log(`Generating ${TOTAL_NEW_SELLERS} realistic Indian B2B suppliers...`);

  // Distribute 1000 sellers proportionally to the product volume of each category (with a minimum of 5 per category)
  const totalProducts = await Product.countDocuments();
  const sellerAllocation = [];
  let allocatedCount = 0;

  for (const cat of categories) {
    const pCount = catProdCountMap.get(cat._id.toString()) || 0;
    let target = Math.max(5, Math.round((pCount / totalProducts) * (TOTAL_NEW_SELLERS - categories.length * 5)));
    sellerAllocation.push({ category: cat, target });
    allocatedCount += target;
  }

  // Adjust difference to hit exactly 1000
  let diff = TOTAL_NEW_SELLERS - allocatedCount;
  if (diff !== 0) {
    sellerAllocation[0].target += diff;
  }

  const generatedSellers = [];
  const usedSlugs = new Set();
  const existingSellers = await Seller.find().select('slug');
  existingSellers.forEach(s => usedSlugs.add(s.slug));

  let sellerIndex = 1;

  for (const alloc of sellerAllocation) {
    const cat = alloc.category;
    const count = alloc.target;

    for (let i = 0; i < count; i++) {
      const prefix = getRandomItem(PREFIXES);
      const mid = getCategoryMidWord(cat.name);
      const suffix = getRandomItem(SUFFIXES);
      const companyName = `${prefix} ${mid} ${suffix}`;

      let baseSlug = slugify(companyName, { lower: true, strict: true }) || 'supplier';
      let slug = `${baseSlug}-${sellerIndex}`;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${sellerIndex}-${Math.random().toString(36).substring(2, 5)}`;
      }
      usedSlugs.add(slug);

      const loc = getRandomItem(CITIES);
      const contactName = `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
      const emailDomain = slugify(prefix + mid, { lower: true, strict: true });
      const email = `sales@${emailDomain}.com`;
      const phone = `+91 ${getRandomInt(90000, 99999)} ${getRandomInt(10000, 99999)}`;
      const gstin = generateGstin(loc.state);
      const rating = parseFloat((Math.random() * (4.9 - 4.3) + 4.3).toFixed(1));
      const totalRatings = getRandomInt(20, 240);
      const year = getRandomInt(1998, 2021);

      generatedSellers.push({
        name: companyName,
        slug,
        mainCategory: cat._id,
        categories: [cat._id],
        contactPerson: contactName,
        email,
        phone,
        city: loc.city,
        state: loc.state,
        address: getRandomItem(ADDRESSES),
        businessType: getRandomItem(BUSINESS_TYPES),
        yearEstablished: year,
        gstin,
        rating,
        totalRatings,
        isVerified: true,
        trustSeal: Math.random() > 0.15, // 85% trustSeal
        description: `Verified manufacturer, wholesaler, and bulk exporter of quality ${cat.name.toLowerCase()} products with modern manufacturing facilities and strict quality standards. Supplying to commercial buyers pan-India.`,
        isActive: true,
      });

      sellerIndex++;
    }
  }

  console.log(`Saving ${generatedSellers.length} sellers to database in batches...`);
  const insertedSellers = await Seller.insertMany(generatedSellers, { ordered: false });
  console.log(`Successfully created ${insertedSellers.length} verified sellers!`);

  // Now, assign existing products to these sellers matching their category!
  console.log('\nAssigning existing products to newly created sellers based on category...');

  // Map categoryId -> array of sellerIds
  const catToSellers = new Map();
  for (const s of insertedSellers) {
    const cId = s.mainCategory.toString();
    if (!catToSellers.has(cId)) catToSellers.set(cId, []);
    catToSellers.get(cId).push(s._id);
  }

  // Iterate categories and assign products evenly
  let totalAssigned = 0;
  for (const cat of categories) {
    const cId = cat._id.toString();
    const sellersForCat = catToSellers.get(cId) || [];
    if (sellersForCat.length === 0) continue;

    const productsInCat = await Product.find({ category: cat._id }).select('_id');
    if (productsInCat.length === 0) continue;

    const bulkOps = [];
    for (let pIdx = 0; pIdx < productsInCat.length; pIdx++) {
      const assignedSellerId = sellersForCat[pIdx % sellersForCat.length];
      bulkOps.push({
        updateOne: {
          filter: { _id: productsInCat[pIdx]._id },
          update: { $set: { seller: assignedSellerId } },
        },
      });
    }

    if (bulkOps.length > 0) {
      // Chunk bulkWrite by 1000 to keep within memory limits
      const CHUNK_SIZE = 1000;
      for (let k = 0; k < bulkOps.length; k += CHUNK_SIZE) {
        const slice = bulkOps.slice(k, k + CHUNK_SIZE);
        await Product.bulkWrite(slice, { ordered: false });
      }
      totalAssigned += productsInCat.length;
      console.log(`- ${cat.name}: Assigned ${productsInCat.length} products across ${sellersForCat.length} sellers.`);
    }
  }

  console.log(`\nDONE! All ${totalAssigned} products have been assigned to matching verified sellers.`);

  // Verification Summary
  const finalProductCount = await Product.countDocuments();
  const finalSellerCount = await Seller.countDocuments();
  console.log(`\nFinal Platform Stats:`);
  console.log(`Total Sellers in DB: ${finalSellerCount}`);
  console.log(`Total Products in DB: ${finalProductCount}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});

