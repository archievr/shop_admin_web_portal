import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  signUp: async (data: {
    username: string;
    company_name: string;
    name: string;
    phone_number: string;
    password: string;
    otp: string;
  }) => {
    const response = await api.post('/company/register/', data);
    return response.data;
  },

  signIn: async (data: { username: string; password: string }) => {
    const response = await api.post('/auth/login/', data);
    return response.data;
  },

  getOtp: async (data: { phone_number: string; type: string }) => {
    const response = await api.get('/auth/get-otp/', {
      params: {
        phone_number: data.phone_number,
        otp_type: data.type,
      },
    });
    return response.data;
  },
};
