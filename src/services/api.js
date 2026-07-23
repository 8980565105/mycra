// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;

import axios from "axios";

// JWT token expire check helper
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // invalid token = expired treat karo
  }
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // cookies support
  timeout: 10000, // 10 sec — no timeout = hacker hang karave
});

// REQUEST interceptor
// api.interceptors.request.use(
//   (config) => {
//     // localStorage → sessionStorage  (XSS attack ma safer)
//     const token = sessionStorage.getItem("token");

//     if (token) {
//       // Expire thayel token backend ne moklo j nahi
//       if (isTokenExpired(token)) {
//         sessionStorage.removeItem("token");
//         window.location.href = "/login";
//         return Promise.reject(new Error("Token expired"));
//       }
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // sessionStorage ni badle
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

// RESPONSE interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) {
    //   sessionStorage.removeItem("token");
    //   window.location.href = "/login"; // redirect — token remove karva saathe
    // }
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // sessionStorage ni badle
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      // Access denied — unauthorized page par moko
      window.location.href = "/unauthorized";
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout — server respond nathi karyo");
    }

    return Promise.reject(error);
  },
);

export default api;
