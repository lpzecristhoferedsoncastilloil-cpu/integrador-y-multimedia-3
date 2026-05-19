import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem('usuario')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const login = async (correo_electronico, contrasena) => {
    const { data } = await api.post('/login/', { correo_electronico, contrasena })
    
    // Guardar todo ANTES de navegar
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    
    // Actualizar estado del contexto
    setUsuario(data.usuario)
    
    return data.usuario
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
