'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance, { endpoints } from 'src/lib/axios';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { toast } from 'sonner';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

type ShopDetailProps = {
  id: string;
};

type ShopData = {
  name: string;
  description: string;
  note?: string;
  contact_number: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

const ShopDetail: React.FC<ShopDetailProps> = ({ id }) => {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await axiosInstance.get(`${endpoints.shop.details}${id}`);
        setShop(response.data);
      } catch (err) {
        setError('Failed to fetch shop details. Please try again.');
        toast.error('Failed to fetch shop details.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`Details Shop`}
        links={[{ name: 'Shops', href: paths.shops.list }, { name: 'Details' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Shop Details Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title="Shop Details"
                sx={{ backgroundColor: '#f5f5f5', paddingBottom: 2 }}
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Name:</Typography>
                  <Typography>{shop.name}</Typography>

                  <Typography variant="h6">Description:</Typography>
                  <Typography>{shop.description}</Typography>

                  <Typography variant="h6">Contact Number:</Typography>
                  <Typography>{shop.contact_number}</Typography>

                  <Typography variant="h6">Address:</Typography>
                  <Typography>{shop.address}</Typography>
                  {shop.note && (
                    <>
                      <Typography variant="h6">Note:</Typography>
                      <div dangerouslySetInnerHTML={{ __html: shop.note }} style={{ margin: 0 }} />
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Map or Coordinates Section */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Location" sx={{ backgroundColor: '#f5f5f5', paddingBottom: 2 }} />
              <Divider />
              <CardContent>
                {shop.latitude && shop.longitude ? (
                  <Typography>
                    Latitude: {shop.latitude}
                    <br />
                    Longitude: {shop.longitude}
                  </Typography>
                ) : (
                  <Typography>No location data available.</Typography>
                )}
                <Box
                  sx={{
                    mt: 2,
                    height: 200,
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 1,
                  }}
                >
                  <Typography>Map Placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
};

export default ShopDetail;
