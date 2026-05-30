import { getSettings } from '@/lib/settings';
import HomeClient from '@/components/home-client';

export default async function Home() {
  const settings = await getSettings();
  return <HomeClient settings={settings} />;
}
