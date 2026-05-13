import axios from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

export const Http = axios.create({
    baseURL: baseURL,
})

Http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});