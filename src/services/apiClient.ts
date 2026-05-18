import axios from 'axios';

/**
 * Base axios instance — no auth interceptor here.
 * Auth token is injected per-request via useApiClient() hook.
 * This file is safe to import in both server and client contexts.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('RESPONSE:', response.config.url);
    console.log('STATUS:', response.status);
    return response;
  },
  (error) => {
    console.log('API ERROR:', error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;
