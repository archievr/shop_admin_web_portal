import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ShopCreateView } from 'src/sections/shops/shop-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create a new Shop | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ShopCreateView />;
}
