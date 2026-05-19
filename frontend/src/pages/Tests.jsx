import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Plus, FileText, Loader2, X, Upload, Trash2, Download, CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Tests() {
  const [tests, setTests] = useState([])
  const [expandido, setExpandido] = useState(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ titulo_test: '', descripcion_test: '', categoria_test: 'fonologico', tipo_test: 'evaluacion', observaciones_test: '' })
  const [archivos, setArchivos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const inputRef = useRef()

  const cargar = async () => {
    try {
      const { data } = await api.get('/tests/')
      setTests(data.results || data)
    } catch { toast.error('Error al cargar tests') }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const handleArchivos = (e) => {
    const nuevos = Array.from(e.target.files)
    setArchivos(prev => [...prev, ...nuevos])
  }

  const quitarArchivo = (idx) => {
    setArchivos(prev => prev.filter((_, i) => i !== idx))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      // Necesita id_psicologo — usamos el del usuario logueado
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      const payload = { ...form, id_psicologo: usuario.id_usuario || 1 }
      const { data: testCreado } = await api.post('/tests/', payload)

      // Subir archivos si hay
      for (const archivo of archivos) {
        const fd = new FormData()
        fd.append('id_test', testCreado.id_test)
        fd.append('nombre_archivo', archivo.name)
        fd.append('tipo_archivo', archivo.type || 'otro')
        fd.append('archivo', archivo)
        await api.post('/test-archivos/', fd).catch(() => {})
      }

      toast.success('Test creado correctamente')
      setModal(false)
      setArchivos([])
      cargar()
    } catch (err) {
      toast.error('Error al guardar el test')
    } finally { setGuardando(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este test?')) return
    try {
      await api.delete(`/tests/${id}/`)
      toast.success('Test eliminado')
      cargar()
    } catch { toast.error('Error al eliminar') }
  }

  const CATEGORIAS = {
    fonologico: { label: 'Fonológico', color: 'bg-indigo-100 text-indigo-700' },
    cognitivo: { label: 'Cognitivo', color: 'bg-purple-100 text-purple-700' },
    lectura: { label: 'Lectura', color: 'bg-blue-100 text-blue-700' },
    escritura: { label: 'Escritura', color: 'bg-green-100 text-green-700' },
  }

  const iconArchivo = (nombre) => {
    const ext = nombre?.split('.').pop()?.toLowerCase()
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️'
    if (['pdf'].includes(ext)) return '📄'
    if (['mp3','wav','ogg'].includes(ext)) return '🎵'
    if (['mp4','avi','mov'].includes(ext)) return '🎬'
    if (['doc','docx'].includes(ext)) return '📝'
    if (['xls','xlsx'].includes(ext)) return '📊'
    return '📎'
  }

  return (
    <Layout titulo="Tests Clínicos">

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{tests.length} tests disponibles</p>
        <button
          onClick={() => { setForm({ titulo_test: '', descripcion_test: '', categoria_test: 'fonologico', tipo_test: 'evaluacion', observaciones_test: '' }); setArchivos([]); setModal(true) }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Test
        </button>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {tests.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No hay tests creados aún</p>
            </div>
          )}
          {tests.map(test => (
            <div key={test.id_test} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{test.titulo_test}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORIAS[test.categoria_test]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {CATEGORIAS[test.categoria_test]?.label || test.categoria_test}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{test.descripcion_test || 'Sin descripción'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(test.archivos?.length || 0)} archivos · {test.psicologo_nombre || 'Sin psicólogo'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandido(expandido === test.id_test ? null : test.id_test)}
                    className="w-8 h-8 bg-gray-50 text-gray-500 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    {expandido === test.id_test ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => eliminar(test.id_test)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandido === test.id_test && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  {test.archivos?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Archivos Adjuntos</p>
                      <div className="space-y-2">
                        {test.archivos.map((arc) => (
                          <div key={arc.id_test_archivo} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{iconArchivo(arc.nombre_archivo)}</span>
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{arc.nombre_archivo}</span>
                            </div>
                            {arc.ruta_archivo && (
                              <a
                                href={`http://127.0.0.1:8000${arc.ruta_archivo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
                              >
                                <Download className="w-3.5 h-3.5" /> Descargar
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {test.observaciones_test && (
                    <p className="text-sm text-gray-500 bg-white rounded-xl p-3">{test.observaciones_test}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo test */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">Nuevo Test</h3>
              <button onClick={() => setModal(false)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={guardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título del Test</label>
                <input value={form.titulo_test} onChange={e => setForm({...form, titulo_test: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Ej: Test de Conciencia Fonológica" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoría</label>
                  <select value={form.categoria_test} onChange={e => setForm({...form, categoria_test: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                    <option value="fonologico">Fonológico</option>
                    <option value="cognitivo">Cognitivo</option>
                    <option value="lectura">Lectura</option>
                    <option value="escritura">Escritura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
                  <select value={form.tipo_test} onChange={e => setForm({...form, tipo_test: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                    <option value="evaluacion">Evaluación</option>
                    <option value="diagnostico">Diagnóstico</option>
                    <option value="seguimiento">Seguimiento</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción</label>
                <textarea value={form.descripcion_test} onChange={e => setForm({...form, descripcion_test: e.target.value})} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observaciones</label>
                <textarea value={form.observaciones_test} onChange={e => setForm({...form, observaciones_test: e.target.value})} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>

              {/* Subida de archivos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Archivos adjuntos</label>
                <div
                  onClick={() => inputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
                >
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Haz clic o arrastra archivos aquí</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, imágenes, audio, video, Word, Excel — sin límite</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={handleArchivos}
                  className="hidden"
                />
                {archivos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {archivos.map((archivo, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-lg">{iconArchivo(archivo.name)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{archivo.name}</p>
                          <p className="text-xs text-gray-400">{(archivo.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={() => quitarArchivo(idx)} className="w-6 h-6 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Crear Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  )
}
