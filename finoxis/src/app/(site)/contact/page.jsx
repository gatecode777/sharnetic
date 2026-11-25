import Contact from '@/views/Contact';
import JsonLd from '@/components/JsonLd';
import { CONTACT_FAQS } from '@/lib/faqs';

export const metadata = { title: 'Contact Us', alternates: { canonical: '/contact' } };

// FAQPage structured data, built from the same list the page displays.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CONTACT_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Contact />
    </>
  );
}
