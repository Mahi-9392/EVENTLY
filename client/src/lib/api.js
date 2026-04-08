import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  withCredentials: false,
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error?.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
)

export default api

