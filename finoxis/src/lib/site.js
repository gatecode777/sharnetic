// Public site + company facts, shared by metadata, JSON-LD, robots.txt, sitemap.xml and llms.txt.
// Override the domain with NEXT_PUBLIC_SITE_URL (e.g. for a staging deploy).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.finoxis.org').replace(/\/+$/, '');

export const COMPANY = {
  brand: 'Finoxis',
  legalName: 'FINOXIS TECHNOLOGIES PRIVATE LIMITED',
  description:
    'Finoxis is an Indian B2B marketplace and verified manufacturers directory connecting buyers with verified manufacturers, wholesalers and exporters across India.',
  email: 'info@finoxis.in',
  phone: '+91-80009-05713',
  address: {
    streetAddress: 'Shop No. 4, Narottampura, Sanganer',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302026',
    addressCountry: 'IN',
  },
  logo: '/finoxis_logo.png',
};

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/** Organization + WebSite (with site search) JSON-LD, used on the homepage and /about. */
export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: COMPANY.legalName,
  alternateName: COMPANY.brand,
  url: SITE_URL,
  logo: absoluteUrl(COMPANY.logo),
  description: COMPANY.description,
  email: COMPANY.email,
  telephone: COMPANY.phone,
  address: { '@type': 'PostalAddress', ...COMPANY.address },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: COMPANY.phone,
    email: COMPANY.email,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: COMPANY.brand,
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});
