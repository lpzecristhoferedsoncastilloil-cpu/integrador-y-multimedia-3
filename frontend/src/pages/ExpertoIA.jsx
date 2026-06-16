import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  Cpu, Download, FileText, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, BarChart3, BookOpen, User, Sparkles, Loader2,
  X, AlertCircle, Volume2
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

export default function ExpertoIA() {
  const [pacientes, setPacientes] = useState([])
  const [selectedPacienteId, setSelectedPacienteId] = useState('')
  const [profile, setProfile] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoPacientes, setCargandoPacientes] = useState(true)
  
  // Estados para Modal del Test de Dislexia
  const [modalTestAbierto, setModalTestAbierto] = useState(false)
  const [historialTest, setHistorialTest] = useState([])
  const [cargandoHistorialTest, setCargandoHistorialTest] = useState(false)

  const abrirModalTest = async () => {
    if (!selectedPacienteId) return
    setModalTestAbierto(true)
    setCargandoHistorialTest(true)
    try {
      const res = await api.get(`/test-dislexia/historial/?paciente_id=${selectedPacienteId}`)
      setHistorialTest(res.data)
    } catch (e) {
      console.error('Error al cargar historial de test:', e)
      toast.error('No se pudo cargar el historial del test de dislexia')
    } finally {
      setCargandoHistorialTest(false)
    }
  }

  const getBackendUrl = (path) => {
    if (!path) return ''
    const base = (api.defaults.baseURL || 'http://127.0.0.1:8000/api').replace('/api', '')
    return `${base}${path}`
  }

  // Cargar lista de pacientes
  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const res = await api.get('/pacientes/')
        setPacientes(res.data)
        if (res.data.length > 0) {
          // Seleccionar el paciente 6 por defecto o el primero
          const pac6 = res.data.find(p => p.id_paciente === 6)
          setSelectedPacienteId(pac6 ? '6' : res.data[0].id_paciente.toString())
        }
      } catch (e) {
        console.error('Error al cargar pacientes:', e)
        toast.error('No se pudo cargar la lista de pacientes')
      } finally {
        setCargandoPacientes(false)
      }
    }
    cargarPacientes()
  }, [])

  // Cargar informe del paciente seleccionado
  useEffect(() => {
    if (!selectedPacienteId) return
    const cargarInforme = async () => {
      setCargando(true)
      try {
        const res = await api.get(`/experto-ia/?paciente_id=${selectedPacienteId}`)
        setProfile(res.data)
      } catch (e) {
        console.error('Error al cargar informe de experto:', e)
        toast.error('Error al cargar análisis del sistema experto')
      } finally {
        setCargando(false)
      }
    }
    cargarInforme()
  }, [selectedPacienteId])

  const handleDescargarExcel = () => {
    if (!selectedPacienteId) return
    const url = `${api.defaults.baseURL || 'http://127.0.0.1:8000/api'}/experto-ia/excel/?paciente_id=${selectedPacienteId}`
    window.open(url, '_blank')
    toast.success('Generando reporte Excel...')
  }

  // Estilo de badge de gravedad
  const getGravedadBadgeStyle = (gravedad) => {
    switch (gravedad) {
      case 'SEVERO':
        return { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5' }
      case 'MODERADO':
        return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' }
      case 'LEVE':
        return { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' }
      default:
        return { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' }
    }
  }

  return (
    <Layout titulo="Diagnóstico Experto de Dislexia (IA)">
      <div className="space-y-8 text-gray-800">
        
        {/* HEADER CON METADATOS Y ACCIÓN */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-6 h-6 text-indigo-600 animate-pulse" />
              <h2 className="text-xl font-bold text-gray-900">Análisis Cognitivo en Tiempo Real</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full">
                IA Activa
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Diagnóstico neurocognitivo de dislexia evolutiva y generación automática de material de terapia.
            </p>
          </div>

          {profile && profile.metricas.totales > 0 && (
            <button
              onClick={handleDescargarExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition duration-300 shadow-md hover:scale-102 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar Reporte Excel
            </button>
          )}
        </div>

        {/* SELECTOR DE PACIENTE */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <label htmlFor="paciente" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Filtrar por Paciente</label>
                <p className="text-xs text-gray-400">Ver historial clínico e inferencias cognitivas.</p>
              </div>
            </div>
            <div className="flex-1 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {cargandoPacientes ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando pacientes...
                </div>
              ) : (
                <>
                  <select
                    id="paciente"
                    value={selectedPacienteId}
                    onChange={(e) => setSelectedPacienteId(e.target.value)}
                    className="flex-1 max-w-[350px] bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    {pacientes.map((p) => (
                      <option key={p.id_paciente} value={p.id_paciente}>
                        {p.nombre_completo} (Edad: {p.edad_actual} años)
                      </option>
                    ))}
                  </select>
                  
                  {selectedPacienteId && (
                    <button
                      onClick={abrirModalTest}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition duration-300 border border-indigo-200 text-sm cursor-pointer hover:scale-102"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-600 animate-pulse" />
                      Ver Resultados Test Dislexia
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-gray-500 font-semibold text-sm">El Sistema Experto está analizando los intentos del paciente...</p>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            
            {/* FILA 1: GRAFICOS CIRCULARES E INFORME NARRATIVO */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* SECCIÓN PROBABILIDADES */}
              <div className="xl:col-span-2 space-y-6">
                
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Probabilidad de Patología por Ruta Lectora
                  </h3>
                  
                  {profile.metricas.totales > 0 && (
                    <div
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: getGravedadBadgeStyle(profile.diagnostico.nivel_gravedad).bg,
                        color: getGravedadBadgeStyle(profile.diagnostico.nivel_gravedad).text,
                        borderColor: getGravedadBadgeStyle(profile.diagnostico.nivel_gravedad).border,
                      }}
                    >
                      Riesgo {profile.diagnostico.nivel_gravedad}
                    </div>
                  )}
                </div>

                {profile.metricas.totales === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500 shadow-sm">
                    <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                    El paciente no tiene intentos de juego registrados todavía.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* FONOLOGICA */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm group hover:shadow-md transition duration-300">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-500" />
                      <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider mb-4">Dislexia Fonológica</span>
                      
                      <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="56"
                            cy="56"
                            r="46"
                            stroke="#06b6d4"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 46}
                            strokeDashoffset={2 * Math.PI * 46 * (1 - profile.diagnostico.fonologica_prob / 100)}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute text-2xl font-black text-gray-900">{profile.diagnostico.fonologica_prob}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Dificultad en ruta auditiva / decodificación de grafemas y rimas.</p>
                    </div>

                    {/* SUPERFICIAL */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm group hover:shadow-md transition duration-300">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
                      <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider mb-4">Dislexia Superficial</span>
                      
                      <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="56"
                            cy="56"
                            r="46"
                            stroke="#10b981"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 46}
                            strokeDashoffset={2 * Math.PI * 46 * (1 - profile.diagnostico.superficial_prob / 100)}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute text-2xl font-black text-gray-900">{profile.diagnostico.superficial_prob}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Dificultad en memoria visual de palabras y ortografía homófona.</p>
                    </div>

                    {/* MIXTA */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm group hover:shadow-md transition duration-300">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500" />
                      <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider mb-4">Dislexia Mixta</span>
                      
                      <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="56"
                            cy="56"
                            r="46"
                            stroke="#6366f1"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 46}
                            strokeDashoffset={2 * Math.PI * 46 * (1 - profile.diagnostico.mixta_prob / 100)}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute text-2xl font-black text-gray-900">{profile.diagnostico.mixta_prob}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Afectación general y combinada de los canales de lectura visual y fonético.</p>
                    </div>

                  </div>
                )}

                {/* MÉTRICAS DE RESUMEN */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-sm">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Intentos</p>
                      <p className="text-lg font-bold text-gray-900">{profile.metricas.totales}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Aciertos</p>
                      <p className="text-lg font-bold text-emerald-600">{profile.metricas.correctas}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Errores</p>
                      <p className="text-lg font-bold text-rose-600">{profile.metricas.incorrectas}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tiempo Medio</p>
                      <p className="text-lg font-bold text-gray-900">{profile.metricas.tiempo_medio}s</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* CARD DE INFORME NARRATIVO */}
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Síntesis Diagnóstica
                </h3>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex-1 flex flex-col relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-3 opacity-5">
                    <Sparkles className="w-24 h-24 text-indigo-600" />
                  </div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">Evaluación del Sistema Experto</h4>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                    {profile.diagnostico.narrativo}
                  </div>
                  
                  {profile.metricas.totales > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Inferencia validada con los intentos clínicos guardados.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* FILA 2: ANALÍTICA DE ERRORES Y MATERIAL TERAPÉUTICO */}
            {profile.metricas.totales > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* DESGLOSE DE CONFUSIONES POR LETRA */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Patrones de Error y Confusiones Detectadas
                  </h3>

                  {profile.analisis_errores.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      No se detectan patrones de confusión recurrentes en los fallos.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {profile.analisis_errores.map((err, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-700">{err.label}</span>
                            <span className="text-indigo-600 font-extrabold">{err.porcentaje}% ({err.cantidad} fallos)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-rose-500 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${err.porcentaje}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* EJERCICIOS CORRECTIVOS RECOMENDADOS */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Material Terapéutico Correctivo Sugerido
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Palabra Core</th>
                          <th className="pb-3 font-semibold text-center">Opciones (Distractores)</th>
                          <th className="pb-3 font-semibold">Juego Sugerido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {profile.ejercicios_recomendados.map((ex, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition duration-150">
                            <td className="py-3 font-bold text-gray-900 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                              {ex.palabra}
                            </td>
                            <td className="py-3 text-center font-extrabold text-indigo-600">
                              {ex.opciones.join(' / ')}
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium">
                                {ex.juego_recomendado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-3 text-xs leading-relaxed text-indigo-950">
                    <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 animate-pulse" />
                    <span>
                      <strong>Recomendación Terapéutica:</strong> Estos ejercicios correctivos entrenan la asimetría visual y el orden posicional de las grafías identificadas en conflicto.
                    </span>
                  </div>

                </div>

              </div>
            )}

            {/* HISTORIAL CLINICO COMPLETO */}
            {profile.historico_juegos.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Historial Clínico de Sesiones Realizadas
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Juego</th>
                        <th className="pb-3 font-semibold text-center">Aciertos</th>
                        <th className="pb-3 font-semibold text-center">Incorrectos</th>
                        <th className="pb-3 font-semibold text-center">Precisión (%)</th>
                        <th className="pb-3 font-semibold text-center">Tiempo Total (s)</th>
                        <th className="pb-3 font-semibold text-center">Niveles</th>
                        <th className="pb-3 font-semibold text-right">Fecha Completado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {profile.historico_juegos.map((j, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition duration-150">
                          <td className="py-3 font-bold text-gray-900">{j.juego}</td>
                          <td className="py-3 text-center text-emerald-600 font-bold">{j.correctas}</td>
                          <td className="py-3 text-center text-rose-600 font-bold">{j.incorrectas}</td>
                          <td className="py-3 text-center font-bold text-indigo-600">{j.precision}%</td>
                          <td className="py-3 text-center">{j.tiempo} s</td>
                          <td className="py-3 text-center">L {j.niveles_completados}</td>
                          <td className="py-3 text-right text-gray-500">{j.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            Seleccione un paciente para visualizar su informe del sistema experto.
          </div>
        )}

      </div>

      {/* Modal Histórico del Test de Dislexia */}
      {modalTestAbierto && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 animate-bounce" />
                  Historial de Evaluaciones Clínicas (PROLEC-R)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Listado de pruebas realizadas y resultados de diagnóstico clínico.
                </p>
              </div>
              <button 
                onClick={() => setModalTestAbierto(false)} 
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
              {cargandoHistorialTest ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <p className="text-gray-500 font-semibold text-sm">Cargando historial de evaluaciones...</p>
                </div>
              ) : historialTest.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 bg-white border border-gray-100 rounded-2xl p-8">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
                  <h4 className="text-gray-700 font-bold text-base">Sin Evaluaciones Registradas</h4>
                  <p className="text-xs max-w-sm mt-1">
                    Este paciente no cuenta con registros históricos en la base de datos para la prueba formal PROLEC-R.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {historialTest.map((test) => {
                    const diagStyle = getGravedadBadgeStyle(test.diagnostico);
                    return (
                      <div key={test.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden text-left">
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-50 bg-gray-50/30 gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase">Fecha de Evaluación</p>
                              <p className="text-sm font-semibold text-gray-800">{test.fecha}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-600 uppercase">
                              Método: {test.metodo}
                            </span>
                            <span 
                              className="px-3 py-1 rounded-xl text-xs font-extrabold border uppercase shadow-sm"
                              style={{
                                backgroundColor: diagStyle.bg,
                                color: diagStyle.text,
                                borderColor: diagStyle.border
                              }}
                            >
                              {test.diagnostico}
                            </span>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6 space-y-6">
                          {/* Grid de Índices */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Palabras */}
                            <div className="bg-gradient-to-br from-indigo-50/30 to-indigo-100/10 border border-indigo-100/80 rounded-2xl p-5 space-y-4">
                              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider border-b border-indigo-100 pb-2 flex items-center justify-between">
                                <span>Índice de Lectura: Palabras</span>
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-extrabold uppercase">PROLEC-R</span>
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Aciertos</span>
                                  <span className="text-base font-black text-gray-800">{test.a_p} / 40</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Tiempo</span>
                                  <span className="text-base font-black text-gray-800">{test.t_p} s</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Índice (IL)</span>
                                  <span className="text-base font-black text-indigo-600">{test.il_p}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Baremos</span>
                                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 inline-block uppercase">
                                    {test.r_p}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Pseudopalabras */}
                            <div className="bg-gradient-to-br from-purple-50/30 to-purple-100/10 border border-purple-100/80 rounded-2xl p-5 space-y-4">
                              <p className="text-xs font-bold text-purple-800 uppercase tracking-wider border-b border-purple-100 pb-2 flex items-center justify-between">
                                <span>Índice de Lectura: Pseudopalabras</span>
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-extrabold uppercase">PROLEC-R</span>
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Aciertos</span>
                                  <span className="text-base font-black text-gray-800">{test.a_ps} / 40</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Tiempo</span>
                                  <span className="text-base font-black text-gray-800">{test.t_ps} s</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Índice (IL)</span>
                                  <span className="text-base font-black text-purple-600">{test.il_ps}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Baremos</span>
                                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 inline-block uppercase">
                                    {test.r_ps}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Transcripción Literal Verbatim */}
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transcripción Literal Verbatim</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Palabras */}
                              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-indigo-900">Transcripción Palabras:</p>
                                <p className="text-xs text-gray-700 font-medium italic bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap min-h-[50px]">
                                  {test.transcripcion_p || "(Sin transcripción registrada)"}
                                </p>
                                {test.audio_p_ruta && (
                                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                                    <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                    <audio src={getBackendUrl(test.audio_p_ruta)} controls className="w-full h-8" />
                                  </div>
                                )}
                              </div>
                              {/* Pseudopalabras */}
                              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-indigo-900">Transcripción Pseudopalabras:</p>
                                <p className="text-xs text-gray-700 font-medium italic bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap min-h-[50px]">
                                  {test.transcripcion_ps || "(Sin transcripción registrada)"}
                                </p>
                                {test.audio_ps_ruta && (
                                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                                    <Volume2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                    <audio src={getBackendUrl(test.audio_ps_ruta)} controls className="w-full h-8" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Signos Cualitativos y Comentario */}
                          <div className="bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl space-y-4">
                            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider border-b border-indigo-100 pb-2">
                              Registro de Signos Clínicos y Observaciones
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(test.observaciones || {}).map(([key, val]) => {
                                if (key === 'comentario' || !val) return null
                                const label = OBSERVATION_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                return (
                                  <span key={key} className="bg-rose-50 text-rose-700 text-xs px-3 py-1.5 rounded-xl font-bold border border-rose-200 shadow-sm flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    {label}
                                  </span>
                                )
                              })}
                              {Object.entries(test.observaciones || {}).filter(([k, v]) => k !== 'comentario' && v).length === 0 && (
                                <p className="text-xs font-semibold text-gray-400">No se registraron signos cualitativos negativos en esta evaluación.</p>
                              )}
                            </div>
                            
                            {test.observaciones?.comentario && (
                              <div className="pt-2 border-t border-indigo-100/40">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Notas Clínicas del Psicólogo:</p>
                                <p className="text-sm font-medium text-gray-700 bg-white border border-gray-100 p-3 rounded-xl mt-1.5 leading-relaxed shadow-sm">
                                  {test.observaciones.comentario}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <button 
                onClick={() => setModalTestAbierto(false)} 
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition duration-300 text-sm shadow-md cursor-pointer"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
