import axios from "axios";
import { notification } from "antd";

// Create an axios instance with default config

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle different error statuses
    if (response) {
      switch (response.status) {
        case 400:
          notification.error({
            message: "Bad Request",
            description:
              response.data?.errors?.length > 0
                ? response.data.errors.join(", ")
                : response.data?.message || "Invalid request",
          });
          break;

        case 401:
          notification.error({
            message: "Unauthorized",
            description:
              response.data?.errors?.length > 0
                ? response.data.errors.join(", ")
                : response.data?.message ||
                  "Your session has expired. Please log in again.",
          });
          
          // Clear auth data and redirect to login
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          break;


          case 403:
          notification.error({
            message: "Forbidden",
            description:
              response.data?.errors?.length > 0
                ? response.data.errors.join(", ")
                : response.data?.message || "You do not have permission to access this resource.",
          });
          break;

          case 404:
          notification.error({
            message: "Not Found",
            description:
              response.data?.errors?.length > 0
                ? response.data.errors.join(", ")
                : response.data?.message || "The requested resource was not found.",
          });
          break;

          case 500:
          notification.error({
            message: "Server Error",
            description:
              response.data?.errors?.length > 0
                ? response.data.errors.join(", ")
                : response.data?.message || "Something went wrong with internal server. Please try again later.",
          });
          break;

        default:
          notification.error({
            message: "Error",
            description: response.data.message || "Something went wrong.",
          });
      }
    } else {
      // Network error
      notification.error({
        message: "Network Error",
        description: "Please check your internet connection and try again.",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
