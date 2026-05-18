'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * useApiClient — React hook that returns an authenticated axios call helper.
 * Usage:
 *   const api = useApiClient();
 *   const data = await api.get('/instagram/accounts');
 */
export function useApiClient() {
  const { getToken } = useAuth();

  const request = useCallback(
    async <T = any>(config: AxiosRequestConfig): Promise<T> => {
      const token = await getToken();
      console.log('REQUEST:', config.url);
      console.log('HEADERS:', { Authorization: `Bearer ${token ? token.slice(0, 20) + '...' : 'none'}` });
      const response = await axios({
        ...config,
        url: `${BASE_URL}${config.url}`,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...config.headers,
        },
      });
      return response.data;
    },
    [getToken]
  );

  return {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'GET', url }),
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'POST', url, data }),
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'PATCH', url, data }),
    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
      request<T>({ ...config, method: 'DELETE', url }),
  };
}
