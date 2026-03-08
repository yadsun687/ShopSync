import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Request interceptor — log each request
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor — retry on network error or 5xx
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config._retryCount) {
      config._retryCount = 0;
    }

    const isRetryable =
      !error.response || (error.response.status >= 500 && error.response.status < 600);

    if (isRetryable && config._retryCount < 3) {
      config._retryCount += 1;
      const delay = config._retryCount * 1000;
      console.log(`Retrying... (attempt ${config._retryCount})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
