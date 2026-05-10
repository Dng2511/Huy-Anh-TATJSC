import axios from "axios"

export const Http = axios.create({
    baseURL: "http://localhost:3000/api",
})

Http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});