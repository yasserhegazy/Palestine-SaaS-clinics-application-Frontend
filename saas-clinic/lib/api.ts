import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

type TokenResolver = () => string | undefined;

const createApiClient = (tokenResolver?: TokenResolver): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: false, // We're using Authorization header, not cookies
    timeout: 10000, // 10 second timeout
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenResolver?.();

      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        const errorData = error.response.data;

        // Don't log expected errors (422, 403, 429) - they're handled by the UI

        // Handle 401 Unauthorized - token expired or invalid
        if (status === 401 && typeof window !== 'undefined') {
          Cookies.remove('auth_token');
          Cookies.remove('user_data');

          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        // Handle 403 Forbidden - don't log, let UI handle it
        // Handle 429 Too Many Requests - don't log, let UI handle it

        // Handle 500/502/503 Server Errors
        if (status >= 500) {
          console.error('Server error:', status);
          error.message = `Server error (${status}). Please contact support or try again later.`;
        }

        // Handle 422 Validation Errors - don't log, let UI handle it
      } else if (error.request) {
        // Request made but no response received
        console.error(
          'Network error: Cannot connect to backend API at',
          API_BASE_URL
        );
        console.error(
          'Please ensure your backend server is running on port 8000'
        );
        error.message =
          'Cannot connect to server. Please ensure the backend API is running.';
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const browserTokenResolver: TokenResolver = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return Cookies.get('auth_token');
};

const apiClient = createApiClient(browserTokenResolver);

export const createServerApiClient = (token?: string): AxiosInstance => {
  if (!token) {
    return createApiClient();
  }

  return createApiClient(() => token);
};

export default apiClient;

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  VERIFY_TOKEN: "/auth/verify",
  REFRESH_TOKEN: "/auth/refresh",
  PROFILE: "/auth/profile",
} as const;
