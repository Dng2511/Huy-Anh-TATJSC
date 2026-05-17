import axios from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

export const Http = axios.create({
    baseURL: baseURL,
    withCredentials: true,
})

Http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

Http.interceptors.response.use(
  response => response,
  async (error) => {
    const originalReq = error.config
    if (error.response && error.response.status === 401 && !originalReq._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalReq.headers.Authorization = `Bearer ${token}`
          return Http(originalReq)
        })
      }

      originalReq._retry = true
      isRefreshing = true
      try {
        const refreshUrl = `${baseURL.replace(/\/$/, '')}/auth/refresh`
        const res = await axios.post(refreshUrl, {}, { withCredentials: true })
        const newToken = res.data?.accessToken
        if (!newToken) throw new Error('No accessToken in refresh response')
        localStorage.setItem('access_token', newToken)
        Http.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return Http(originalReq)
      } catch (e) {
        processQueue(e, null)
        localStorage.removeItem('access_token')
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)