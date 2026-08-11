import axios from "axios";
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; 
  }
};
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
  timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); 
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
    }
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout — server respond nathi karyo");
    }
    return Promise.reject(error);
  },
);

export default api;
