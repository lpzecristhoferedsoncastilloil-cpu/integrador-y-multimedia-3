import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Plus, Search, Edit2, Trash2, Loader2, X, Users, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import GameLevelEditor from './games/GameLevelEditor'

const VACIO_PACIENTE = {
  nombre_completo: '', fecha_nacimiento: '', genero: 'masculino',
  telefono: '', correo_electronico: '', colegio_ocupacion: '',
  motivo_consulta: '', observaciones_generales: '', id_psicologo: ''
}

const VACIO_TUTOR = {
  nombre_completo: '', relacion: 'padre', telefono: '',
  correo_electronico: '', ci: ''
}

function calcularEdad(fechaNac) {
  if (!fechaNac) return null
  const hoy = new Date()
  const nac = new Date(fechaNac)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [psicologos, setPsicologos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO_PACIENTE)
  const [tutor, setTutor] = useState(VACIO_TUTOR)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editorPatientId, setEditorPatientId] = useState(null)

  const esMenor = calcularEdad(form.fecha_nacimiento) !== null && calcularEdad(form.fecha_nacimiento) <= 17

  const cargar = async () => {
    setCargando(true)
    try {
      const [p, ps] = await Promise.all([
        api.get('/pacientes/'),
        api.get('/psicologos-lista/')
      ])
      setPacientes(p.data.results || p.data || [])
      setPsicologos(ps.data || [])
    } catch (err) {
      console.error('Error:', err)
      setPacientes([])
      setPsicologos([])
    } finally {
      setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirModal = (paciente = null) => {
    setEditando(paciente)
    setForm(paciente ? {
      nombre_completo: paciente.nombre_completo || '',
      fecha_nacimiento: paciente.fecha_nacimiento || '',
      genero: paciente.genero || 'masculino',
      telefono: paciente.telefono || '',
      correo_electronico: paciente.correo_electronico || '',
      colegio_ocupacion: paciente.colegio_ocupacion || '',
      motivo_consulta: paciente.motivo_consulta || '',
      observaciones_generales: paciente.observaciones_generales || '',
      id_psicologo: paciente.id_psicologo || '',
    } : VACIO_PACIENTE)
    setTutor(VACIO_TUTOR)
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (esMenor && !tutor.nombre_completo) {
      toast.error('El paciente es menor de edad. Debes completar los datos del padre/tutor.')
      return
    }
    setGuardando(true)
    try {
      let pacienteGuardado
      if (editando) {
        const { data } = await api.patch(`/pacientes/${editando.id_paciente}/`, form)
        pacienteGuardado = data
        toast.success('Paciente actualizado')
      } else {
        const { data } = await api.post('/pacientes/', form)
        pacienteGuardado = data
        toast.success('Paciente registrado')
      }

      // Si es menor, guardar datos del padre/tutor
      if (esMenor && tutor.nombre_completo) {
        await api.post('/padres/', {
          id_paciente: pacienteGuardado.id_paciente,
          nombre_completo: tutor.nombre_completo,
          parentesco: tutor.relacion,
          telefono: tutor.telefono,
          correo_electronico: tutor.correo_electronico,
          direccion: ''
        }).catch((err) => {
          console.error('Error al guardar tutor:', err)
        })
      }

      setModal(false)
      cargar()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : 'Error al guardar')
    } finally { setGuardando(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este paciente?')) return
    try {
      await api.delete(`/pacientes/${id}/`)
      toast.success('Paciente eliminado')
      cargar()
    } catch { toast.error('Error al eliminar') }
  }

  const filtrados = pacientes.filter(p =>
    p.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const edadPaciente = calcularEdad(form.fecha_nacimiento)

  return (
    <Layout titulo="Pacientes">

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
          />
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Paciente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Paciente', 'Edad', 'Género', 'Teléfono', 'Psicólogo', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  {pacientes.length === 0 ? 'No hay pacientes registrados aún' : 'No se encontraron resultados'}
                </td></tr>
              ) : filtrados.map((p) => (
                <tr key={p.id_paciente} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {p.nombre_completo?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{p.nombre_completo}</p>
                        <p className="text-xs text-gray-400">{p.correo_electronico || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {p.edad_actual || (p.fecha_nacimiento ? calcularEdad(p.fecha_nacimiento) : '—')} años
                    {(p.edad_actual || calcularEdad(p.fecha_nacimiento)) <= 17 && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Menor</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${p.genero === 'masculino' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {p.genero}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.telefono || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.psicologo_nombre || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setEditorPatientId(p.id_paciente)} title="Personalizar Niveles de Juego" className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-100 transition">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => abrirModal(p)} className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => eliminar(p.id_paciente)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">{editando ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
              <button onClick={() => setModal(false)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={guardar} className="p-6 space-y-5">

              {/* Datos del paciente */}
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Datos del Paciente</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo *</label>
                    <input value={form.nombre_completo} onChange={e => setForm({...form, nombre_completo: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha de Nacimiento *</label>
                      <input type="date" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                      {edadPaciente !== null && (
                        <p className={`text-xs mt-1 font-medium ${esMenor ? 'text-orange-500' : 'text-green-600'}`}>
                          {edadPaciente} años {esMenor ? '— Menor de edad' : '— Mayor de edad'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Género *</label>
                      <select value={form.genero} onChange={e => setForm({...form, genero: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
                      <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo</label>
                      <input type="email" value={form.correo_electronico} onChange={e => setForm({...form, correo_electronico: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Colegio / Ocupación</label>
                    <input value={form.colegio_ocupacion} onChange={e => setForm({...form, colegio_ocupacion: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Motivo de Consulta</label>
                    <textarea value={form.motivo_consulta} onChange={e => setForm({...form, motivo_consulta: e.target.value})} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Psicólogo Asignado *</label>
                    <select value={form.id_psicologo} onChange={e => setForm({...form, id_psicologo: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                      <option value="">Seleccionar psicólogo</option>
                      {psicologos.length === 0 && <option disabled>Cargando...</option>}
                      {psicologos.map(ps => (
                        <option key={ps.id_psicologo} value={ps.id_psicologo}>{ps.nombre_completo}</option>
                      ))}
                    </select>
                    {psicologos.length === 0 && (
                      <p className="text-xs text-orange-500 mt-1">No hay psicólogos registrados. Ve a Configuración para agregar uno.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección padre/tutor — aparece automáticamente si es menor */}
              {esMenor && (
                <div className="border-2 border-orange-200 rounded-2xl p-5 bg-orange-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-orange-500" />
                    <p className="text-sm font-bold text-orange-700">Datos del Padre / Tutor Legal</p>
                    <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-semibold">Obligatorio — Menor de edad</span>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo *</label>
                        <input value={tutor.nombre_completo} onChange={e => setTutor({...tutor, nombre_completo: e.target.value})} required={esMenor} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Relación con el paciente *</label>
                        <select value={tutor.relacion} onChange={e => setTutor({...tutor, relacion: e.target.value})} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                          <option value="padre">Padre</option>
                          <option value="madre">Madre</option>
                          <option value="tutor">Tutor Legal</option>
                          <option value="abuelo">Abuelo/a</option>
                          <option value="tio">Tío/a</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">CI / Documento</label>
                        <input value={tutor.ci} onChange={e => setTutor({...tutor, ci: e.target.value})} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono *</label>
                        <input value={tutor.telefono} onChange={e => setTutor({...tutor, telefono: e.target.value})} required={esMenor} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                      <input type="email" value={tutor.correo_electronico} onChange={e => setTutor({...tutor, correo_electronico: e.target.value})} className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editorPatientId && (
        <GameLevelEditor
          patientId={editorPatientId}
          onClose={() => setEditorPatientId(null)}
        />
      )}

    </Layout>
  )
}
