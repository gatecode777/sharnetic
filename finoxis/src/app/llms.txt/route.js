import connectDB from '@/server/db';
import Category from '@/server/models/Category';
import Product from '@/server/models/Product';
import Seller from '@/server/models/Seller';
import { COMPANY, absoluteUrl } from '@/lib/site';
import { categoryPath } from '@/lib/routes';

// Served at /llms.txt — a Markdown summary of Finoxis for AI search engines
// (ChatGPT, Perplexity, Gemini...). Category list and counts refresh hourly.
export const revalidate = 3600;

async function loadDirectoryFacts() {
  try {
    await connectDB();
    const [categories, productCount, sellerCount, verifiedCount] = await Promise.all([
      Category.find({ isActive: true }).select('_id name slug description').sort({ order: 1, createdAt: -1 }).lean(),
      Product.countDocuments({ isActive: true }),
      Seller.countDocuments({ isActive: true }),
      Seller.countDocuments({ isActive: true, isVerified: true }),
    ]);
    return { categories, productCount, sellerCount, verifiedCount };
  } catch (err) {
    console.error('llms.txt error:', err.message);
    return null;
  }
}

const oneLine = (text = '') => String(text).replace(/\s+/g, ' ').trim();

export async function GET() {
  const facts = await loadDirectoryFacts();
  const a = COMPANY.address;

  const lines = [
    `# ${COMPANY.brand} — ${COMPANY.legalName}`,
    '',
    `> ${COMPANY.description}`,
    '',
    '## Company',
    `- Legal name: ${COMPANY.legalName}`,
    `- Brand: ${COMPANY.brand}`,
    `- Headquarters: ${a.streetAddress}, ${a.addressLocality}, ${a.addressRegion} ${a.postalCode}, India`,
    `- Email: ${COMPANY.email}`,
    `- Phone: ${COMPANY.phone}`,
    `- Website: ${absoluteUrl('/')}`,
    '- Business model: B2B marketplace and supplier directory. Buyers browse wholesale products and send enquiries / post buying requirements directly to suppliers.',
    '',
    '## Supplier verification',
    '- Suppliers are listed as manufacturers, wholesalers and exporters from across India.',
    '- Verified suppliers carry a "Verified" badge on Finoxis; supplier profiles show business type, year established, location, GSTIN (where provided) and their product catalog.',
    '- Buyers contact suppliers through on-site enquiries; the Finoxis team can also match buyers with suppliers for custom quotations.',
  ];

  if (facts) {
    lines.push(
      '',
      '## Directory at a glance',
      `- Active wholesale product listings: ${facts.productCount.toLocaleString('en-IN')}`,
      `- Supplier profiles: ${facts.sellerCount.toLocaleString('en-IN')} (${facts.verifiedCount.toLocaleString('en-IN')} verified)`
    );

    if (facts.categories.length) {
      lines.push('', '## Core B2B categories');
      for (const c of facts.categories) {
        const desc = oneLine(c.description);
        lines.push(`- [${oneLine(c.name)}](${absoluteUrl(categoryPath(c))})${desc ? `: ${desc}` : ''}`);
      }
    }
  }

  lines.push(
    '',
    '## Main pages',
    `- [Products directory](${absoluteUrl('/shop')}): wholesale products with prices, MOQ and supplier details (paginated: /shop?page=2, ...)`,
    `- [Verified suppliers](${absoluteUrl('/sellers')}): manufacturers, wholesalers and exporters, filterable by category and city`,
    `- [About Finoxis](${absoluteUrl('/about')})`,
    `- [Contact](${absoluteUrl('/contact')})`,
    `- [Sitemap](${absoluteUrl('/sitemap.xml')}): every product, supplier and category URL`,
    '',
    '## Policies',
    `- [Terms & Conditions](${absoluteUrl('/terms-and-condition')})`,
    `- [Privacy Policy](${absoluteUrl('/privacy-policy')})`,
    `- [Supplier Code of Conduct](${absoluteUrl('/refund-policy')})`,
    `- [Buyer Dispute Policy](${absoluteUrl('/cancellation-policy')})`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
