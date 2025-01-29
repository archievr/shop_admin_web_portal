'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
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
  ImageList,
  ImageListItem,
} from '@mui/material';
import { toast } from 'sonner';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

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

type ShopImage = {
  id: string;
  image: string;
};

const mapContainerStyle = {
  width: '100%',
  height: '200px',
};

const ShopDetail: React.FC<ShopDetailProps> = ({ id }) => {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<ShopImage[]>([]);

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

    const fetchFiles = async () => {
      try {
        const response = await axiosInstance.get(endpoints.shop.gallery + `?shop=${id}`);
        setFiles(response.data?.results);
      } catch (error: any) {
        console.error('Error fetching files:', error);
        toast.error('Failed to load shop images.');
      }
    };

    fetchShopDetails();
    fetchFiles();
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

  const center =
    shop.latitude && shop.longitude ? { lat: shop.latitude, lng: shop.longitude } : undefined;

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
                  <>
                    <Typography>
                      Latitude: {shop.latitude}
                      <br />
                      Longitude: {shop.longitude}
                    </Typography>
                    <Box sx={{ mt: 2, height: 200, borderRadius: 1, overflow: 'hidden' }}>
                      <LoadScript
                        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
                      >
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={15}>
                          <Marker position={center} />
                        </GoogleMap>
                      </LoadScript>
                    </Box>
                  </>
                ) : (
                  <Typography>No location data available.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Shop Images Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Shop Images"
                sx={{ backgroundColor: '#f5f5f5', paddingBottom: 2 }}
              />
              <Divider />
              <CardContent>
                {files.length > 0 ? (
                  <ImageList sx={{ width: '100%', height: 450 }} cols={3} rowHeight={164}>
                    {files.map((item) => (
                      <ImageListItem key={item.id}>
                        <img
                          src={`${item.image}?w=164&h=164&fit=crop&auto=format`}
                          srcSet={`${item.image}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                          alt={`Shop image ${item.id}`}
                          loading="lazy"
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Typography>No images available for this shop.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
};

export default ShopDetail;
