import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const usuarioData = await login(correo, contrasena)
      if (usuarioData) {
        toast.success('¡Bienvenido a NeuroGym!')
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Brain className="text-white w-8 h-8" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">NeuroGym</h1>
          <p className="text-gray-500 mt-1">Sistema de Gestión Clínica</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={verPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 bg-gray-50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-base hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {cargando ? <><Loader2 className="w-5 h-5 animate-spin" /> Ingresando...</> : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link to="/" className="text-indigo-600 hover:underline">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}
