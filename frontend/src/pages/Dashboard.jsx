import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { Users, Calendar, Gamepad2, FileText, TrendingUp, Clock, ChevronRight, Loader2, BookOpen, BarChart3, Cpu } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Dashboard() {
  const [datos, setDatos] = useState(null)
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dash, citasRes] = await Promise.all([
          api.get('/dashboard/'),
          api.get('/citas/'),
        ])
        setDatos(dash.data)
        setCitas(citasRes.data.results || citasRes.data)
      } catch (e) {
        console.error('Error cargando dashboard:', e)
        // No redirigir, solo mostrar datos vacios
        setDatos({
          total_pacientes: 0,
          total_citas_hoy: 0,
          total_juegos_jugados: 0,
          total_reportes: 0,
          citas_pendientes: 0,
          total_tests: 0,
          total_test_dislexia: 0,
          promedio_precision: 0,
        })
      } finally {
        setCargando(false)
      }
    }
    cargar()
    const interval = setInterval(cargar, 30000)
    return () => clearInterval(interval)
  }, [])

  const tarjetas = datos ? [
    { label: 'Pacientes Activos', value: datos.total_pacientes, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', link: '/pacientes' },
    { label: 'Citas Hoy', value: datos.total_citas_hoy, icon: Calendar, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', link: '/calendario' },
    { label: 'Juegos Jugados', value: datos.total_juegos_jugados, icon: Gamepad2, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', link: '/juegos' },
    { label: 'Tests Aplicados', value: datos.total_tests, icon: FileText, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', link: '/tests' },
    { label: 'Test Dislexia (PROLEC-R)', value: datos.total_test_dislexia, icon: BookOpen, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', link: '/test-dislexia' },
    { label: 'Precisión Promedio', value: `${Math.round(datos.promedio_precision)}%`, icon: BarChart3, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50', link: '/estadisticas' },
    { label: 'Experto IA', value: `${datos.total_pacientes} Perfiles`, icon: Cpu, color: 'from-red-500 to-orange-500', bg: 'bg-red-50', link: '/experto-ia' },
    { label: 'Reportes Clínicos', value: datos.total_reportes, icon: FileText, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', link: '/reportes' },
  ] : []

  const chartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Sesiones',
        data: datos?.grafico_sesiones || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
      },
      {
        label: 'Pacientes nuevos',
        data: datos?.grafico_pacientes || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#a855f7',
        pointRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  }

  const estadoCita = {
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    CONFIRMADA: 'bg-green-100 text-green-700',
    REALIZADA: 'bg-blue-100 text-blue-700',
    CANCELADA: 'bg-red-100 text-red-700',
    NO_ASISTIO: 'bg-gray-100 text-gray-700',
  }

  if (cargando) return (
    <Layout titulo="Dashboard">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    </Layout>
  )

  return (
    <Layout titulo="Panel Principal">

      {/* Tarjetas métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {tarjetas.map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} to={link} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className="text-white w-6 h-6" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Gráfica */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Indicador de Rendimiento</h2>
              <p className="text-sm text-gray-500">Sesiones y pacientes nuevos por mes</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Metas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Metas del Mes</h2>
          <div className="space-y-5">
            {[
              { label: 'Completar 50 sesiones', actual: datos?.meta_sesiones_actual || 0, total: datos?.meta_sesiones_total || 50, color: 'bg-indigo-500' },
              { label: 'Registrar 20 pacientes', actual: datos?.meta_pacientes_actual || 0, total: datos?.meta_pacientes_total || 20, color: 'bg-purple-500' },
              { label: 'Generar 10 reportes', actual: datos?.meta_reportes_actual || 0, total: datos?.meta_reportes_total || 10, color: 'bg-pink-500' },
              { label: 'Citas completadas', actual: datos?.meta_citas_actual || 0, total: datos?.meta_citas_total || 10, color: 'bg-orange-500' },
            ].map(({ label, actual, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">{label}</span>
                  <span className="text-gray-400">{actual}/{total}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className={`${color} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${Math.min((actual / total) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Próximas citas */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Próximas Citas</h2>
          <Link to="/calendario" className="text-sm text-indigo-600 hover:underline font-medium">Ver todas →</Link>
        </div>
        {citas.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay citas programadas</p>
        ) : (
          <div className="space-y-3">
            {citas.slice(0, 5).map((cita) => (
              <div key={cita.id_cita} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{cita.paciente_nombre}</p>
                  <p className="text-xs text-gray-500">{cita.fecha_cita} · {cita.hora_inicio} — {cita.titulo_cita}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoCita[cita.estado_cita?.toUpperCase()] || 'bg-yellow-100 text-yellow-700'}`}>
                  {cita.estado_cita}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </Layout>
  )
}
