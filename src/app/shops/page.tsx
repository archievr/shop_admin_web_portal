import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';
import { ShopsListview } from 'src/sections/shops/shop-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Shop List - ${CONFIG.appName}` };

export default function Page() {
  return <ShopsListview />;
}
