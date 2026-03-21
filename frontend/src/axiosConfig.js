import axios from "axios";

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8080/api' 
  : 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if it's specifically a token expiration
    // Don't redirect on other 401 errors that might be temporary
    if (error.response?.status === 401 && error.response?.data?.detail === "Given token not valid for any token type") {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
