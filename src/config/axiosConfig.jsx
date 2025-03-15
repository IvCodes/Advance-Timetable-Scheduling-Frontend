import axios from "axios";

export default function makeApi() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
  console.log("API URL:", apiUrl);
  
  const instance = axios.create({
    baseURL: apiUrl,
    timeout: 10000, // Increased timeout for slower connections
    withCredentials: true, // Include cookies in cross-site requests
  });

  instance.defaults.headers.common["Content-Type"] = "application/json";

  instance.interceptors.request.use(
    (config) => {
      console.log("Making API request to:", config.url, "with method:", config.method);
      const token = localStorage.getItem("token");
      
      if (token) {
        // Format token as Bearer token if it doesn't already have the prefix
        const formattedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        config.headers.Authorization = formattedToken;
        console.log("Added token to request header:", formattedToken.substring(0, 20) + "...");
      } else {
        console.warn("No token available for request");
      }
      return config;
    },
    (error) => {
      console.error("API request error:", error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      console.log("API response from:", response.config.url, "status:", response.status);
      return response;
    },
    (error) => {
      console.error(
        "API response error:", 
        error.response?.status, 
        error.response?.data,
        "URL:",
        error.config?.url
      );
      
      if (error.response?.status === 401) {
        console.log("Unauthorized error - clearing token and redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
