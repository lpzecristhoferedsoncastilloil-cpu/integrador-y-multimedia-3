import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { User, Lock, Bell, Palette, Save, Loader2, Check, Plus, Trash2, Pencil, Upload, UserPlus, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'


// Helper to apply theme colors to CSS custom properties
function applyThemeColors(primary, secondary, accent) {
  const r = document.documentElement
  r.style.setProperty('--ng-primary', primary)
  r.style.setProperty('--ng-secondary', secondary)
  r.style.setProperty('--ng-accent', accent)
  r.style.setProperty('--ng-sidebar-active', `linear-gradient(135deg, ${primary}, ${secondary})`)
  r.style.setProperty('--ng-topbar-avatar', `linear-gradient(135deg, ${primary}, ${secondary})`)
  r.style.setProperty('--ng-scrollbar', primary)
}

function resetThemeColors() {
  applyThemeColors('#4f46e5', '#7c3aed', '#a78bfa')
}

export default function Configuracion() {
  const { usuario } = useAuth()
  const [guardando, setGuardando] = useState(false)
  const [tab, setTab] = useState('perfil')
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'claro')
  const [notifs, setNotifs] = useState({
    citas: true, pacientes: true, juegos: false, reportes: true, sistema: true
  })

  // Estados para Registro de Psicólogo (Exclusivo de Administrador)
  const [formPsicologo, setFormPsicologo] = useState({
    nombre_completo: '', ci: '', edad: '', fecha_nacimiento: '', ciudad_origen: '', 
    telefono: '', telefono_referencia: '', correo_personal: '', 
    universidad_egreso: '', estudios_adicionales: '', especialidad: ''
  })
  const [cvFile, setCvFile] = useState(null)
  const [espFile, setEspFile] = useState(null)
  const [registrando, setRegistrando] = useState(false)
  const [registroExito, setRegistroExito] = useState(null)

  // Estados para Ajustes de Correo (SMTP)
  const [formSmtp, setFormSmtp] = useState({
    correo_emisor: '',
    contrasena_aplicacion: '',
    servidor_smtp: 'smtp.gmail.com',
    puerto: 587,
    use_tls: true
  })
  const [cargandoSmtp, setCargandoSmtp] = useState(false)
  const [guardandoSmtp, setGuardandoSmtp] = useState(false)

  useEffect(() => {
    if (tab === 'configuracion_smtp') {
      const cargarSmtp = async () => {
        setCargandoSmtp(true)
        try {
          const res = await api.get('/configuracion-smtp/')
          setFormSmtp(res.data)
        } catch (err) {
          console.error(err)
          toast.error('Error al cargar la configuración SMTP')
        } finally {
          setCargandoSmtp(false)
        }
      }
      cargarSmtp()
    }
  }, [tab])

  const guardarSmtp = async (e) => {
    e.preventDefault()
    setGuardandoSmtp(true)
    try {
      const res = await api.post('/configuracion-smtp/', formSmtp)
      toast.success('Configuración SMTP guardada exitosamente')
      setFormSmtp(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar la configuración SMTP')
    } finally {
      setGuardandoSmtp(false)
    }
  }

  const manejarCambioFechaNacimiento = (fecha) => {
    if (!fecha) {
      setFormPsicologo(prev => ({ ...prev, fecha_nacimiento: '', edad: '' }))
      return
    }

    const hoy = new Date()
    const cumple = new Date(fecha)
    let edadCalculada = hoy.getFullYear() - cumple.getFullYear()
    const mes = hoy.getMonth() - cumple.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
      edadCalculada--
    }

    const edadFinal = edadCalculada >= 0 ? edadCalculada : 0

    setFormPsicologo(prev => ({ 
      ...prev, 
      fecha_nacimiento: fecha, 
      edad: edadFinal.toString() 
    }))
  }


  const registrarPsicologo = async (e) => {
    e.preventDefault()
    setRegistrando(true)
    setRegistroExito(null)

    const formData = new FormData()
    Object.entries(formPsicologo).forEach(([key, val]) => {
      formData.append(key, val)
    })
    if (cvFile) formData.append('archivo_cv', cvFile)
    if (espFile) formData.append('archivo_especialidad', espFile)

    try {
      const res = await api.post('/psicologos/adicionar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Psicólogo registrado exitosamente')
      setRegistroExito(res.data)
      // Limpiar formulario y archivos
      setFormPsicologo({
        nombre_completo: '', ci: '', edad: '', fecha_nacimiento: '', ciudad_origen: '', 
        telefono: '', telefono_referencia: '', correo_personal: '', 
        universidad_egreso: '', estudios_adicionales: '', especialidad: ''
      })
      setCvFile(null)
      setEspFile(null)
      
      // Limpiar los elementos file en la UI
      const cvInput = document.getElementById('archivo_cv_input')
      const espInput = document.getElementById('archivo_esp_input')
      if (cvInput) cvInput.value = ''
      if (espInput) espInput.value = ''
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.error || 'Error al registrar psicólogo'
      toast.error(msg)
    } finally {
      setRegistrando(false)
    }
  }


  // Custom theme state
  const [customColors, setCustomColors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ng_custom_colors')) || { primary: '#4f46e5', secondary: '#7c3aed', accent: '#a78bfa' } }
    catch { return { primary: '#4f46e5', secondary: '#7c3aed', accent: '#a78bfa' } }
  })
  const [savedThemes, setSavedThemes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ng_saved_themes')) || [] }
    catch { return [] }
  })
  const [themeName, setThemeName] = useState('')

  useEffect(() => {
    // Aplicar tema al body
    document.documentElement.classList.remove('dark', 'light')
    if (tema === 'oscuro') {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)'
      document.documentElement.style.setProperty('--ng-sidebar-bg', '#030712')
    } else if (tema === 'alto_contraste') {
      document.documentElement.style.filter = 'contrast(1.5)'
      document.documentElement.style.setProperty('--ng-sidebar-bg', '#030712')
    } else if (tema === 'personalizado') {
      document.documentElement.style.filter = ''
      applyThemeColors(customColors.primary, customColors.secondary, customColors.accent)
    } else {
      document.documentElement.style.filter = ''
      document.documentElement.style.setProperty('--ng-sidebar-bg', '#030712')
      resetThemeColors()
    }
    localStorage.setItem('tema', tema)
  }, [tema, customColors])

  // Apply custom colors live when changed
  useEffect(() => {
    if (tema === 'personalizado') {
      applyThemeColors(customColors.primary, customColors.secondary, customColors.accent)
      localStorage.setItem('ng_custom_colors', JSON.stringify(customColors))
    }
  }, [customColors, tema])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setTimeout(() => {
      toast.success('Configuración guardada')
      setGuardando(false)
    }, 600)
  }

  const saveCustomTheme = () => {
    const name = themeName.trim() || `Tema ${savedThemes.length + 1}`
    const newTheme = { name, ...customColors, id: Date.now() }
    const updated = [...savedThemes, newTheme]
    setSavedThemes(updated)
    localStorage.setItem('ng_saved_themes', JSON.stringify(updated))
    setThemeName('')
    toast.success(`Tema "${name}" guardado`)
  }

  const deleteCustomTheme = (id) => {
    const updated = savedThemes.filter(t => t.id !== id)
    setSavedThemes(updated)
    localStorage.setItem('ng_saved_themes', JSON.stringify(updated))
    toast.success('Tema eliminado')
  }

  const loadCustomTheme = (t) => {
    setCustomColors({ primary: t.primary, secondary: t.secondary, accent: t.accent })
    setTema('personalizado')
    toast.success(`Tema "${t.name}" aplicado`)
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
  ]

  if (usuario?.correo_electronico === 'admin@neurogym.com') {
    tabs.push({ id: 'adicionar_psicologo', label: 'Adicionar Psicólogo', icon: UserPlus })
    tabs.push({ id: 'configuracion_smtp', label: 'Ajustes de Correo (SMTP)', icon: Mail })
  }


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
    {
      id: 'personalizado',
      label: 'Personalizado',
      desc: 'Elige tus propios colores',
      preview: (
        <div className="h-16 rounded-xl border-2 border-dashed border-gray-300 flex overflow-hidden" style={{ background: `linear-gradient(135deg, ${customColors.primary}22, ${customColors.secondary}22)` }}>
          <div className="w-8" style={{ background: customColors.primary }} />
          <div className="flex-1 p-2 space-y-1">
            <div className="h-2 rounded w-3/4" style={{ background: customColors.secondary }} />
            <div className="h-2 rounded w-1/2" style={{ background: customColors.accent }} />
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
                <div className="grid grid-cols-4 gap-4">
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

              {/* Custom Color Picker - only visible when personalizado is selected */}
              {tema === 'personalizado' && (
                <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 space-y-5">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-indigo-900">Personalizar Colores</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'primary', label: 'Color Primario', desc: 'Sidebar, botones principales' },
                      { key: 'secondary', label: 'Color Secundario', desc: 'Gradientes, acentos' },
                      { key: 'accent', label: 'Color de Acento', desc: 'Detalles, texto destacado' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-700">{label}</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customColors[key]}
                            onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5"
                            style={{ WebkitAppearance: 'none' }}
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={customColors[key]}
                              onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm font-mono uppercase text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                            <p className="text-xs text-gray-400 mt-1">{desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preview band */}
                  <div className="flex gap-1 h-8 rounded-xl overflow-hidden shadow-inner">
                    <div className="flex-1" style={{ background: customColors.primary }} />
                    <div className="flex-1" style={{ background: `linear-gradient(135deg, ${customColors.primary}, ${customColors.secondary})` }} />
                    <div className="flex-1" style={{ background: customColors.secondary }} />
                    <div className="flex-1" style={{ background: `linear-gradient(135deg, ${customColors.secondary}, ${customColors.accent})` }} />
                    <div className="flex-1" style={{ background: customColors.accent }} />
                  </div>

                  {/* Quick color presets */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Presets rápidos</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { name: 'Océano', p: '#0369a1', s: '#0e7490', a: '#06b6d4' },
                        { name: 'Bosque', p: '#15803d', s: '#166534', a: '#4ade80' },
                        { name: 'Atardecer', p: '#c2410c', s: '#b91c1c', a: '#f97316' },
                        { name: 'Rosa', p: '#be185d', s: '#9333ea', a: '#f472b6' },
                        { name: 'Dorado', p: '#a16207', s: '#854d0e', a: '#fbbf24' },
                        { name: 'Noche', p: '#1e1b4b', s: '#312e81', a: '#818cf8' },
                      ].map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => setCustomColors({ primary: preset.p, secondary: preset.s, accent: preset.a })}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 transition bg-white text-xs font-medium text-gray-700"
                        >
                          <div className="flex gap-0.5">
                            <div className="w-3 h-3 rounded-full" style={{ background: preset.p }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: preset.s }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: preset.a }} />
                          </div>
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save custom theme */}
                  <div className="flex items-center gap-3 pt-2 border-t border-indigo-200">
                    <input
                      type="text"
                      placeholder="Nombre del tema..."
                      value={themeName}
                      onChange={e => setThemeName(e.target.value)}
                      className="flex-1 h-10 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={saveCustomTheme}
                      className="flex items-center gap-2 h-10 px-4 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${customColors.primary}, ${customColors.secondary})` }}
                    >
                      <Plus className="w-4 h-4" /> Guardar Tema
                    </button>
                  </div>

                  {/* Saved themes list */}
                  {savedThemes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Temas guardados</p>
                      <div className="grid grid-cols-2 gap-2">
                        {savedThemes.map(t => (
                          <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-100 hover:border-gray-300 transition group">
                            <div className="flex gap-0.5 mr-1">
                              <div className="w-5 h-5 rounded-md" style={{ background: t.primary }} />
                              <div className="w-5 h-5 rounded-md" style={{ background: t.secondary }} />
                              <div className="w-5 h-5 rounded-md" style={{ background: t.accent }} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 flex-1 truncate">{t.name}</span>
                            <button onClick={() => loadCustomTheme(t)} className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition">
                              Aplicar
                            </button>
                            <button onClick={() => deleteCustomTheme(t.id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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

          {tab === 'adicionar_psicologo' && usuario?.correo_electronico === 'admin@neurogym.com' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Registrar Nuevo Psicólogo</h2>
                  <p className="text-xs text-gray-500">Adiciona un profesional al sistema. Las credenciales de acceso se autogenerarán y se enviarán a su correo personal.</p>
                </div>
              </div>

              {registroExito ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                    <div>
                      <h3 className="font-bold text-green-900">¡Registro Completado con Éxito!</h3>
                      <p className="text-xs text-green-700">El profesional ha sido incorporado al sistema correctamente.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-green-100 space-y-2 text-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credenciales de Acceso Autogeneradas</p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <p className="text-xs text-gray-500">Usuario Corporativo</p>
                        <p className="font-mono font-semibold text-gray-800 break-all">{registroExito.correo_corporativo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contraseña Temporal</p>
                        <p className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">{registroExito.contrasena_temporal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-green-100 text-xs text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-700">Notificación al Profesional</p>
                    {registroExito.correo_enviado ? (
                      <p className="text-green-600 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        Correo electrónico de bienvenida enviado con éxito a su dirección personal.
                      </p>
                    ) : (
                      <div>
                        <p className="text-amber-600 flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          El psicólogo fue registrado, pero el correo no pudo ser enviado automáticamente.
                        </p>
                        <p className="text-gray-400 mt-1 text-[10px]">Detalle del error SMTP: {registroExito.correo_error_detalle || 'Desconocido'}</p>
                        <p className="text-gray-500 mt-1">Por favor, facilítale sus credenciales corporativas de acceso de forma manual.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setRegistroExito(null)}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition text-sm shadow-sm"
                  >
                    Registrar Otro Psicólogo
                  </button>
                </div>
              ) : (
                <form onSubmit={registrarPsicologo} className="space-y-6">
                  {/* Datos Personales y Profesionales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Rosa Espinoza"
                        value={formPsicologo.nombre_completo}
                        onChange={e => setFormPsicologo({ ...formPsicologo, nombre_completo: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cédula de Identidad (CI) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 1234567"
                        value={formPsicologo.ci}
                        onChange={e => setFormPsicologo({ ...formPsicologo, ci: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        required
                        value={formPsicologo.fecha_nacimiento}
                        onChange={e => manejarCambioFechaNacimiento(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Edad Actual (Autocalculada)</label>
                      <input
                        type="text"
                        disabled
                        placeholder="Se calcula al ingresar fecha"
                        value={formPsicologo.edad ? `${formPsicologo.edad} años` : ''}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none bg-gray-50 text-gray-500 font-semibold text-sm cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad de Origen</label>
                      <input
                        type="text"
                        placeholder="Ej. Bogotá"
                        value={formPsicologo.ciudad_origen}
                        onChange={e => setFormPsicologo({ ...formPsicologo, ciudad_origen: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Personal (Gmail/Outlook) *</label>
                      <input
                        type="email"
                        required
                        placeholder="Ej. rosa.personal@gmail.com"
                        value={formPsicologo.correo_personal}
                        onChange={e => setFormPsicologo({ ...formPsicologo, correo_personal: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono Personal</label>
                      <input
                        type="text"
                        placeholder="Ej. +57 3001234567"
                        value={formPsicologo.telefono}
                        onChange={e => setFormPsicologo({ ...formPsicologo, telefono: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono Referencia / Alternativo</label>
                      <input
                        type="text"
                        placeholder="Ej. +57 3009876543"
                        value={formPsicologo.telefono_referencia}
                        onChange={e => setFormPsicologo({ ...formPsicologo, telefono_referencia: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Universidad de Egreso</label>
                      <input
                        type="text"
                        placeholder="Ej. Universidad Nacional"
                        value={formPsicologo.universidad_egreso}
                        onChange={e => setFormPsicologo({ ...formPsicologo, universidad_egreso: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Especialidad Principal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Dislexia Fonológica"
                        value={formPsicologo.especialidad}
                        onChange={e => setFormPsicologo({ ...formPsicologo, especialidad: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Estudios Adicionales / Observaciones (Opcional)</label>
                      <textarea
                        rows={2}
                        placeholder="Detalles sobre maestrías, certificaciones o cursos adicionales..."
                        value={formPsicologo.estudios_adicionales}
                        onChange={e => setFormPsicologo({ ...formPsicologo, estudios_adicionales: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Carga de Documentos */}
                  <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 grid grid-cols-2 gap-4">
                    <h3 className="col-span-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Documentos Adjuntos de Contratación</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Currículum Vitae (CV) (PDF, Word, Imagen)</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl p-3 bg-white hover:border-indigo-500 hover:bg-indigo-50/20 transition cursor-pointer text-xs font-medium text-gray-600">
                          <Upload className="w-4 h-4 text-indigo-500" />
                          <span className="truncate">{cvFile ? cvFile.name : 'Subir archivo CV'}</span>
                          <input
                            id="archivo_cv_input"
                            type="file"
                            className="hidden"
                            onChange={e => setCvFile(e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título o Especialidad (PDF, Word, Imagen)</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl p-3 bg-white hover:border-indigo-500 hover:bg-indigo-50/20 transition cursor-pointer text-xs font-medium text-gray-600">
                          <Upload className="w-4 h-4 text-indigo-500" />
                          <span className="truncate">{espFile ? espFile.name : 'Subir título/documento'}</span>
                          <input
                            id="archivo_esp_input"
                            type="file"
                            className="hidden"
                            onChange={e => setEspFile(e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registrando}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm shadow-sm"
                  >
                    {registrando ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Registrando profesional...</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Registrar Psicólogo y Autogenerar Credenciales</>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {tab === 'configuracion_smtp' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display">Ajustes del Servidor de Correo (SMTP)</h2>
                  <p className="text-xs text-gray-500">Configure las credenciales del remitente corporativo en tiempo real sin alterar código.</p>
                </div>
              </div>

              {cargandoSmtp ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                  <p className="text-sm font-medium">Cargando parámetros SMTP...</p>
                </div>
              ) : (
                <form onSubmit={guardarSmtp} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico Emisor (remitente) *</label>
                      <input
                        type="email"
                        required
                        placeholder="Ej. mi.clinica@gmail.com"
                        value={formSmtp.correo_emisor || ''}
                        onChange={e => setFormSmtp({ ...formSmtp, correo_emisor: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-800"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña de Aplicación o Contraseña de Correo *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••••••"
                        value={formSmtp.contrasena_aplicacion || ''}
                        onChange={e => setFormSmtp({ ...formSmtp, contrasena_aplicacion: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono bg-white text-gray-800"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Si usas Gmail, asegúrate de generar una 'Contraseña de Aplicación' de 16 dígitos en tu panel de seguridad de Google.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Servidor SMTP *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. smtp.gmail.com"
                        value={formSmtp.servidor_smtp || ''}
                        onChange={e => setFormSmtp({ ...formSmtp, servidor_smtp: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Puerto de Salida *</label>
                      <input
                        type="number"
                        required
                        placeholder="Ej. 587 o 465"
                        value={formSmtp.puerto || ''}
                        onChange={e => setFormSmtp({ ...formSmtp, puerto: parseInt(e.target.value) || 587 })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-800"
                      />
                    </div>

                    <div className="col-span-2 flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="use_tls"
                        checked={!!formSmtp.use_tls}
                        onChange={e => setFormSmtp({ ...formSmtp, use_tls: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <label htmlFor="use_tls" className="text-xs font-semibold text-gray-600 cursor-pointer select-none">
                        Usar Conexión Segura (TLS / STARTTLS)
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoSmtp}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm shadow-sm"
                  >
                    {guardandoSmtp ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Guardar Configuración SMTP</>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}


        </div>
      </div>
    </Layout>
  )
}
