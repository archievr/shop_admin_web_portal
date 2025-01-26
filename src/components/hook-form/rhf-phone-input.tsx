import React from 'react';
import { Control, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';

interface SaudiPhoneInputProps {
  control: Control<any>;
  error?: string;
  isGettingOtp: boolean;
  onGetOtp: () => void;
}

export function SaudiPhoneInput({ control, error, isGettingOtp, onGetOtp }: SaudiPhoneInputProps) {
  return (
    <Controller
      name="phone_number"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          fullWidth
          label="Phone Number"
          error={!!fieldState.error}
          helperText={fieldState.error?.message || error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={onGetOtp}
                  disabled={isGettingOtp || !field.value || !/^\+966[0-9]{9}$/.test(field.value)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {isGettingOtp ? 'Sending...' : 'Get OTP'}
                </Button>
              </InputAdornment>
            ),
          }}
          inputProps={{
            maxLength: 13,
          }}
          onChange={(e) => {
            let value = e.target.value.replace(/[^0-9+]/g, '');
            if (!value.startsWith('+966')) {
              value = '+966' + value.slice(3);
            }
            field.onChange(value);
          }}
        />
      )}
    />
  );
}
