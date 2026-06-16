import { useEffect, useState, useRef } from 'react'
import Sidebar from './Sidebar'
import { Bell, Mail, Inbox, Search, X, Check, Clock, Loader2, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Layout({ children, titulo }) {
  const { usuario } = useAuth()
  const [notifDropdown, setNotifDropdown] = useState(false)
  const [citasHoy, setCitasHoy] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([]) // Alertas de calendario
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem(`dismissed_alerts_${usuario?.id_usuario}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  
  // Modales
  const [modalAdmin, setModalAdmin] = useState(false)
  const [modalPsicologo, setModalPsicologo] = useState(false)
  
  // Admin inputs
  const [psicologos, setPsicologos] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPsicologos, setSelectedPsicologos] = useState([])
  const [mensajeContenido, setMensajeContenido] = useState('')
  const [guardandoMensaje, setGuardandoMensaje] = useState(false)
  const [mensajesEnviados, setMensajesEnviados] = useState([])
  const [cargandoSentHistory, setCargandoSentHistory] = useState(false)
  const [activeTabAdmin, setActiveTabAdmin] = useState('nuevo') // 'nuevo' | 'historial'

  const dropdownRef = useRef(null)

  const isAdmin = usuario?.rol_usuario?.toUpperCase() === 'ADMINISTRADOR' || usuario?.correo_electronico?.startsWith('admin@')

  // Cargar notificaciones y mensajes
  const cargarDatosNotificaciones = async () => {
    if (!usuario) return
    try {
      const roleQuery = isAdmin ? 'ADMINISTRADOR' : 'PSICOLOGO'
      const msgRes = await api.get(`/mensajes/?usuario_id=${usuario.id_usuario}&role=${roleQuery}`)
      setMensajes(msgRes.data)

      if (!isAdmin) {
        const todayStr = new Date().toISOString().split('T')[0]
        const citasRes = await api.get(`/citas/?fecha=${todayStr}`)
        const allCitas = citasRes.data.results || citasRes.data
        const misCitas = allCitas.filter(c => {
          if (usuario.id_psicologo) {
            return c.id_psicologo === usuario.id_psicologo
          }
          return c.psicologo_nombre?.toLowerCase() === usuario.nombre_usuario?.toLowerCase()
        })
        setCitasHoy(misCitas)
      }
    } catch (e) {
      console.error("Error cargando notificaciones:", e)
    }
  }

  useEffect(() => {
    cargarDatosNotificaciones()
    const interval = setInterval(cargarDatosNotificaciones, 30000)
    return () => clearInterval(interval)
  }, [usuario])

  // Cargar psicólogos para administrador
  const cargarPsicologos = async () => {
    try {
      const res = await api.get('/usuarios/')
      const list = (res.data.results || res.data).filter(u => u.rol_usuario === 'PSICOLOGO' && u.estado_usuario?.toUpperCase() === 'ACTIVO')
      setPsicologos(list)
    } catch (e) {
      console.error(e)
      toast.error('Error al cargar la lista de psicólogos')
    }
  }

  const cargarHistorialEnviados = async () => {
    if (!usuario) return
    setCargandoSentHistory(true)
    try {
      const msgRes = await api.get(`/mensajes/?usuario_id=${usuario.id_usuario}&role=ADMINISTRADOR`)
      setMensajesEnviados(msgRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setCargandoSentHistory(false)
    }
  }

  useEffect(() => {
    if (modalAdmin) {
      cargarPsicologos()
      if (activeTabAdmin === 'historial') {
        cargarHistorialEnviados()
      }
    }
  }, [modalAdmin, activeTabAdmin])

  // Chequeo de citas próximas (20 minutos antes de que empiece)
  useEffect(() => {
    if (isAdmin || citasHoy.length === 0) {
      setActiveAlerts([])
      return
    }

    const checkCitasAlertas = () => {
      const now = new Date()
      const alerts = []

      citasHoy.forEach(c => {
        if (c.estado_cita?.toUpperCase() === 'CANCELADA') return

        const [hour, minute] = c.hora_inicio.split(':')
        const appointmentTime = new Date()
        appointmentTime.setHours(parseInt(hour, 10))
        appointmentTime.setMinutes(parseInt(minute, 10))
        appointmentTime.setSeconds(0)

        const diffMs = appointmentTime.getTime() - now.getTime()
        const diffMinutes = Math.floor(diffMs / 60000)

        // Alerta si faltan <= 20 min y no han pasado mas de 10 min de inicio
        if (diffMinutes >= -10 && diffMinutes <= 20 && !dismissedAlerts.includes(c.id_cita)) {
          alerts.push({
            id: c.id_cita,
            titulo: 'Cita Próxima ⏰',
            mensaje: `Cita con ${c.paciente_nombre} a las ${c.hora_inicio.slice(0, 5)} (${diffMinutes > 0 ? `en ${diffMinutes} min` : 'comenzó hace poco'}).`,
            tipo: 'cita'
          })
        }
      })

      setActiveAlerts(alerts)
    }

    checkCitasAlertas()
    const timer = setInterval(checkCitasAlertas, 30000)
    return () => clearInterval(timer)
  }, [citasHoy, dismissedAlerts, isAdmin])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDismissCita = (citaId) => {
    const updated = [...dismissedAlerts, citaId]
    setDismissedAlerts(updated)
    localStorage.setItem(`dismissed_alerts_${usuario?.id_usuario}`, JSON.stringify(updated))
    toast.success('Alarma descartada')
  }

  const handleReadMessage = async (msgId) => {
    try {
      await api.patch(`/mensajes/${msgId}/leido/`)
      setMensajes(prev => prev.map(m => m.id_mensaje === msgId ? { ...m, leido: true } : m))
      toast.success('Mensaje leído')
      cargarDatosNotificaciones()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    if (selectedPsicologos.length === 0) {
      toast.error('Selecciona al menos un psicólogo')
      return
    }
    if (!mensajeContenido.trim()) {
      toast.error('El mensaje no puede estar vacío')
      return
    }

    setGuardandoMensaje(true)
    try {
      await api.post('/mensajes/', {
        emisor_id: usuario.id_usuario,
        receptor_ids: selectedPsicologos,
        contenido: mensajeContenido,
        titulo: 'Mensaje de Administrador'
      })
      toast.success('Mensaje enviado')
      setMensajeContenido('')
      setSelectedPsicologos([])
      setSearchQuery('')
      if (activeTabAdmin === 'historial') {
        cargarHistorialEnviados()
      } else {
        setModalAdmin(false)
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al enviar mensaje')
    } finally {
      setGuardandoMensaje(false)
    }
  }

  const handleTogglePsicologo = (id) => {
    setSelectedPsicologos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleToggleAllPsicologos = () => {
    const filtered = psicologos.filter(p =>
      p.nombre_usuario.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const filteredIds = filtered.map(p => p.id_usuario)
    const allSelected = filteredIds.every(id => selectedPsicologos.includes(id))
    
    if (allSelected) {
      setSelectedPsicologos(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      setSelectedPsicologos(prev => [...new Set([...prev, ...filteredIds])])
    }
  }

  const unreadMessages = mensajes.filter(m => !m.leido)
  const totalNotificacionesCount = unreadMessages.length + activeAlerts.length
  const userName = usuario?.nombre_usuario || usuario?.nombre || 'Usuario'
  const userInitials = userName.slice(0, 2).toUpperCase()

  // Filtrar psicólogos por búsqueda
  const psicologosFiltrados = psicologos.filter(p =>
    p.nombre_usuario.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
          <div className="flex items-center gap-4 relative">
            
            {/* Botón de Comunicado (Admin) / Bandeja (Psicólogo) */}
            {isAdmin ? (
              <button
                onClick={() => setModalAdmin(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition text-xs font-bold cursor-pointer font-sans"
              >
                <Send className="w-3.5 h-3.5" /> Enviar Comunicado
              </button>
            ) : (
              <button
                onClick={() => setModalPsicologo(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition text-xs font-bold cursor-pointer font-sans"
              >
                <Inbox className="w-3.5 h-3.5" /> Bandeja de Entrada
              </button>
            )}

            {/* Icono de Campana */}
            <button
              onClick={() => setNotifDropdown(!notifDropdown)}
              className="relative w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {totalNotificacionesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {totalNotificacionesCount}
                </span>
              )}
            </button>

            {/* Dropdown de la Campana */}
            {notifDropdown && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-12 top-0 w-85 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
              >
                <div className="px-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900">Notificaciones</span>
                  <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                    {totalNotificacionesCount} alertas
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {/* Alertas de citas próximas */}
                  {activeAlerts.map(alert => (
                    <div key={`cita-${alert.id}`} className="p-3 bg-amber-50/50 flex justify-between gap-3 items-start">
                      <div className="flex gap-2">
                        <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{alert.titulo}</p>
                          <p className="text-[10px] text-gray-600 leading-normal mt-0.5">{alert.mensaje}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismissCita(alert.id)}
                        className="text-[9px] bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 px-2 py-1 rounded font-bold transition cursor-pointer flex-shrink-0"
                      >
                        Cerrar
                      </button>
                    </div>
                  ))}

                  {/* Mensajes de admin no leídos */}
                  {!isAdmin && unreadMessages.map(msg => (
                    <div key={`msg-${msg.id_mensaje}`} className="p-3 hover:bg-gray-50/50 flex justify-between gap-3 items-start">
                      <div className="flex gap-2">
                        <Mail className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{msg.titulo}</p>
                          <p className="text-[10px] text-gray-600 line-clamp-2 mt-0.5">{msg.contenido}</p>
                          <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">{msg.fecha_envio ? new Date(msg.fecha_envio).toLocaleDateString('es-ES') : ''}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReadMessage(msg.id_mensaje)}
                        className="text-[9px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded font-bold transition cursor-pointer flex-shrink-0"
                      >
                        Leído
                      </button>
                    </div>
                  ))}

                  {totalNotificacionesCount === 0 && (
                    <div className="p-6 text-center text-gray-400 text-xs font-medium">
                      No tienes alertas ni comunicados pendientes
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Avatar del Profesional */}
            <div className="flex items-center gap-2 border-l pl-4 border-gray-150">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: 'var(--ng-topbar-avatar)' }}>
                {userInitials}
              </div>
              <span className="text-xs font-bold text-gray-800 hidden md:block">{userName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* ================= MODAL ADMIN: ENVIAR COMUNICADOS ================= */}
      {modalAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Comunicados del Administrador</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manda mensajes personalizados o masivos a los psicólogos.</p>
              </div>
              <button
                onClick={() => setModalAdmin(false)}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Pestañas modal */}
            <div className="flex border-b border-gray-100 px-6 gap-6">
              <button
                onClick={() => setActiveTabAdmin('nuevo')}
                className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer ${activeTabAdmin === 'nuevo' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Enviar Nuevo Comunicado
              </button>
              <button
                onClick={() => setActiveTabAdmin('historial')}
                className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer ${activeTabAdmin === 'historial' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Historial de Enviados
              </button>
            </div>

            {activeTabAdmin === 'nuevo' ? (
              <form onSubmit={handleEnviarMensaje} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Buscador y lista de psicólogos */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Destinatarios</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar psicólogo por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-gray-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleAllPsicologos}
                      className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-xs font-semibold text-gray-600 cursor-pointer flex-shrink-0"
                    >
                      {psicologosFiltrados.every(p => selectedPsicologos.includes(p.id_usuario)) ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                    </button>
                  </div>

                  <div className="border border-gray-150 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-50 bg-white">
                    {psicologosFiltrados.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No hay psicólogos activos registrados.</div>
                    ) : (
                      psicologosFiltrados.map(p => {
                        const isChecked = selectedPsicologos.includes(p.id_usuario)
                        return (
                          <div
                            key={p.id_usuario}
                            onClick={() => handleTogglePsicologo(p.id_usuario)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{p.nombre_usuario}</p>
                              <p className="text-[10px] text-gray-400">{p.correo_electronico}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <p className="text-[10px] text-indigo-600 font-medium">
                    Psicólogos seleccionados: <strong>{selectedPsicologos.length}</strong>
                  </p>
                </div>

                {/* Contenido */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Cuerpo del Comunicado</label>
                  <textarea
                    rows={4}
                    value={mensajeContenido}
                    onChange={(e) => setMensajeContenido(e.target.value)}
                    required
                    placeholder="Escriba un mensaje para enviar a los psicólogos seleccionados..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-gray-800 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalAdmin(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition text-xs cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoMensaje}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:opacity-95 transition disabled:opacity-60 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {guardandoMensaje ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Enviar Mensaje
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 overflow-y-auto flex-1 divide-y divide-gray-100">
                {cargandoSentHistory ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                ) : mensajesEnviados.length === 0 ? (
                  <p className="text-center py-12 text-xs text-gray-400">No has enviado ningún comunicado aún.</p>
                ) : (
                  mensajesEnviados.map(msg => (
                    <div key={msg.id_mensaje} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <span className="font-bold text-gray-800">Para: {msg.receptor_nombre}</span>
                          <span className="text-[10px] text-gray-400 ml-2 font-medium">({msg.leido ? 'Leído' : 'No leído'})</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(msg.fecha_envio).toLocaleString('es-ES')}</span>
                      </div>
                      <p className="text-xs text-gray-650 bg-gray-50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{msg.contenido}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL PSICOLOGO: HISTORIAL DE MENSAJES RECIBIDOS ================= */}
      {modalPsicologo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bandeja de Entrada</h3>
                <p className="text-xs text-gray-500 mt-0.5">Todos los comunicados e instrucciones que te ha enviado el administrador.</p>
              </div>
              <button
                onClick={() => setModalPsicologo(false)}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-250 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 divide-y divide-gray-100">
              {mensajes.length === 0 ? (
                <p className="text-center py-12 text-xs text-gray-400">No has recibido ningún comunicado oficial de administración.</p>
              ) : (
                mensajes.map(msg => (
                  <div key={msg.id_mensaje} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${msg.leido ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}`}>
                        {msg.leido ? 'Leído' : 'Nuevo'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{new Date(msg.fecha_envio).toLocaleString('es-ES')}</span>
                    </div>
                    <p className={`text-xs p-4 rounded-xl leading-relaxed whitespace-pre-wrap ${msg.leido ? 'bg-gray-50 text-gray-650' : 'bg-indigo-50/30 text-gray-950 font-medium border border-indigo-100/50'}`}>{msg.contenido}</p>
                    
                    {!msg.leido && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleReadMessage(msg.id_mensaje)}
                          className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-2 py-1 rounded transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Marcar como Leído
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
