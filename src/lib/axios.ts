import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    signIn: '/auth/api/token/',
    signUp: '/company/register/',
    refreshToken: '/auth/api/token/refresh/',
    me: '/auth/api/me/',
  },
  shop: {
    list: '/shops/shops/',
    update: '/shops/shops/',
    create: '/shops/shops/',
    details: '/shops/shops/',
    delete: '/shops/shops/',
    edit: '/shops/shops/',
  },
};
