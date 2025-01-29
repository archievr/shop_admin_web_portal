'use client';

import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';
import { SignUpTerms } from '../../components/sign-up-terms';
import { authApi } from 'src/services/api';
import { SaudiPhoneInput } from 'src/components/hook-form/rhf-phone-input';

// ----------------------------------------------------------------------

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod.object({
  username: zod.string().min(1, { message: 'Username is required!' }),
  company_name: zod.string().min(1, { message: 'Company name is required!' }),
  name: zod.string().min(1, { message: 'Name is required!' }),
  phone_number: zod.string().regex(/^\+966[0-9]{9}$/, { message: 'Invalid Saudi phone number' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
  otp: zod.string().min(1, { message: 'OTP is required!' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const showPassword = useBoolean();
  const [isGettingOtp, setIsGettingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues: SignUpSchemaType = {
    username: '',
    company_name: '',
    name: '',
    phone_number: '+966',
    password: '',
    otp: '',
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    watch,
    trigger,
    clearErrors,
  } = methods;

  const phoneNumber = watch('phone_number');

  useEffect(() => {
    if (phoneNumber) {
      clearErrors('phone_number');
      setErrorMessage(null);
    }
  }, [phoneNumber, clearErrors]);

  const handleGetOtp = async () => {
    if (!phoneNumber || !/^\+966[0-9]{9}$/.test(phoneNumber)) {
      setErrorMessage('Please enter a valid Saudi phone number');
      return;
    }

    try {
      setIsGettingOtp(true);
      await authApi.getOtp({ phone_number: phoneNumber, type: 'register' });
      setSuccessMessage('OTP sent successfully!');
      setErrorMessage(null);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.response?.data?.message || 'Failed to send OTP');
      setSuccessMessage(null);
    } finally {
      setIsGettingOtp(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await authApi.signUp(data);

      if (response.token) {
        localStorage.setItem('accessToken', response.token);
      }

      router.push(paths.auth.jwt.signIn);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.response?.data?.message || 'Something went wrong');
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="username" label="Username" slotProps={{ inputLabel: { shrink: true } }} />

      <Field.Text
        name="company_name"
        label="Company Name"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text name="name" label="Full Name" slotProps={{ inputLabel: { shrink: true } }} />

      <SaudiPhoneInput
        control={control}
        error={errors.phone_number?.message}
        isGettingOtp={isGettingOtp}
        onGetOtp={handleGetOtp}
        isOtp={true}
        fieldName="phone_number"
      />

      <Field.Text
        name="password"
        label="Password"
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Field.Text name="otp" label="OTP" slotProps={{ inputLabel: { shrink: true } }} />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Creating account..."
      >
        Create account
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Get started absolutely free"
        description={
          <>
            {`Already have an account? `}
            <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
              Sign in
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {!!successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <SignUpTerms />
    </>
  );
}
