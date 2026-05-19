import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { User, Lock, Bell, Palette, Save, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Configuracion() {
  const { usuario } = useAuth()
  const [guardando, setGuardando] = useState(false)
  const [tab, setTab] = useState('perfil')
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'claro')
  const [notifs, setNotifs] = useState({
    citas: true, pacientes: true, juegos: false, reportes: true, sistema: true
  })

  useEffect(() => {
    // Aplicar tema al body
    document.documentElement.classList.remove('dark', 'light')
    if (tema === 'oscuro') {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)'
    } else if (tema === 'alto_contraste') {
      document.documentElement.style.filter = 'contrast(1.5)'
    } else {
      document.documentElement.style.filter = ''
    }
    localStorage.setItem('tema', tema)
  }, [tema])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setTimeout(() => {
      toast.success('Configuración guardada')
      setGuardando(false)
    }, 600)
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
  ]

  const temas = [
    {
      id: 'claro',
      label: 'Claro',
      desc: 'Fondo blanco, texto oscuro',
      preview: (
        <div className="h-16 rounded-xl bg-white border-2 border-gray-200 flex overflow-hidden">
          <div className="w-8 bg-gray-900" />
          <div className="flex-1 p-2 space-y-1">
            <div className="h-2 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-indigo-200 rounded w-1/2" />
          </div>
        </div>
      )
    },
    {
      id: 'oscuro',
      label: 'Oscuro',
      desc: 'Fondo oscuro, texto claro',
      preview: (
        <div className="h-16 rounded-xl bg-gray-900 border-2 border-gray-700 flex overflow-hidden">
          <div className="w-8 bg-black" />
          <div className="flex-1 p-2 space-y-1">
            <div className="h-2 bg-gray-600 rounded w-3/4" />
            <div className="h-2 bg-indigo-500 rounded w-1/2" />
          </div>
        </div>
      )
    },
    {
      id: 'alto_contraste',
      label: 'Alto Contraste',
      desc: 'Mayor contraste visual',
      preview: (
        <div className="h-16 rounded-xl bg-yellow-50 border-2 border-yellow-400 flex overflow-hidden">
          <div className="w-8 bg-black" />
          <div className="flex-1 p-2 space-y-1">
            <div className="h-2 bg-black rounded w-3/4" />
            <div className="h-2 bg-yellow-400 rounded w-1/2" />
          </div>
        </div>
      )
    },
  ]

  const coloresAccento = [
    { id: 'indigo', label: 'Índigo', color: 'bg-indigo-600' },
    { id: 'blue', label: 'Azul', color: 'bg-blue-600' },
    { id: 'purple', label: 'Morado', color: 'bg-purple-600' },
    { id: 'green', label: 'Verde', color: 'bg-green-600' },
    { id: 'rose', label: 'Rosa', color: 'bg-rose-600' },
    { id: 'orange', label: 'Naranja', color: 'bg-orange-500' },
  ]

  return (
    <Layout titulo="Configuración">
      <div className="max-w-3xl">
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {tab === 'perfil' && (
            <form onSubmit={guardar} className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Información del Perfil</h2>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {usuario?.nombre_usuario?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{usuario?.nombre_usuario}</p>
                  <p className="text-sm text-gray-500 capitalize">{usuario?.rol_usuario}</p>
                  <p className="text-sm text-indigo-600">{usuario?.correo_electronico}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de usuario</label>
                <input defaultValue={usuario?.nombre_usuario} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                <input type="email" defaultValue={usuario?.correo_electronico} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <button type="submit" disabled={guardando} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm">
                {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar cambios</>}
              </button>
            </form>
          )}

          {tab === 'seguridad' && (
            <form onSubmit={guardar} className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Cambiar Contraseña</h2>
              {['Contraseña actual', 'Nueva contraseña', 'Confirmar contraseña'].map(label => (
                <div key={label}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input type="password" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              ))}
              <button type="submit" disabled={guardando} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm">
                <Lock className="w-4 h-4" /> Actualizar contraseña
              </button>
            </form>
          )}

          {tab === 'notificaciones' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Preferencias de Notificaciones</h2>
              {[
                { key: 'citas', label: 'Recordatorio de citas', desc: 'Recibe alertas antes de cada cita' },
                { key: 'pacientes', label: 'Nuevos pacientes', desc: 'Cuando se registre un nuevo paciente' },
                { key: 'juegos', label: 'Resultados de juegos', desc: 'Al completar una sesión de juego' },
                { key: 'reportes', label: 'Reportes generados', desc: 'Cuando se genere un nuevo reporte' },
                { key: 'sistema', label: 'Alertas del sistema', desc: 'Actualizaciones y mantenimiento' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifs[key]}
                      onChange={e => setNotifs(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>
              ))}
              <button onClick={() => toast.success('Preferencias guardadas')} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm">
                <Save className="w-4 h-4" /> Guardar preferencias
              </button>
            </div>
          )}

          {tab === 'apariencia' && (
            <div className="space-y-8">
              <h2 className="text-lg font-bold text-gray-900">Apariencia del Sistema</h2>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">Tema de la interfaz</p>
                <div className="grid grid-cols-3 gap-4">
                  {temas.map(({ id, label, desc, preview }) => (
                    <div
                      key={id}
                      onClick={() => setTema(id)}
                      className={`cursor-pointer rounded-2xl p-3 border-2 transition-all ${tema === id ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      {preview}
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        {tema === id && (
                          <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">Color de acento</p>
                <div className="flex gap-3 flex-wrap">
                  {coloresAccento.map(({ id, label, color }) => (
                    <button
                      key={id}
                      title={label}
                      className={`w-10 h-10 ${color} rounded-xl hover:scale-110 transition-transform shadow-sm`}
                      onClick={() => toast.success(`Color ${label} aplicado`)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Tamaño de fuente</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">A</span>
                  <input
                    type="range" min="12" max="20" defaultValue="14"
                    onChange={e => document.documentElement.style.fontSize = `${e.target.value}px`}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-lg text-gray-400">A</span>
                </div>
              </div>

              <button
                onClick={() => { setTema('claro'); document.documentElement.style.filter = ''; document.documentElement.style.fontSize = ''; toast.success('Apariencia restablecida') }}
                className="text-sm text-gray-500 hover:text-indigo-600 underline"
              >
                Restablecer valores por defecto
              </button>
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}
