import About from '@/views/About';
import JsonLd from '@/components/JsonLd';
import { getActiveProductCount } from '@/server/pageData';
import { organizationJsonLd } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us',
  description:
    'About FINOXIS TECHNOLOGIES PRIVATE LIMITED, Jaipur — the B2B marketplace connecting buyers with verified Indian manufacturers, wholesalers and exporters.',
  alternates: { canonical: '/about' },
};

export default async function Page() {
  const productCount = await getActiveProductCount();
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <About initialProductCount={productCount} />
    </>
  );
}
