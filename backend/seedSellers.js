// backend/seedSellers.js
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Category = require('./models/Category');
const Seller = require('./models/Seller');
const Product = require('./models/Product');
const slugify = require('slugify');

const sellerDefinitions = {
  clothing: [
    {
      name: 'Apex Garments & Textiles Ltd.',
      contactPerson: 'Rajesh K. Sharma',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Plot 42, Sitapura Industrial Area, Tonk Road',
      businessType: 'Manufacturer & Wholesaler',
      yearEstablished: 2011,
      gstin: '08AABCA1234F1Z5',
      phone: '+91 98290 44211',
      email: 'sales@apexgarments.com',
      rating: 4.8,
      totalRatings: 94,
      isVerified: true,
      trustSeal: true,
      description: 'Leading manufacturer and bulk supplier of ethnic wear, casual apparel, sweater vests, and woven garments with ISO certified facilities.',
    },
    {
      name: 'Vardhman Apparels & Knitwear',
      contactPerson: 'Sunil Mehta',
      city: 'Surat',
      state: 'Gujarat',
      address: 'Shop 105-108, Millennium Textile Market, Ring Road',
      businessType: 'Exporter & Manufacturer',
      yearEstablished: 2014,
      gstin: '24AABCV5678K1Z2',
      phone: '+91 98791 22340',
      email: 'info@vardhmanapparels.com',
      rating: 4.7,
      totalRatings: 78,
      isVerified: true,
      trustSeal: true,
      description: 'Prime supplier of women apparel, designer pullovers, woollen sweaters, and seasonal fabrics catering to pan-India wholesalers.',
    },
  ],
  grocery: [
    {
      name: 'Shree Shyam Agro & Spices',
      contactPerson: 'Ghanshyam Agarwal',
      city: 'Jodhpur',
      state: 'Rajasthan',
      address: 'Krishi Upaj Mandi, Mandore Road',
      businessType: 'Wholesaler & Bulk Supplier',
      yearEstablished: 2008,
      gstin: '08AABCS9988D1Z9',
      phone: '+91 94140 88219',
      email: 'contact@shreeshyamagro.com',
      rating: 4.9,
      totalRatings: 112,
      isVerified: true,
      trustSeal: true,
      description: 'Wholesale distributor of premium food grains, whole wheat atta, spices, edible staples, and household grocery items for commercial retailers.',
    },
    {
      name: 'Kaveri Organic Foods & Commodities',
      contactPerson: 'Praveen Patel',
      city: 'Indore',
      state: 'Madhya Pradesh',
      address: 'Industrial Area Sector 3, Sanwer Road',
      businessType: 'Supplier & Processor',
      yearEstablished: 2016,
      gstin: '23AABCK3344J1Z8',
      phone: '+91 98930 77123',
      email: 'orders@kaveriorganics.in',
      rating: 4.6,
      totalRatings: 63,
      isVerified: true,
      trustSeal: true,
      description: 'Certified organic food processor and bulk supplier delivering healthy staples, pulses, oats, detergents, and daily essentials.',
    },
  ],
  beauty: [
    {
      name: 'Aura Herbal Cosmeceuticals',
      contactPerson: 'Dr. Ananya Joshi',
      city: 'Ahmedabad',
      state: 'Gujarat',
      address: 'GIDC Industrial Estate, Vatva',
      businessType: 'Third-Party & OEM Manufacturer',
      yearEstablished: 2015,
      gstin: '24AABCA7766M1Z1',
      phone: '+91 99090 33881',
      email: 'b2b@auraherbal.com',
      rating: 4.7,
      totalRatings: 86,
      isVerified: true,
      trustSeal: true,
      description: 'GMP certified cosmetic manufacturer specializing in organic skincare, herbal bath bars, cosmetic serums, and personal hygiene products.',
    },
    {
      name: 'Naturale Essence Laboratories',
      contactPerson: 'Vikram Malhotra',
      city: 'New Delhi',
      state: 'Delhi',
      address: 'Okhla Industrial Area Phase 2',
      businessType: 'Wholesaler & Exporter',
      yearEstablished: 2013,
      gstin: '07AABCN1290L1Z4',
      phone: '+91 98110 55672',
      email: 'sales@naturaleessence.com',
      rating: 4.8,
      totalRatings: 91,
      isVerified: true,
      trustSeal: true,
      description: 'Bulk supplier of premium beauty essentials, natural skincare oils, salon supplies, and cosmetic retail packaging.',
    },
  ],
  accessories: [
    {
      name: 'Royal Gems & Fashion Accessories',
      contactPerson: 'Mahesh Singhal',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Johari Bazar, Heritage City Zone',
      businessType: 'Manufacturer & Exporter',
      yearEstablished: 2010,
      gstin: '08AABCR4455C1Z3',
      phone: '+91 98280 66554',
      email: 'export@royalgemsindia.com',
      rating: 4.9,
      totalRatings: 120,
      isVerified: true,
      trustSeal: true,
      description: 'Renowned manufacturer of fashion accessories, digital clocks, ethnic jewelry, and lifestyle products for domestic & international bulk buyers.',
    },
    {
      name: 'Metro Hub Tech & Lifestyle Accessories',
      contactPerson: 'Kunal Shah',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Lamington Road, Grant Road East',
      businessType: 'Wholesaler & Importer',
      yearEstablished: 2017,
      gstin: '27AABCM8899N1Z6',
      phone: '+91 98200 44332',
      email: 'wholesale@metrohub.in',
      rating: 4.6,
      totalRatings: 54,
      isVerified: true,
      trustSeal: true,
      description: 'Distributor of smart accessories, foldable mobile holders, digital displays, and utility gadget peripherals for wholesale resellers.',
    },
  ],
  'home-decor': [
    {
      name: 'DecoVibe Handicrafts & Woodworks',
      contactPerson: 'Bhawani Singh Rathore',
      city: 'Jodhpur',
      state: 'Rajasthan',
      address: 'Boranada SEZ Industrial Park',
      businessType: 'Manufacturer & Wholesaler',
      yearEstablished: 2009,
      gstin: '08AABCD3322E1Z7',
      phone: '+91 94141 77889',
      email: 'crafts@decovibe.com',
      rating: 4.9,
      totalRatings: 104,
      isVerified: true,
      trustSeal: true,
      description: 'Artisan-backed manufacturer of authentic wooden crafts, wall clocks, carved artefacts, and vintage handcrafted interior decor.',
    },
    {
      name: 'Elegance Living Furnishings',
      contactPerson: 'Pooja Choudhary',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Mansarovar Industrial Area, RIICO',
      businessType: 'Supplier & Wholesaler',
      yearEstablished: 2016,
      gstin: '08AABCE1122G1Z0',
      phone: '+91 97840 22119',
      email: 'support@eleganceliving.in',
      rating: 4.7,
      totalRatings: 68,
      isVerified: true,
      trustSeal: true,
      description: 'Modern home decor, table accents, and ambient lighting wholesale supplier catering to interior designers and hospitality procurement.',
    },
  ],
};

const seed = async () => {
  try {
    await connectDB();
    console.log('Fetching all categories...');
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories.`);

    const categoryMap = {};
    for (const cat of categories) {
      categoryMap[cat.slug] = cat;
    }

    const createdSellers = [];
    const sellersByCategory = {};

    for (const [catSlug, sellersList] of Object.entries(sellerDefinitions)) {
      const category = categoryMap[catSlug];
      if (!category) {
        console.warn(`Category slug '${catSlug}' not found in DB! Skipping...`);
        continue;
      }

      sellersByCategory[category._id.toString()] = [];

      for (const sellerData of sellersList) {
        let slug = slugify(sellerData.name, { lower: true, strict: true });
        
        // Check if exists
        let seller = await Seller.findOne({ slug });
        if (!seller) {
          seller = new Seller({
            ...sellerData,
            slug,
            mainCategory: category._id,
            categories: [category._id],
          });
          await seller.save();
          console.log(`Created Seller: ${seller.name} -> Assigned Main Category: ${category.name}`);
        } else {
          // Update mainCategory
          seller.mainCategory = category._id;
          seller.categories = [category._id];
          Object.assign(seller, sellerData);
          await seller.save();
          console.log(`Updated Seller: ${seller.name} -> Main Category: ${category.name}`);
        }

        createdSellers.push(seller);
        sellersByCategory[category._id.toString()].push(seller);
      }
    }

    // Default fallback seller if any product has unmatched category
    const defaultSeller = createdSellers[0];

    console.log('\nAssigning sellers and B2B fields to all products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update.`);

    let updatedCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const catId = product.category?.toString();
      const catSellers = sellersByCategory[catId] || [defaultSeller];

      // Round robin among sellers of this category
      const assignedSeller = catSellers[i % catSellers.length] || defaultSeller;

      product.seller = assignedSeller._id;
      
      // Assign B2B MOQ and units
      if (!product.moq) {
        const catSlug = product.category ? (categoryMap[product.category.toString()]?.slug || '') : '';
        if (catSlug === 'grocery') {
          product.moq = '25 Kg / Packets';
          product.unit = 'Packet';
        } else if (catSlug === 'beauty') {
          product.moq = '20 Pieces';
          product.unit = 'Piece';
        } else {
          product.moq = '10 Pieces';
          product.unit = 'Piece';
        }
      }

      await product.save();
      updatedCount++;
    }

    console.log(`\n✅ Successfully assigned sellers to ${updatedCount} products!`);
    console.log(`✅ Total active sellers in DB: ${createdSellers.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();

