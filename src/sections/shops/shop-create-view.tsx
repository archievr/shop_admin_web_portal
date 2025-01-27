'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ShopNewEditForm } from './shop-new-edit-form';

// ----------------------------------------------------------------------
type Props = {
  id?: string;
};
export function ShopCreateView({ id }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`${id ? 'Edit' : 'Create'} Shop`}
        links={[{ name: 'Shops', href: paths.shops.list }, { name: id ? 'Edit Shop' : 'New Shop' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ShopNewEditForm id={id} />
    </DashboardContent>
  );
}
