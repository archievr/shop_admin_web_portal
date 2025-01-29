import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import { Form, Field } from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useRouter } from 'src/routes/hooks';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { SaudiPhoneInput } from 'src/components/hook-form/rhf-phone-input';
import { IconButton, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

const ShopFormSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' })
    .max(500, { message: 'Description must be less than 500 characters.' }),
  note: zod.string().optional(),
  contact_number: zod
    .string()
    .regex(/^\+966\d{9}$/, { message: 'Invalid Saudi phone number. Format: +966xxxxxxxxx' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  latitude: zod
    .number()
    .nullable()
    .refine((value) => value === null || (value >= -90 && value <= 90), {
      message: 'Latitude must be between -90 and 90.',
    }),
  longitude: zod
    .number()
    .nullable()
    .refine((value) => value === null || (value >= -180 && value <= 180), {
      message: 'Longitude must be between -180 and 180.',
    }),
  avatar_image: zod
    .union([
      zod.string(),
      zod.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
        message: 'Avatar must be less than 5MB',
      }),
    ])
    .optional(),
  cover_image: zod
    .union([
      zod.string(),
      zod.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, {
        message: 'Cover photo must be less than 10MB',
      }),
    ])
    .optional(),
});

type ShopFormSchemaType = zod.infer<typeof ShopFormSchema>;

type Props = {
  id?: string;
};

const libraries: ('places' | 'geometry')[] = ['places', 'geometry'];

export const ShopNewEditForm: React.FC<Props> = ({ id }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [files, setFiles] = useState<Array<{ id: string; image: string }>>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);

  const methods = useForm<ShopFormSchemaType>({
    resolver: zodResolver(ShopFormSchema),
    defaultValues: {
      name: '',
      description: '',
      note: '',
      contact_number: '+966',
      address: '',
      latitude: null,
      longitude: null,
      avatar_image: undefined,
      cover_image: undefined,
    },
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !geocoder) {
      setGeocoder(new google.maps.Geocoder());
    }
  }, [isLoaded, geocoder]);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(`${endpoints.shop.details}${id}`);
          const shopData = response.data;
          reset({
            ...shopData,
            avatar_image: shopData.avatar_image || undefined,
            cover_image: shopData.cover_image || undefined,
          });
          if (shopData.avatar_image) {
            setAvatarPreview(shopData.avatar_image);
          }
          if (shopData.cover_image) {
            setCoverPhotoPreview(shopData.cover_image);
          }
        } catch (error: any) {
          console.error('Error fetching shop data:', error);
          toast.error('Failed to load shop data.');
        }
      };

      fetchData();
      fetchFiles();
    }
  }, [id, reset]);

  const onSubmit = handleSubmit(async (data: ShopFormSchemaType) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      if (id) {
        await axiosInstance.patch(`${endpoints.shop.update}${id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Shop updated successfully!');
      } else {
        await axiosInstance.post(endpoints.shop.create, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Shop created successfully!');
      }
      router.push('/shops');
    } catch (error: any) {
      console.error('Submission Error:', error);
      toast.error('Something went wrong!');
    }
  });

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setValue('address', place.formatted_address || '');
      setValue('latitude', place.geometry?.location?.lat() || null);
      setValue('longitude', place.geometry?.location?.lng() || null);
    }
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setValue('latitude', lat);
          setValue('longitude', lng);

          if (geocoder) {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                setValue('address', results[0].formatted_address);
                toast.success('Current location and address fetched successfully!');
              } else {
                toast.error("Couldn't fetch address for the current location.");
              }
            });
          } else {
            toast.error('Geocoder is not initialized.');
          }
        },
        (error) => {
          console.error('Error fetching location:', error);
          toast.error('Failed to fetch current location.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('shop', id as string);

    try {
      await axiosInstance.post(endpoints.shop.gallery, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Image uploaded successfully!');
      fetchFiles(); // Refresh the file list
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image.');
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await axiosInstance.delete(`${endpoints.shop.gallery}${fileId}/`);
      toast.success('Image deleted successfully!');
      fetchFiles(); // Refresh the file list
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete image.');
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('avatar_image', file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('cover_image', file);
      setCoverPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ maxWidth: 600, mx: 'auto' }}>
        <Card>
          <CardHeader title={id ? 'Edit Shop' : 'New Shop'} sx={{ mb: 3 }} />
          <Divider />
          <Stack spacing={3} sx={{ p: 3 }}>
            <Field.Text name="name" label="Name" />
            <Field.Text name="description" label="Description" multiline rows={4} />
            <Field.Editor name="note" />
            <SaudiPhoneInput
              control={control}
              error={errors.contact_number?.message}
              fieldName="contact_number"
            />

            <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
              <Field.Text name="address" label="Address" />
            </Autocomplete>
            <Stack direction="row" spacing={2}>
              <Field.Text name="latitude" label="Latitude" type="number" />
              <Field.Text name="longitude" label="Longitude" type="number" />
              <Button variant="outlined" onClick={fetchCurrentLocation}>
                Fetch
              </Button>
            </Stack>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Avatar
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Button variant="contained" component="span">
                  {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                </Button>
              </label>
              {avatarPreview && (
                <Box mt={2}>
                  <img
                    src={avatarPreview || '/placeholder.svg'}
                    alt="Avatar Preview"
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                </Box>
              )}
              {errors.avatar_image && (
                <Typography color="error">{errors.avatar_image.message}</Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Cover Photo
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="cover-photo-upload"
                type="file"
                onChange={handleCoverPhotoChange}
              />
              <label htmlFor="cover-photo-upload">
                <Button variant="contained" component="span">
                  {coverPhotoPreview ? 'Change Cover Photo' : 'Upload Cover Photo'}
                </Button>
              </label>
              {coverPhotoPreview && (
                <Box mt={2}>
                  <img
                    src={coverPhotoPreview || '/placeholder.svg'}
                    alt="Cover Photo Preview"
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                </Box>
              )}
              {errors.cover_image && (
                <Typography color="error">{errors.cover_image.message}</Typography>
              )}
            </Box>

            {id && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Shop Images
                  </Typography>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="raised-button-file">
                    <Button variant="contained" component="span">
                      Upload Image
                    </Button>
                  </label>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {files.map((file) => (
                      <Box key={file.id} sx={{ position: 'relative' }}>
                        <img
                          src={file.image || '/placeholder.svg'}
                          alt="Shop"
                          style={{ width: 100, height: 100, objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'background.paper',
                          }}
                          size="small"
                          onClick={() => handleFileDelete(file.id)}
                        >
                          <Iconify width={16} icon="eva:backspace-outline" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Stack>
        </Card>
        <Box sx={{ textAlign: 'end' }}>
          <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
            {id ? 'Update' : 'Submit'}
          </LoadingButton>
        </Box>
      </Stack>
    </Form>
  );
};
