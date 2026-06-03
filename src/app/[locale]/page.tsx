import { getSettings } from '@/lib/settings';
import HomeClient from '@/components/home-client';

export const revalidate = 60; // Revalidate every 60 seconds to catch DB setting changes

export default async function Home() {
  const settings = await getSettings();
  return <HomeClient settings={settings} />;
}
