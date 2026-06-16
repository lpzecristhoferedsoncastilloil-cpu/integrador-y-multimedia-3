import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { 
  Plus, FileText, Loader2, X, Download, Printer, 
  Calendar, Check, User, Clock, AlertTriangle, BookOpen, 
  TrendingUp, CheckSquare, Square, AlertCircle, Volume2, Brain
} from 'lucide-react'
import toast from 'react-hot-toast'

const OBSERVATION_LABELS = {
  silabeo: "Silabeo",
  rectificaciones: "Rectificaciones/Autocorrecciones",
  vacilaciones: "Hesitaciones/Vacilaciones",
  silencios_prolongados: "Silencios prolongados",
  inversiones: "Inversiones de grafemas",
  sustituciones: "Sustituciones",
  omisiones: "Omisiones",
  adiciones: "Adiciones",
  rotaciones: "Rotaciones",
  perdida_renglon: "Pérdida de renglón",
  subvocalizacion: "Subvocalización",
  fatiga: "Fatiga o frustración"
}

export default function Reportes() {
  const { usuario } = useAuth()
  const [activeTab, setActiveTab] = useState('creador') // 'creador' | 'historial'
  
  // Lista general para selectores
  const [reportes, setReportes] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [psicologos, setPsicologos] = useState([])
  const [cargandoListas, setCargandoListas] = useState(true)
  
  // Modales antiguos
  const [modalManual, setModalManual] = useState(false)
  const [detalleModal, setDetalleModal] = useState(null)
  const [formManual, setFormManual] = useState({ paciente: '', psicologo: '', tipo: 'progreso', contenido: '' })
  const [guardandoManual, setGuardandoManual] = useState(false)

  // Creador de Reporte Clínico Consolidado
  const [selectedPacienteId, setSelectedPacienteId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [cargandoReporte, setCargandoReporte] = useState(false)
  const [reportData, setReportData] = useState(null)
  
  // Control de Secciones a Exportar en el PDF
  const [sections, setSections] = useState({
    generalInfo: true,
    antecedentes: true,
    testDislexia: true,
    juegosProgreso: true,
    citasClinicas: true,
    notasSeguimiento: true,
    notasAdicionales: true
  })
  
  // Nueva Nota Adicional
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardandoNota, setGuardandoNota] = useState(false)

  // Cargar listas iniciales
  const cargarListas = async () => {
    try {
      const [r, p, ps] = await Promise.all([
        api.get('/reportes/'),
        api.get('/pacientes/'),
        api.get('/psicologos/'),
      ])
      setReportes(r.data.results || r.data)
      setPacientes(p.data.results || p.data)
      setPsicologos(ps.data.results || ps.data)
      
      // Auto-seleccionar paciente si hay
      const pacs = p.data.results || p.data
      if (pacs.length > 0) {
        const pac6 = pacs.find(pat => pat.id_paciente === 6)
        setSelectedPacienteId(pac6 ? '6' : pacs[0].id_paciente.toString())
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al cargar datos generales')
    } finally {
      setCargandoListas(false)
    }
  }

  useEffect(() => {
    cargarListas()
  }, [])

  // Cargar reporte clínico consolidado
  const cargarReporteConsolidado = async () => {
    if (!selectedPacienteId) return
    setCargandoReporte(true)
    try {
      let url = `/reportes/compile-report/?paciente_id=${selectedPacienteId}`
      if (dateFrom) url += `&date_from=${dateFrom}`
      if (dateTo) url += `&date_to=${dateTo}`
      
      const res = await api.get(url)
      setReportData(res.data)
    } catch (e) {
      console.error(e)
      toast.error('Error al compilar el informe clínico')
    } finally {
      setCargandoReporte(false)
    }
  }

  useEffect(() => {
    cargarReporteConsolidado()
  }, [selectedPacienteId, dateFrom, dateTo])

  // Guardar Nota Adicional
  const handleGuardarNota = async () => {
    if (!nuevaNota.trim()) {
      toast.error('La nota no puede estar vacía')
      return
    }
    setGuardandoNota(true)
    try {
      await api.post('/reportes/compile-report/', {
        paciente_id: selectedPacienteId,
        descripcion: nuevaNota,
        titulo: 'Nota de Reporte Clínico',
        psicologo_id: usuario?.id_usuario // Utiliza el ID del psicólogo logueado
      })
      toast.success('Nota clínica añadida al reporte')
      setNuevaNota('')
      cargarReporteConsolidado() // Recargar datos
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar la nota')
    } finally {
      setGuardandoNota(false)
    }
  }

  // Ejecutar impresión
  const handlePrint = () => {
    const originalTitle = document.title
    const pacienteNombre = reportData?.paciente?.nombre_completo || 'Paciente'
    document.title = `Reporte de ${pacienteNombre}`
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

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

  const guardarReporteManual = async (e) => {
    e.preventDefault()
    setGuardandoManual(true)
    
    const pac = pacientes.find(p => p.id_paciente == formManual.paciente)
    const payload = {
      id_psicologo: formManual.psicologo,
      titulo_reporte: `Reporte de ${formManual.tipo} - ${pac?.nombre_completo || 'General'}`,
      descripcion_reporte: JSON.stringify({
        paciente_id: formManual.paciente,
        paciente_nombre: pac?.nombre_completo || 'Sin especificar',
        tipo: formManual.tipo,
        contenido: formManual.contenido
      })
    }

    try {
      await api.post('/reportes/', payload)
      toast.success('Reporte guardado con éxito')
      setModalManual(false)
      setFormManual({ paciente: '', psicologo: '', tipo: 'progreso', contenido: '' })
      cargarListas()
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar el reporte')
    } finally { setGuardandoManual(false) }
  }

  const toggleSection = (sec) => {
    setSections(prev => ({ ...prev, [sec]: !prev[sec] }))
  }

  const getBaremoColorClass = (baremo) => {
    if (!baremo) return 'bg-gray-100 text-gray-700 border-gray-200'
    const b = baremo.toUpperCase()
    if (b.includes('NORMAL')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (b.includes('DUDAS') || b.includes('LEVE')) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }

  const getBackendUrl = (path) => {
    if (!path) return ''
    const base = (api.defaults.baseURL || 'http://127.0.0.1:8000/api').replace('/api', '')
    return `${base}${path}`
  }

  const TIPOS = {
    progreso: { label: 'Progreso', color: 'bg-indigo-100 text-indigo-700' },
    evaluacion: { label: 'Evaluación', color: 'bg-purple-100 text-purple-700' },
    sesion: { label: 'Sesión', color: 'bg-blue-100 text-blue-700' },
    alta: { label: 'Alta', color: 'bg-green-100 text-green-700' },
  }

  return (
    <Layout titulo="Informes Clínicos & Reportes">
      
      {/* Estilo CSS exclusivo para Impresión (Imita el formato de Ficha del PDF de PROLEC-R) */}
      <style>{`
        @media print {
          /* Reset de cuerpo */
          body {
            background: white !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
          }
          
          /* Ocultar elementos de layout global de la app */
          header, nav, aside, sidebar, footer,
          .no-print, .print\\:hidden,
          button, input, select, textarea, .sidebar-controls,
          .tab-buttons, .toast-container, .breadcrumbs,
          [class*="w-[260px]"], .w-\\[260px\\] {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }
          
          /* Remover el margen izquierdo del Sidebar en el layout principal */
          [class*="ml-[260px]"], .ml-\\[260px\\] {
            margin-left: 0 !important;
            padding-left: 0 !important;
          }
          
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Forzar que el reporte ocupe toda la página de impresión */
          #printable-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #111827 !important;
            visibility: visible !important;
          }
          
          #printable-report * {
            visibility: visible !important;
          }
          
          /* Separación de páginas profesional en impresión */
          .report-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border-bottom: 1px solid #e5e7eb !important;
            padding-bottom: 1.5rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          table {
            page-break-inside: avoid !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }
          
          th, td {
            border: 1px solid #d1d5db !important;
            padding: 8px !important;
          }
          
          @page {
            size: letter;
            margin: 1.6cm;
          }
        }
      `}</style>

      <div className="space-y-6 text-gray-800">
        
        {/* TAB BUTTONS (SCREEN MODE ONLY) */}
        <div className="flex border-b border-gray-200 gap-6 no-print">
          <button
            onClick={() => setActiveTab('creador')}
            className={`pb-3 font-bold text-sm transition ${
              activeTab === 'creador' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Creador de Informe Clínico Consolidado
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`pb-3 font-bold text-sm transition ${
              activeTab === 'historial' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Historial de Notas de Reportes
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑA: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="space-y-6 no-print">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">{reportes.length} notas guardadas en historial</p>
              <button
                onClick={() => setModalManual(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Crear Nota Manual
              </button>
            </div>

            {cargandoListas ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Paciente', 'Psicólogo', 'Tipo', 'Fecha', 'Acciones'].map(h => (
                        <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reportes.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-gray-400">No hay reportes generados</td></tr>
                    ) : reportes.map(r => {
                      const parsed = parsearReporte(r)
                      return (
                        <tr key={parsed.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <FileText className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{parsed.paciente}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{parsed.psicologo}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${TIPOS[parsed.tipo]?.color || 'bg-gray-100 text-gray-600'}`}>
                              {TIPOS[parsed.tipo]?.label || parsed.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {parsed.fecha ? new Date(parsed.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => setDetalleModal(parsed)}
                              className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition cursor-pointer"
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
          </div>
        )}

        {/* CONTENIDO DE PESTAÑA: CREADOR */}
        {activeTab === 'creador' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* SIDEBAR DE CONTROLES (SCREEN ONLY) */}
            <div className="w-full lg:w-80 space-y-6 no-print sidebar-controls">
              
              {/* SELECTOR DE PACIENTE */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Paciente a Evaluar</label>
                {cargandoListas ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                  </div>
                ) : (
                  <select
                    value={selectedPacienteId}
                    onChange={(e) => setSelectedPacienteId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="">Seleccione un paciente</option>
                    {pacientes.map(p => (
                      <option key={p.id_paciente} value={p.id_paciente}>
                        {p.nombre_completo}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* RANGO DE FECHAS */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1.5">Filtro de Fechas</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Desde:</label>
                    <input 
                      type="date" 
                      value={dateFrom} 
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Hasta:</label>
                    <input 
                      type="date" 
                      value={dateTo} 
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIONES A INCLUIR */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1.5">Secciones del Reporte</label>
                
                <div className="space-y-3">
                  {[
                    { id: 'generalInfo', label: '1. Datos de Identificación' },
                    { id: 'antecedentes', label: '2. Antecedentes y Observaciones' },
                    { id: 'testDislexia', label: '3. Resultados Test Dislexia' },
                    { id: 'juegosProgreso', label: '4. Progreso de Juegos' },
                    { id: 'citasClinicas', label: '5. Historial de Citas' },
                    { id: 'notasSeguimiento', label: '6. Notas de Seguimiento' },
                    { id: 'notasAdicionales', label: '7. Anotaciones Extra' }
                  ].map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => toggleSection(sec.id)}
                      className="flex items-center gap-3 w-full text-left text-xs font-semibold text-gray-600 hover:text-indigo-600 transition"
                    >
                      {sections[sec.id] ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                      <span>{sec.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTÓN EXPORTAR */}
              {reportData && (
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200 hover:scale-102 cursor-pointer text-sm"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Exportar a PDF
                </button>
              )}

            </div>

            {/* PREVIEW EN TIEMPO REAL */}
            <div className="flex-1 w-full">
              {cargandoReporte ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-100 rounded-3xl shadow-sm gap-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-gray-500 font-semibold text-sm">Compilando e integrando la información clínica...</p>
                </div>
              ) : !reportData ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 bg-white border border-gray-150 rounded-3xl p-8 shadow-sm">
                  <Brain className="w-12 h-12 text-indigo-300 mb-3 animate-pulse" />
                  <h4 className="text-gray-700 font-bold text-base">Generador Clínico Listo</h4>
                  <p className="text-xs max-w-xs mt-1">
                    Seleccione un paciente para estructurar e imprimir su informe formal de evolución y test dislexia.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 flex items-center gap-2 no-print">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <strong>Vista Previa Editable:</strong> Los datos compilados son de solo lectura. Puedes ocultar/mostrar secciones usando el panel izquierdo y agregar anotaciones personalizadas en la sección final antes de imprimir.
                  </p>

                  {/* HOJA DE REPORTE */}
                  <div 
                    id="printable-report" 
                    className="bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden max-w-4xl mx-auto print:border-none print:shadow-none print:rounded-none"
                  >
                    
                    {/* ENCABEZADO FORMAL DE LA CLÍNICA */}
                    <div className="bg-[#1e1b4b] text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-[#1e1b4b] print:text-white print:p-6">
                      <div>
                        <h2 className="text-base md:text-lg font-bold tracking-wide">CENTRO DE NEUROPSICOLOGÍA Y APRENDIZAJE INTEGRAL</h2>
                        <h3 className="text-xs font-semibold opacity-90 uppercase mt-0.5">Informe Clínico General y de Procesos Lectores</h3>
                      </div>
                      <div className="text-left md:text-right text-[10px] md:text-xs opacity-75 md:border-l md:border-white/20 md:pl-4">
                        <p><strong>Dr(a). Evaluador:</strong> {usuario?.nombre_usuario || 'Especialista a Cargo'}</p>
                        <p><strong>Fecha Emisión:</strong> {new Date().toLocaleDateString('es-ES')} — {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hrs</p>
                      </div>
                    </div>

                    <div className="p-8 space-y-8">

                      {/* 1. DATOS DE IDENTIFICACIÓN */}
                      {sections.generalInfo && (
                        <div className="report-section space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-900 rounded-sm inline-block" />
                            1. Datos de Identificación del Paciente
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-xs text-gray-700">
                            <div><strong className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Nombre Completo:</strong> <span className="font-semibold text-gray-900">{reportData.paciente.nombre_completo}</span></div>
                            <div><strong className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Fecha de Nacimiento:</strong> <span className="font-semibold text-gray-900">{reportData.paciente.fecha_nacimiento || 'No registrada'}</span></div>
                            <div><strong className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Edad Cronológica:</strong> <span className="font-semibold text-gray-900">{reportData.paciente.edad_actual || 'N/A'} años</span></div>
                            <div><strong className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Género:</strong> <span className="font-semibold text-gray-900">{reportData.paciente.genero}</span></div>
                            <div><strong className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Teléfono:</strong> <span className="font-semibold text-gray-900">{reportData.paciente.telefono || 'No registrado'}</span></div>
                            <div><strong className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Colegio / Ocupación:</strong> <span className="font-semibold text-gray-900">{reportData.paciente.colegio_ocupacion || 'No registrado'}</span></div>
                            <div className="md:col-span-2 lg:col-span-3"><strong className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Motivo de Consulta:</strong> <span className="font-semibold text-gray-800 leading-relaxed block mt-1">{reportData.paciente.motivo_consulta || 'No especificado'}</span></div>
                          </div>
                        </div>
                      )}

                      {/* 2. ANTECEDENTES Y DATOS EXTRA */}
                      {sections.antecedentes && (
                        <div className="report-section space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-900 rounded-sm inline-block" />
                            2. Motivo de Evaluación y Antecedentes Relevantes
                          </h4>
                          <div className="text-xs text-gray-700 leading-relaxed space-y-3">
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                              <p className="text-[10px] font-bold text-gray-450 uppercase mb-1.5">Observaciones Clínicas Generales y Consultas Externas:</p>
                              <p className="italic font-medium text-gray-800 whitespace-pre-wrap">
                                {reportData.paciente.observaciones_generales || 'No se registran antecedentes o consultas previas a otros psicólogos en la ficha del paciente.'}
                              </p>
                            </div>
                            <p className="text-gray-500 italic text-[10px]">
                              * La información anterior ha sido recopilada del perfil del paciente y representa los datos de antecedentes cargados en el sistema por el tutor o el profesional a cargo.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 3. RESULTADOS DEL TEST DE DISLEXIA */}
                      {sections.testDislexia && (
                        <div className="report-section space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-900 rounded-sm inline-block" />
                            3. Resultados Cuantitativos del Perfil Lector (Batería PROLEC-R)
                          </h4>
                          
                          {!reportData.latest_test ? (
                            <p className="text-xs text-gray-400 italic">No se registran evaluaciones formales del Test de Dislexia para este paciente en el periodo seleccionado.</p>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 gap-2">
                                <span className="text-xs font-bold text-indigo-900">
                                  Evaluación Diagnóstica: {reportData.latest_test.fecha} (Método: {reportData.latest_test.metodo})
                                </span>
                                <span className="px-3 py-1 bg-rose-100 border border-rose-200 text-rose-700 text-xs font-extrabold rounded-lg uppercase tracking-wider">
                                  Diagnóstico: {reportData.latest_test.diagnostico}
                                </span>
                              </div>

                              <table className="w-full text-left text-xs border border-gray-200">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                  <tr>
                                    <th className="p-3 font-bold">Prueba Aplicada / Proceso</th>
                                    <th className="p-3 font-bold text-center">Aciertos (Máx. 40)</th>
                                    <th className="p-3 font-bold text-center">Tiempo (Seg.)</th>
                                    <th className="p-3 font-bold text-center">Índice Calculado (IL)</th>
                                    <th className="p-3 font-bold text-right">Rango de Desviación Clínico</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-700">
                                  <tr>
                                    <td className="p-3 font-bold text-gray-900">Lectura de Palabras (Ruta Visual)</td>
                                    <td className="p-3 text-center">{reportData.latest_test.a_p}</td>
                                    <td className="p-3 text-center">{reportData.latest_test.t_p}s</td>
                                    <td className="p-3 text-center font-bold text-indigo-600">{reportData.latest_test.il_p}</td>
                                    <td className="p-3 text-right">
                                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase ${getBaremoColorClass(reportData.latest_test.r_p)}`}>
                                        {reportData.latest_test.r_p}
                                      </span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-bold text-gray-900">Lectura de Pseudopalabras (Ruta Fonológica)</td>
                                    <td className="p-3 text-center">{reportData.latest_test.a_ps}</td>
                                    <td className="p-3 text-center">{reportData.latest_test.t_ps}s</td>
                                    <td className="p-3 text-center font-bold text-indigo-600">{reportData.latest_test.il_ps}</td>
                                    <td className="p-3 text-right">
                                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase ${getBaremoColorClass(reportData.latest_test.r_ps)}`}>
                                        {reportData.latest_test.r_ps}
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              
                              {/* Transcripción Literal Verbatim */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="border border-gray-150 rounded-xl p-3 bg-gray-50/50">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Transcripción Palabras:</p>
                                  <p className="text-xs font-semibold italic text-gray-800 whitespace-pre-wrap">{reportData.latest_test.transcripcion_p || '(Vacio)'}</p>
                                </div>
                                <div className="border border-gray-150 rounded-xl p-3 bg-gray-50/50">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Transcripción Pseudopalabras:</p>
                                  <p className="text-xs font-semibold italic text-gray-800 whitespace-pre-wrap">{reportData.latest_test.transcripcion_ps || '(Vacio)'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. PROGRESO DE JUEGOS */}
                      {sections.juegosProgreso && (
                        <div className="report-section space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-900 rounded-sm inline-block" />
                            4. Rendimiento en Juegos de Terapia y Progresión
                          </h4>
                          
                          {reportData.progreso_juegos.total_juegos === 0 ? (
                            <p className="text-xs text-gray-400 italic">No se registran datos de sesiones de juego en el periodo seleccionado.</p>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-xs text-gray-650">
                                A continuación se comparan el primer y el último intento de juego del paciente registrados en el sistema en el periodo seleccionado para evaluar el progreso neurocognitivo:
                              </p>
                              
                              <table className="w-full text-left text-xs border border-gray-200">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                  <tr>
                                    <th className="p-3 font-bold">Sesión Evaluada</th>
                                    <th className="p-3 font-bold">Juego Terapéutico</th>
                                    <th className="p-3 font-bold text-center">Correctas</th>
                                    <th className="p-3 font-bold text-center">Incorrectas</th>
                                    <th className="p-3 font-bold text-center">Precisión (%)</th>
                                    <th className="p-3 font-bold text-right">Fecha Sesión</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-700">
                                  {reportData.progreso_juegos.primer_juego && (
                                    <tr>
                                      <td className="p-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Primer Intento</td>
                                      <td className="p-3 font-semibold text-gray-900">{reportData.progreso_juegos.primer_juego.juego}</td>
                                      <td className="p-3 text-center">{reportData.progreso_juegos.primer_juego.correctas}</td>
                                      <td className="p-3 text-center">{reportData.progreso_juegos.primer_juego.incorrectas}</td>
                                      <td className="p-3 text-center font-bold text-rose-600">{reportData.progreso_juegos.primer_juego.precision}%</td>
                                      <td className="p-3 text-right">{reportData.progreso_juegos.primer_juego.fecha}</td>
                                    </tr>
                                  )}
                                  {reportData.progreso_juegos.ultimo_juego && (
                                    <tr>
                                      <td className="p-3 font-bold text-indigo-700 uppercase tracking-wider text-[10px]">Último Intento</td>
                                      <td className="p-3 font-semibold text-gray-900">{reportData.progreso_juegos.ultimo_juego.juego}</td>
                                      <td className="p-3 text-center">{reportData.progreso_juegos.ultimo_juego.correctas}</td>
                                      <td className="p-3 text-center">{reportData.progreso_juegos.ultimo_juego.incorrectas}</td>
                                      <td className="p-3 text-center font-bold text-emerald-600">{reportData.progreso_juegos.ultimo_juego.precision}%</td>
                                      <td className="p-3 text-right">{reportData.progreso_juegos.ultimo_juego.fecha}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                              
                              {/* Métrica de Mejora de Precisión */}
                              {reportData.progreso_juegos.primer_juego && reportData.progreso_juegos.ultimo_juego && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    <div>
                                      <p className="text-xs font-bold text-indigo-900">Evolución de Precisión de Lectura</p>
                                      <p className="text-[10px] text-indigo-600">Diferencia neta registrada entre el primer y último intento de juego.</p>
                                    </div>
                                  </div>
                                  <span className={`text-sm font-black px-3 py-1 rounded-lg ${
                                    (reportData.progreso_juegos.ultimo_juego.precision - reportData.progreso_juegos.primer_juego.precision) >= 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {((reportData.progreso_juegos.ultimo_juego.precision - reportData.progreso_juegos.primer_juego.precision) >= 0 ? '+' : '')}
                                    {Math.round(reportData.progreso_juegos.ultimo_juego.precision - reportData.progreso_juegos.primer_juego.precision)}% de precisión
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. CITAS PROGRAMADAS */}
                      {sections.citasClinicas && (
                        <div className="report-section space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-900 rounded-sm inline-block" />
                            5. Registro de Asistencias Clínicas
                          </h4>
                          
                          {reportData.citas.total_citas === 0 ? (
                            <p className="text-xs text-gray-400 italic">No se registran citas programadas en el rango de fechas seleccionado.</p>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs text-gray-650">
                                El paciente registra un historial de <strong>{reportData.citas.total_citas} citas</strong> en el consultorio:
                              </p>
                              
                              <table className="w-full text-left text-xs border border-gray-200">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                  <tr>
                                    <th className="p-3 font-bold">Fecha / Hora</th>
                                    <th className="p-3 font-bold">Título de la Cita</th>
                                    <th className="p-3 font-bold text-center">Estado</th>
                                    <th className="p-3 font-bold text-right">Observación Clínica</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-700">
                                  {reportData.citas.lista_citas.map((c) => (
                                    <tr key={c.id_cita}>
                                      <td className="p-3 font-semibold text-gray-900">{c.fecha_cita} ({c.hora_inicio})</td>
                                      <td className="p-3 text-gray-700">{c.titulo_cita}</td>
                                      <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          c.estado_cita?.toUpperCase() === 'COMPLETADA' || c.estado_cita?.toUpperCase() === 'PAGADO'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        }`}>
                                          {c.estado_cita || 'PROGRAMADA'}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right text-gray-500 italic max-w-xs truncate">{c.observaciones || 'Sin observaciones'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 6. NOTAS DE SEGUIMIENTO */}
                      {sections.notasSeguimiento && (
                        <div className="report-section space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-900 rounded-sm inline-block" />
                            6. Evolución Clínica Histórica (Notas de Seguimiento)
                          </h4>
                          
                          {reportData.notas_seguimiento.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No se registran notas de seguimiento guardadas para este paciente.</p>
                          ) : (
                            <div className="space-y-4">
                              {reportData.notas_seguimiento.map((nota) => (
                                <div key={nota.id_nota} className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 space-y-2">
                                  <div className="flex justify-between items-center border-b pb-1.5">
                                    <span className="text-xs font-bold text-gray-700">{nota.titulo_nota}</span>
                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {nota.fecha_nota} — por Dr(a). {nota.psicologo_nombre}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-650 leading-relaxed whitespace-pre-wrap">{nota.descripcion_nota}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 7. ANOTACIONES ADICIONALES DEL INFORME */}
                      {sections.notasAdicionales && (
                        <div className="report-section space-y-4">
                          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-indigo-900 rounded-sm inline-block" />
                            7. Anotaciones Especiales Clínicas de este Informe
                          </h4>
                          
                          <div className="space-y-4">
                            {/* Notas del informe ya guardadas */}
                            {!reportData.notas_reporte || reportData.notas_reporte.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">No se han ingresado observaciones adicionales específicas para este reporte.</p>
                            ) : (
                              <div className="space-y-3">
                                {reportData.notas_reporte.map((nota) => (
                                  <div key={nota.id_nota} className="border-l-4 border-indigo-600 bg-indigo-50/20 p-4 rounded-r-xl space-y-1">
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                                      <span>ANOTACIÓN CLÍNICA ADICIONAL</span>
                                      <span>{nota.fecha_nota} — por Dr(a). {nota.psicologo_nombre}</span>
                                    </div>
                                    <p className="text-xs text-gray-750 font-medium leading-relaxed whitespace-pre-wrap">{nota.descripcion_nota}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Formulario de Adición (SCREEN ONLY) */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 no-print">
                              <label className="block text-xs font-bold text-gray-700 uppercase">Añadir Anotación Extra al Reporte:</label>
                              <textarea
                                value={nuevaNota}
                                onChange={(e) => setNuevaNota(e.target.value)}
                                rows={3}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-gray-800"
                                placeholder="Escriba comentarios u observaciones clínicas adicionales para incluir al final del reporte..."
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={handleGuardarNota}
                                  disabled={guardandoNota || !nuevaNota.trim()}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                                >
                                  {guardandoNota ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Plus className="w-3.5 h-3.5" />
                                  )}
                                  Guardar Nota Adicional
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FIRMAS FINALES DE CONFORMIDAD */}
                      <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
                        <div className="report-section-signature border-t border-gray-300 pt-3 flex flex-col items-center">
                          <p className="font-extrabold text-gray-800 uppercase">
                            Dr(a). {reportData.notas_seguimiento[0]?.psicologo_nombre || usuario?.nombre_usuario || 'Especialista a Cargo'}
                          </p>
                          <p className="text-gray-400 font-semibold text-[10px] mt-0.5">Neuropsicólogo Clínico</p>
                          <p className="text-[10px] text-gray-400">Reg. Profesional Nº 44102</p>
                        </div>
                        
                        <div className="report-section-signature border-t border-gray-300 pt-3 flex flex-col items-center">
                          <p className="font-extrabold text-gray-800 uppercase">Dirección del Servicio Clínico</p>
                          <p className="text-gray-400 font-semibold text-[10px] mt-0.5">Área de Neurodesarrollo Infantil</p>
                          <p className="text-[10px] text-gray-400">Centro de Aprendizaje Integral</p>
                        </div>
                      </div>

                    </div>
                    
                    {/* CONFIDENCIAL / PIE DE PÁGINA */}
                    <div className="bg-gray-50 border-t border-gray-100 p-4 text-center text-[10px] text-gray-400 flex justify-between items-center print:bg-white print:border-t print:border-gray-200">
                      <span>Confidencial — Historia Clínica Neuropsicológica</span>
                      <span>NeuroGym © 2026</span>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Modal Detalle Reporte Antiguo */}
      {detalleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button onClick={() => setDetalleModal(null)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition cursor-pointer">
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

      {/* Modal Crear Reporte Manual Antiguo */}
      {modalManual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">Nuevo Reporte Manual</h3>
              <button onClick={() => setModalManual(false)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={guardarReporteManual} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paciente</label>
                <select value={formManual.paciente} onChange={e => setFormManual({...formManual, paciente: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white cursor-pointer">
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombre_completo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Psicólogo</label>
                <select value={formManual.psicologo} onChange={e => setFormManual({...formManual, psicologo: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white cursor-pointer">
                  <option value="">Seleccionar psicólogo</option>
                  {psicologos.map(p => <option key={p.id_psicologo} value={p.id_psicologo}>{p.nombre_completo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Reporte</label>
                <select value={formManual.tipo} onChange={e => setFormManual({...formManual, tipo: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white cursor-pointer">
                  <option value="progreso">Progreso</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="sesion">Sesión</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contenido</label>
                <textarea value={formManual.contenido} onChange={e => setFormManual({...formManual, contenido: e.target.value})} required rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Descripción del reporte clínico..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalManual(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition text-sm cursor-pointer">Cancelar</button>
                <button type="submit" disabled={guardandoManual} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2 cursor-pointer">
                  {guardandoManual ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Generar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  )
}
