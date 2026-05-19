import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Plus, FileText, Loader2, X, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Reportes() {
  const [reportes, setReportes] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [psicologos, setPsicologos] = useState([])
  const [modal, setModal] = useState(false)
  const [detalleModal, setDetalleModal] = useState(null)
  const [form, setForm] = useState({ paciente: '', psicologo: '', tipo: 'progreso', contenido: '' })
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const cargar = async () => {
    try {
      const [r, p, ps] = await Promise.all([
        api.get('/reportes/'),
        api.get('/pacientes/'),
        api.get('/psicologos/'),
      ])
      setReportes(r.data.results || r.data)
      setPacientes(p.data.results || p.data)
      setPsicologos(ps.data.results || ps.data)
    } catch (e) {
      console.error(e)
      toast.error('Error al cargar reportes')
    } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const parsearReporte = (r) => {
    try {
      const data = JSON.parse(r.descripcion_reporte)
      return {
        id: r.id_reporte,
        paciente: data.paciente_nombre || `Paciente #${data.paciente_id}`,
        psicologo: r.psicologo_nombre || `Psicólogo #${r.id_psicologo}`,
        tipo: data.tipo || 'progreso',
        contenido: data.contenido || r.descripcion_reporte,
        fecha: r.fecha_generacion,
      }
    } catch (e) {
      return {
        id: r.id_reporte,
        paciente: r.titulo_reporte || 'Reporte General',
        psicologo: r.psicologo_nombre || `Psicólogo #${r.id_psicologo}`,
        tipo: 'evaluacion',
        contenido: r.descripcion_reporte || 'Sin descripción',
        fecha: r.fecha_generacion,
      }
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    
    const pac = pacientes.find(p => p.id_paciente == form.paciente)
    const payload = {
      id_psicologo: form.psicologo,
      titulo_reporte: `Reporte de ${form.tipo} - ${pac?.nombre_completo || 'General'}`,
      descripcion_reporte: JSON.stringify({
        paciente_id: form.paciente,
        paciente_nombre: pac?.nombre_completo || 'Sin especificar',
        tipo: form.tipo,
        contenido: form.contenido
      })
    }

    try {
      await api.post('/reportes/', payload)
      toast.success('Reporte generado con éxito')
      setModal(false)
      setForm({ paciente: '', psicologo: '', tipo: 'progreso', contenido: '' })
      cargar()
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar el reporte')
    } finally { setGuardando(false) }
  }

  const TIPOS = {
    progreso: { label: 'Progreso', color: 'bg-indigo-100 text-indigo-700' },
    evaluacion: { label: 'Evaluación', color: 'bg-purple-100 text-purple-700' },
    sesion: { label: 'Sesión', color: 'bg-blue-100 text-blue-700' },
    alta: { label: 'Alta', color: 'bg-green-100 text-green-700' },
  }

  return (
    <Layout titulo="Reportes Clínicos">

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{reportes.length} reportes generados</p>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Reporte
        </button>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Paciente', 'Psicólogo', 'Tipo', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportes.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No hay reportes generados</td></tr>
              ) : reportes.map(r => {
                const parsed = parsearReporte(r)
                return (
                  <tr key={parsed.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{parsed.paciente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{parsed.psicologo}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${TIPOS[parsed.tipo]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {TIPOS[parsed.tipo]?.label || parsed.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {parsed.fecha ? new Date(parsed.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setDetalleModal(parsed)}
                        className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalle Reporte */}
      {detalleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button onClick={() => setDetalleModal(null)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-bold mb-4">Detalle del Reporte</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Paciente</span>
                <p className="text-sm font-semibold text-gray-800">{detalleModal.paciente}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Psicólogo</span>
                <p className="text-sm text-gray-700">{detalleModal.psicologo}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Tipo</span>
                <div>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${TIPOS[detalleModal.tipo]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {TIPOS[detalleModal.tipo]?.label || detalleModal.tipo}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Fecha</span>
                <p className="text-sm text-gray-700">{detalleModal.fecha ? new Date(detalleModal.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Contenido</span>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {detalleModal.contenido}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Reporte */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">Nuevo Reporte</h3>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Reporte</label>
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                  <option value="progreso">Progreso</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="sesion">Sesión</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contenido</label>
                <textarea value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} required rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Descripción del reporte clínico..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Generar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  )
}
