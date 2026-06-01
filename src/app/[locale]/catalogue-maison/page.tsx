import { getSettings } from '@/lib/settings';
import OwnerCataloguePage from '@/components/owner-catalogue-page';

export default async function CatalogueMaisonPage() {
  const settings = await getSettings();
  return <OwnerCataloguePage settings={settings} />;
}
