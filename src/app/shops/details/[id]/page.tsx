import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import ShopDetailPage from 'src/sections/shops/shop-detail';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Detail Shop | Dashboard - ${CONFIG.appName}` };
type Props = {
  params: { id: string };
};
export default function Page({ params }: Props) {
  return <ShopDetailPage id={params.id} />;
}
