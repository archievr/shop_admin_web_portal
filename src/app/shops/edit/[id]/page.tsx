import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { ShopCreateView } from 'src/sections/shops/shop-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit Shop | Dashboard - ${CONFIG.appName}` };
type Props = {
  params: { id: string };
};
export default function Page({ params }: Props) {
  return <ShopCreateView id={params.id} />;
}
