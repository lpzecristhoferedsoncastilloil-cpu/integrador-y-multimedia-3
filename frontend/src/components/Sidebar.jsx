import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Brain, LayoutDashboard, Users, Calendar, Gamepad2,
  BarChart3, FileText, Settings, LogOut, ChevronRight
} from 'lucide-react'

const menu = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pacientes', icon: Users, label: 'Pacientes' },
  { path: '/calendario', icon: Calendar, label: 'Calendario' },
  { path: '/juegos', icon: Gamepad2, label: 'Juegos' },
  { path: '/tests', icon: FileText, label: 'Tests' },
  { path: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
  { path: '/reportes', icon: FileText, label: 'Reportes' },
  { path: '/configuracion', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const iniciales = usuario?.nombre_usuario?.slice(0, 2).toUpperCase() || 'NG'

  return (
    <div className="w-[260px] h-screen text-white fixed left-0 top-0 flex flex-col z-40" style={{ background: 'var(--ng-sidebar-bg)' }}>

      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--ng-sidebar-active)' }}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">NeuroGym</p>
            <p className="text-xs text-gray-400 mt-0.5">Sistema Clínico</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: 'var(--ng-sidebar-active)' }}>
            {iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{usuario?.nombre_usuario}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--ng-accent)' }}>{usuario?.rol_usuario}</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-3 mb-3">Menú Principal</p>
        {menu.map(({ path, icon: Icon, label }) => {
          const activo = pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activo
                  ? 'text-white shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              style={activo ? { background: 'var(--ng-sidebar-active)', boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--ng-primary) 30%, transparent)` } : {}}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {activo && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
