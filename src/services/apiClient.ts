import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Auth Token
apiClient.interceptors.request.use(
  async (config) => {
    // Note: In Next.js with Clerk, we usually get the token in the component/hook 
    // and pass it or use a custom hook that wraps axios.
    // This is a placeholder for global logic if needed.
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    console.error('[API Error]:', message);
    
    if (error.response?.status === 401) {
      // Handle unauthorized (redirect to login)
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
