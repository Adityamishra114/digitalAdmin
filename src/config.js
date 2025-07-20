import axios from "axios";
const isProduction =
  import.meta.env.VITE_APP_PROD_ENV === "production" ||
  import.meta.env.MODE === "production";

export const BACKEND_URL = isProduction
  ? (import.meta.env.VITE_APP_BACKEND_PROD?.replace(/\/+$/, "") + "/api")
  : (import.meta.env.VITE_APP_BACKEND_DEV?.replace(/\/+$/, "") + "/api") ||
    "http://localhost:5000/api";

export const FRONTEND_URL = isProduction
  ? import.meta.env.VITE_APP_FRONTEND_PROD
  : import.meta.env.VITE_APP_FRONTEND_DEV;

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export const axiosAuthInstance = (token) =>
  axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
