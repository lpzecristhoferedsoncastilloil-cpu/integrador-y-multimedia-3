import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const { data } = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh })
          localStorage.setItem('access', data.access)
          err.config.headers.Authorization = `Bearer ${data.access}`
          return axios(err.config)
        } catch (refreshErr) {
          // El refresh token también expiró o es inválido: cerrar sesión
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          localStorage.removeItem('usuario')
          window.location.href = '/login'
        }
      } else {
        // No hay refresh token disponible: cerrar sesión
        localStorage.removeItem('access')
        localStorage.removeItem('usuario')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
