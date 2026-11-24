import ProfilePage from '@/views/Profile';

export const metadata = { title: 'My Profile', robots: { index: false, follow: false } };

export default function Page() {
  return <ProfilePage />;
}
