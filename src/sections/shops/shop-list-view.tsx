'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type {
  GridColDef,
  GridSlotProps,
  GridRowSelectionModel,
  GridActionsCellItemProps,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import { toast } from 'sonner';

import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { useState, useEffect, forwardRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/lib/axios';
import type { IShop } from './types';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
// import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export function ShopsListview() {
  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState<IShop[]>([]);
  const [shopsLoading, setShopsLoading] = useState<boolean>(false);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const [shopToDelete, setShopToDelete] = useState<string | null>(null);

  const filters = useSetState<any>({ publish: [], stock: [] });
  const { state: currentFilters } = filters;

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

  const canReset = currentFilters.publish.length > 0 || currentFilters.stock.length > 0;

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters: currentFilters,
  });

  const handleDeleteRow = useCallback(async () => {
    if (shopToDelete) {
      try {
        const res = await axiosInstance.delete(endpoints.shop.delete + shopToDelete + '/');

        toast.success('Shop deleted successfully!');
        getShopData();
      } catch (error) {
        toast.error('Failed to delete shop.');

        console.error('Error during delete shop:', error);
        throw error;
      }

      setShopToDelete(null);
    }
  }, [tableData, shopToDelete]);

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={dataFiltered.length}
        onOpenConfirmDeleteRows={confirmDialog.onTrue}
        onDeleteRow={handleDeleteRow}
      />
    ),
    [currentFilters, selectedRowIds, handleDeleteRow]
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      hideable: false,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      hideable: true,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: 'contact_number',
      headerName: 'Contact Number',
      flex: 1,
      minWidth: 200,
      hideable: true,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 200,
      hideable: true,
      renderCell: (params) => <div>{params.value}</div>,
    },

    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsLinkItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          // href={'#'}
          href={paths.shops.detail(params.row.id)}
        />,
        <GridActionsLinkItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          href={paths.shops.edit(params.row.id)}
          // href={'#'}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => {
            setShopToDelete(params.row.id);
            confirmDialog.onTrue();
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={<>Are you sure you want to delete this shop?</>}
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRow();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  const getShopData = async () => {
    setShopsLoading(true);
    try {
      const res = await axiosInstance.get(endpoints.shop.list);
      setTableData(res.data?.results);
    } catch (error) {
      throw error;
    } finally {
      setShopsLoading(false);
    }
  };

  useEffect(() => {
    getShopData();
  }, []);
  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Shops List"
          links={[{ name: 'Shops', href: paths.shops.list }, { name: 'List' }]}
          action={
            <Button
              component={RouterLink}
              href={paths.shops.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Shop
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            maxHeight: 'auto',
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: { xs: 800, md: '1px' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            // checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={shopsLoading}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: CustomToolbarCallback,
              noRowsOverlay: () => <></>,
              noResultsOverlay: () => <></>,
            }}
            slotProps={{
              toolbar: { setFilterButtonEl },
              panel: { anchorEl: filterButtonEl },
              columnsManagement: { getTogglableColumns },
            }}
            sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setFilterButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
    onDeleteRow: () => void;
  }
}

type CustomToolbarProps = GridSlotProps['toolbar'] & {
  canReset: boolean;
  filteredResults: number;
  selectedRowIds: GridRowSelectionModel;
  filters: UseSetStateReturn<any>;

  onOpenConfirmDeleteRows: () => void;
  onDeleteRow: () => void;
};

function CustomToolbar({
  selectedRowIds,
  setFilterButtonEl,
  onOpenConfirmDeleteRows,
  onDeleteRow,
}: CustomToolbarProps) {
  return (
    <>
      <GridToolbarContainer>
        <GridToolbarQuickFilter />

        <Box
          sx={{
            gap: 1,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => {
                onOpenConfirmDeleteRows();
                onDeleteRow();
              }}
            >
              Delete ({selectedRowIds.length})
            </Button>
          )}

          <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
          <GridToolbarExport />
        </Box>
      </GridToolbarContainer>
    </>
  );
}

// ----------------------------------------------------------------------

type GridActionsLinkItemProps = Pick<GridActionsCellItemProps, 'icon' | 'label' | 'showInMenu'> & {
  href: string;
  sx?: SxProps<Theme>;
};

export const GridActionsLinkItem = forwardRef<HTMLLIElement, GridActionsLinkItemProps>(
  (props, ref) => {
    const { href, label, icon, sx } = props;

    return (
      <MenuItem ref={ref} sx={sx}>
        <Link
          component={RouterLink}
          href={href}
          underline="none"
          color="inherit"
          sx={{ width: 1, display: 'flex', alignItems: 'center' }}
        >
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          {label}
        </Link>
      </MenuItem>
    );
  }
);

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: any[];
  filters: any;
};

function applyFilter({ inputData, filters }: ApplyFilterProps) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}
