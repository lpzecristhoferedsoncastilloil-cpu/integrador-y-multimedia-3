import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Loader2, TrendingUp, Users, Gamepad2, Star } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

export default function Estadisticas() {
  const [datos, setDatos] = useState(null)
  const [resultados, setResultados] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [pacienteId, setPacienteId] = useState('')
  const [limiteSesiones, setLimiteSesiones] = useState('all')
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([])
  const [dropdownAbierto, setDropdownAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  const cargar = async (mostrarSpinner = false) => {
    if (mostrarSpinner) setCargando(true);
    try {
      const [est, res, pac] = await Promise.all([
        api.get(`/estadisticas/${pacienteId ? `?paciente_id=${pacienteId}` : ''}`),
        api.get(`/resultados-juegos/${pacienteId ? `?paciente_id=${pacienteId}` : ''}`),
        api.get('/pacientes/'),
      ])
      setDatos(est.data)
      setResultados(res.data.results || res.data)
      setPacientes(pac.data.results || pac.data)
    } catch (e) { console.error(e) }
    finally { setCargando(false) }
  }

  useEffect(() => {
    cargar(true)
    const interval = setInterval(() => cargar(false), 3000);
    return () => clearInterval(interval);
  }, [pacienteId])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.juegos-dropdown-container')) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [])

  // Obtener la lista de nombres de juegos únicos para el filtro
  const nombresJuegos = Array.from(new Set(resultados.map(r => r.nombre_juego).filter(Boolean)));

  // Filtrar resultados por juegos seleccionados
  const resultadosFiltrados = resultados.filter(r => {
    if (juegosSeleccionados.length === 0) return true;
    return juegosSeleccionados.includes(r.nombre_juego);
  });

  // Obtener sesiones según el límite escogido (los más recientes)
  const cantidadSesiones = limiteSesiones === 'all' ? resultadosFiltrados.length : parseInt(limiteSesiones);
  const sesionesSeleccionadas = resultadosFiltrados.slice(0, cantidadSesiones);

  // Para las gráficas queremos mostrar en orden cronológico (antiguo a nuevo)
  const sesionesGraficos = [...sesionesSeleccionadas].reverse();

  const lineData = {
    labels: sesionesGraficos.map((r, i) => r.fecha_resultado ? new Date(r.fecha_resultado).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'}) : `S${i + 1}`),
    datasets: [
      {
        label: 'Correctas',
        data: sesionesGraficos.map(r => r.respuestas_correctas || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true, tension: 0.4,
      },
      {
        label: 'Incorrectas',
        data: sesionesGraficos.map(r => r.respuestas_incorrectas || 0),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        fill: true, tension: 0.4,
      },
      {
        label: 'Intentadas',
        data: sesionesGraficos.map(r => r.preguntas_totales || 0),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true, tension: 0.4,
      },
    ],
  }

  const barData = {
    labels: sesionesGraficos.map((r, i) => r.fecha_resultado ? new Date(r.fecha_resultado).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit'}) : `S${i + 1}`),
    datasets: [{
      label: 'Porcentaje (%)',
      data: sesionesGraficos.map(r => Number(r.porcentaje_resultado) || 0),
      backgroundColor: sesionesGraficos.map((_, i) =>
        `hsl(${240 + i * 15}, 70%, ${55 + i * 3}%)`
      ),
      borderRadius: 8,
    }],
  }

  const doughnutData = {
    labels: ['Correctas', 'Incorrectas'],
    datasets: [{
      data: [
        sesionesSeleccionadas.reduce((a, r) => a + (r.respuestas_correctas || 0), 0),
        sesionesSeleccionadas.reduce((a, r) => a + (r.respuestas_incorrectas || 0), 0),
      ],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  }

  const opts = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }

  if (cargando) return (
    <Layout titulo="Estadísticas">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    </Layout>
  )

  const totalCorrectas = sesionesSeleccionadas.reduce((a, r) => a + (r.respuestas_correctas || 0), 0)
  const totalIntentos = sesionesSeleccionadas.reduce((a, r) => a + (r.preguntas_totales || 0), 0)
  const precision = totalIntentos > 0 ? Math.round((totalCorrectas / totalIntentos) * 100) : 0
  const totalEstrellas = sesionesSeleccionadas.reduce((a, r) => a + (r.estrellas_ganadas || 0), 0)
  const promedioEstrellas = sesionesSeleccionadas.length > 0 ? (totalEstrellas / sesionesSeleccionadas.length).toFixed(1) : '0.0'

  return (
    <Layout titulo="Estadísticas de Evolución">

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtrar por Paciente</label>
          <select
            value={pacienteId}
            onChange={e => { setPacienteId(e.target.value); setCargando(true) }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">Todos los pacientes</option>
            {pacientes.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombre_completo}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sesiones a Visualizar</label>
          <select
            value={limiteSesiones}
            onChange={e => setLimiteSesiones(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">Todas las sesiones ({resultadosFiltrados.length})</option>
            <option value="1">Última sesión</option>
            <option value="2">Últimas 2 sesiones</option>
            <option value="5">Últimas 5 sesiones</option>
            <option value="10">Últimas 10 sesiones</option>
            <option value="20">Últimas 20 sesiones</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 relative juegos-dropdown-container">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtrar por Juego</label>
          <button
            type="button"
            onClick={() => setDropdownAbierto(!dropdownAbierto)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-left flex justify-between items-center shadow-sm cursor-pointer"
          >
            <span className="truncate">
              {juegosSeleccionados.length === 0 
                ? `Todos los juegos (${nombresJuegos.length})` 
                : juegosSeleccionados.length === 1 
                  ? juegosSeleccionados[0] 
                  : `${juegosSeleccionados.length} seleccionados`}
            </span>
            <span className="text-xs text-gray-400">▼</span>
          </button>
          
          {dropdownAbierto && (
            <div className="absolute left-0 right-0 top-[68px] z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 max-h-64 overflow-y-auto mt-1 flex flex-col gap-1">
              <div 
                className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-semibold border-b border-gray-100 pb-2 mb-1"
                onClick={() => setJuegosSeleccionados([])}
              >
                <input
                  type="checkbox"
                  checked={juegosSeleccionados.length === 0}
                  readOnly
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="select-none">Todos los juegos</span>
              </div>
              {nombresJuegos.map(g => {
                const checked = juegosSeleccionados.includes(g);
                return (
                  <div 
                    key={g} 
                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (checked) {
                        setJuegosSeleccionados(prev => prev.filter(x => x !== g));
                      } else {
                        setJuegosSeleccionados(prev => [...prev, g]);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="select-none truncate" title={g}>{g}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="self-end md:self-center flex flex-col items-end md:pt-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-1 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            Actualizado En Vivo
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Mostrando {sesionesSeleccionadas.length} de {resultados.length} sesiones
          </span>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Sesiones', value: sesionesSeleccionadas.length, icon: Gamepad2, color: 'from-indigo-500 to-purple-500' },
          { label: 'Precisión Promedio', value: `${precision}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
          { label: 'Estrellas Promedio', value: `${promedioEstrellas} ⭐`, icon: Star, color: 'from-amber-400 to-orange-500' },
          { label: 'Aciertos / Correctas', value: totalCorrectas, icon: Star, color: 'from-yellow-400 to-amber-500' },
          { label: 'Intentos Totales', value: totalIntentos, icon: Users, color: 'from-pink-500 to-rose-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
              <Icon className="text-white w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfica de líneas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Progreso por Sesión</h2>
          {sesionesSeleccionadas.length > 0 ? (
            <Line data={lineData} options={opts} />
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-gray-400">
              <Gamepad2 className="w-12 h-12 text-gray-300 mb-2 animate-bounce" />
              <p className="font-semibold text-gray-600">Aún no hay sesiones registradas</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
                El paciente debe iniciar sesión y jugar para guardar estadísticas en tiempo real.
              </p>
            </div>
          )}
        </div>

        {/* Doughnut */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Distribución de Respuestas</h2>
          {totalIntentos > 0 ? (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[200px]">
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '70%' }} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-3xl font-extrabold text-indigo-600">{precision}%</p>
                <p className="text-sm text-gray-500">Precisión global</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-gray-400">
              <Star className="w-12 h-12 text-gray-300 mb-2" />
              <p className="font-semibold text-gray-600">Sin datos de respuestas</p>
              <p className="text-xs text-gray-400 mt-1 text-center">
                Juega una sesión para ver la proporción de aciertos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gráfica de barras */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Porcentaje de Logro por Sesión</h2>
        {sesionesSeleccionadas.length > 0 ? (
          <Bar data={barData} options={{ ...opts, plugins: { legend: { display: false } } }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-56 text-gray-400">
            <TrendingUp className="w-12 h-12 text-gray-300 mb-2" />
            <p className="font-semibold text-gray-600">Sin datos de porcentaje</p>
          </div>
        )}
      </div>

      {/* Tabla de resultados */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Historial de Sesiones</h2>
        </div>
        <div className="overflow-x-auto">
          {sesionesSeleccionadas.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Paciente', 'Juego', 'Fecha', 'Correctas', 'Incorrectas', 'Porcentaje', 'Tiempo'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sesionesSeleccionadas.map(r => (
                  <tr key={r.id_resultado_juego} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.paciente_nombre || 'Desconocido'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.nombre_juego || 'Juego'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {r.fecha_resultado ? new Date(r.fecha_resultado).toLocaleString('es-ES', {dateStyle: 'short', timeStyle: 'short'}) : 'Sin fecha'}
                    </td>
                    <td className="px-6 py-4"><span className="text-green-600 font-bold">{r.respuestas_correctas || 0}</span></td>
                    <td className="px-6 py-4"><span className="text-red-500 font-bold">{r.respuestas_incorrectas || 0}</span></td>
                    <td className="px-6 py-4"><span className="text-indigo-600 font-bold">{r.porcentaje_resultado ? `${Number(r.porcentaje_resultado)}%` : '0%'}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{r.tiempo_jugado_segundos || 0}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-400 font-medium">
              No se han encontrado registros en el historial de sesiones.
            </div>
          )}
        </div>
      </div>

    </Layout>
  )
}
