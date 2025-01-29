'use client';

import axios, { endpoints } from 'src/lib/axios';
import { setSession } from './utils';
import { JWT_STORAGE_KEY, REFRESH_TOKEN_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  username: string; // Changed from email to username
  password: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ username, password }: SignInParams): Promise<void> => {
  try {
    const params = { username, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { access, refresh } = res.data;

    if (!access || !refresh) {
      throw new Error('Tokens not found in response');
    }

    // Store both tokens and user data
    setSession(access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    // localStorage.setItem('user', JSON.stringify(user));
  } catch (error: any) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem('user');
  } catch (error: any) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

/** **************************************
 * Refresh Token
 *************************************** */
export const refreshAccessToken = async (): Promise<string> => {
  try {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refresh) {
      throw new Error('No refresh token found');
    }

    const res = await axios.post(endpoints.auth.refreshToken, {
      refresh,
    });

    const { access: newAccessToken } = res.data;

    if (!newAccessToken) {
      throw new Error('New access token not found in response');
    }

    setSession(newAccessToken);
    return newAccessToken;
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    // Clear all auth data on refresh token failure
    await signOut();
    throw error;
  }
};
