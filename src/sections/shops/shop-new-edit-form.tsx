import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Form, Field } from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useRouter } from 'src/routes/hooks';

// Define schema for form validation
const ShopFormSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' })
    .max(500, { message: 'Description must be less than 500 characters.' }),
  note: zod.string().optional(),
  contact_number: zod
    .string()
    .regex(/^\d+$/, { message: 'Contact number must contain only digits.' })
    .min(4, { message: 'Contact number must be at least 4 digits.' }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  latitude: zod
    .number({ coerce: true })
    .nullable()
    .optional()
    .refine((value: any) => value === null || (value >= -90 && value <= 90), {
      message: 'Latitude must be between -90 and 90.',
    }),
  longitude: zod
    .number({ coerce: true })
    .nullable()
    .optional()
    .refine((value: any) => value === null || (value >= -180 && value <= 180), {
      message: 'Longitude must be between -180 and 180.',
    }),
});

// Define TypeScript type for form data
type ShopFormSchemaType = zod.infer<typeof ShopFormSchema>;

type Props = {
  id?: string;
};

export const ShopNewEditForm: React.FC<Props> = ({ id }) => {
  const methods = useForm<ShopFormSchemaType>({
    resolver: zodResolver(ShopFormSchema),
    defaultValues: {
      name: '',
      description: '',
      note: '',
      contact_number: '',
      address: '',
      latitude: null,
      longitude: null,
    },
  });

  const {
    reset, // Allows resetting form values
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const router = useRouter();

  useEffect(() => {
    if (id) {
      // Fetch existing shop data for editing
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(`${endpoints.shop.details}${id}`);
          reset(response.data); // Populate form with the fetched data
        } catch (error) {
          console.error('Error fetching shop data:', error);
          toast.error('Failed to load shop data.');
        }
      };

      fetchData();
    }
  }, [id, reset]);

  // Handle form submission
  const onSubmit = handleSubmit(async (data: ShopFormSchemaType) => {
    try {
      if (id) {
        // Editing logic: Use PUT method
        const response = await axiosInstance.patch(`${endpoints.shop.update}${id}/`, data);
        toast.success('Shop updated successfully!');
      } else {
        // Creation logic: Use POST method
        const response = await axiosInstance.post(endpoints.shop.create, data);
        toast.success('Shop created successfully!');
      }
      // Redirect or perform further actions
      router.push('/shops');
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error('Something went wrong!');
    }
  });

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
            <Field.Text name="contact_number" label="Contact Number" />
            <Field.Text name="address" label="Address" />
            <Field.Text name="latitude" label="Latitude" type="number" />
            <Field.Text name="longitude" label="Longitude" type="number" />
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
