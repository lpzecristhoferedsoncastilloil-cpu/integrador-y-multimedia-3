import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { Plus, X, Loader2, Edit2, Trash2, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'

const VACIO = { paciente: '', psicologo: '', fecha: '', hora_inicio: '', hora_fin: '', tipo: 'consulta', notas: '' }
const COLORES = { consulta: '#6366f1', terapia: '#10b981', evaluacion: '#f59e0b' }

export default function Calendario() {
  const [citas, setCitas] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [psicologos, setPsicologos] = useState([])
  const [modal, setModal] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const calRef = useRef(null)

  const cargar = async () => {
    try {
      const [c, p, ps] = await Promise.all([
        api.get('/citas/'),
        api.get('/pacientes/'),
        api.get('/psicologos-lista/'),
      ])
      const citasData = c.data.results || c.data
      setCitas(citasData.map(cita => ({
        id: cita.id_cita,
        title: cita.paciente_nombre || cita.titulo_cita,
        start: `${cita.fecha_cita}T${cita.hora_inicio}`,
        end: `${cita.fecha_cita}T${cita.hora_fin}`,
        backgroundColor: COLORES[cita.tipo] || '#6366f1',
        borderColor: 'transparent',
        extendedProps: { ...cita },
      })))
      setPacientes(p.data.results || p.data)
      setPsicologos(ps.data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNueva = (info) => {
    setEditandoId(null)
    setForm({ ...VACIO, fecha: info?.dateStr || '' })
    setModal(true)
  }

  const abrirEditar = (cita) => {
    setModalDetalle(null)
    setEditandoId(cita.id_cita)
    setForm({
      paciente: cita.id_paciente,
      psicologo: cita.id_psicologo,
      fecha: cita.fecha_cita,
      hora_inicio: cita.hora_inicio,
      hora_fin: cita.hora_fin,
      tipo: cita.tipo || 'consulta',
      notas: cita.observaciones || '',
    })
    setModal(true)
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return
    try {
      await api.delete(`/citas/${id}/`)
      toast.success('Cita eliminada')
      setModalDetalle(null)
      cargar()
    } catch { toast.error('Error al eliminar') }
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const payload = {
      id_paciente: form.paciente,
      id_psicologo: form.psicologo,
      titulo_cita: `Cita - ${form.tipo}`,
      fecha_cita: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      estado_cita: 'PENDIENTE',
      observaciones: form.notes || form.notas,
    }
    try {
      if (editandoId) {
        await api.patch(`/citas/${editandoId}/`, payload)
        toast.success('Cita actualizada')
      } else {
        await api.post('/citas/', payload)
        toast.success('Cita agendada')
      }
      setModal(false)
      cargar()
    } catch (e) {
      toast.error('Error al guardar la cita')
    } finally { setGuardando(false) }
  }

  const estadoColor = {
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    CONFIRMADA: 'bg-green-100 text-green-700',
    REALIZADA: 'bg-blue-100 text-blue-700',
    CANCELADA: 'bg-red-100 text-red-700',
    NO_ASISTIO: 'bg-gray-100 text-gray-700',
  }

  return (
    <Layout titulo="Calendario Clínico">

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {Object.entries({ consulta: 'Consulta', terapia: 'Terapia', evaluacion: 'Evaluación' }).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORES[k] }} />{v}
            </span>
          ))}
        </div>
        <button
          onClick={() => abrirNueva({})}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition text-sm"
        >
          <Plus className="w-4 h-4" /> Nueva Cita
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          selectable
          editable
          events={citas}
          dateClick={abrirNueva}
          eventClick={(info) => setModalDetalle(info.event.extendedProps)}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="75vh"
        />
      </div>

      {/* Modal detalle cita */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">Detalle de Cita</h3>
              <button onClick={() => setModalDetalle(null)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">{modalDetalle.paciente_nombre || 'Paciente'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span className="text-sm">{modalDetalle.fecha_cita} · {modalDetalle.hora_inicio} - {modalDetalle.hora_fin}</span>
              </div>
              {modalDetalle.estado_cita && (
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${estadoColor[modalDetalle.estado_cita.toUpperCase()] || 'bg-gray-100 text-gray-600'}`}>
                  {modalDetalle.estado_cita}
                </span>
              )}
              {modalDetalle.observaciones && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{modalDetalle.observaciones}</p>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => abrirEditar(modalDetalle)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition text-sm"
              >
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => eliminar(modalDetalle.id_cita)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-100 transition text-sm"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar cita */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">{editandoId ? 'Editar Cita' : 'Nueva Cita'}</h3>
              <button onClick={() => setModal(false)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={guardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paciente</label>
                <select value={form.paciente} onChange={e => setForm({...form, paciente: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombre_completo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Psicólogo</label>
                <select value={form.psicologo} onChange={e => setForm({...form, psicologo: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                  <option value="">Seleccionar psicólogo</option>
                  {psicologos.map(p => <option key={p.id_psicologo} value={p.id_psicologo}>{p.nombre_completo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hora inicio</label>
                  <input type="time" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hora fin</label>
                  <input type="time" value={form.hora_fin} onChange={e => setForm({...form, hora_fin: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                  <option value="consulta">Consulta</option>
                  <option value="terapia">Terapia</option>
                  <option value="evaluacion">Evaluación</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas</label>
                <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : editandoId ? 'Actualizar' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  )
}
