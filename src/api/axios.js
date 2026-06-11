import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://3.65.169.203:7777',
})

// Request interceptor - добавляет token в заголовки
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - обрабатывает ошибки авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    const skipLogout =
      !url.includes('/auth/login') &&
      !url.includes('/users/login') &&
      !url.includes('/categories') &&
      !url.includes('/products')

    if (status === 401 && skipLogout) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api