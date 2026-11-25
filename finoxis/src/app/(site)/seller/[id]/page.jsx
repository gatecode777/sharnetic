import { permanentRedirect } from 'next/navigation';

// Old supplier URL. Suppliers now live at /sellers/<supplier-slug>.
export default async function Page({ params }) {
  const { id } = await params;
  permanentRedirect(`/sellers/${encodeURIComponent(id)}`);
}
