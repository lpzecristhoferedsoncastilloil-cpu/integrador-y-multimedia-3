import { Link } from 'react-router-dom'
import { Brain, Users, Calendar, Gamepad2, BarChart3, Shield, Star, ChevronRight, CheckCircle } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">NeuroGym</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <a href="#caracteristicas" className="hover:text-indigo-600 transition">Características</a>
          <a href="#como-funciona" className="hover:text-indigo-600 transition">Cómo funciona</a>
          <a href="#beneficios" className="hover:text-indigo-600 transition">Beneficios</a>
        </div>
        <Link to="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
          Iniciar Sesión
        </Link>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              🧠 Plataforma Clínica Especializada
            </span>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Terapia para la{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dislexia
              </span>{' '}
              con Tecnología
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Sistema integral de gestión clínica con juegos terapéuticos fonológicos, seguimiento en tiempo real y reportes avanzados para psicólogos especializados.
            </p>
            <div className="flex gap-4">
              <Link to="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-indigo-200">
                Comenzar ahora <ChevronRight className="w-4 h-4" />
              </Link>
              <a href="#como-funciona" className="border-2 border-indigo-200 text-indigo-600 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-50 transition">
                Ver demo
              </a>
            </div>
            <div className="flex gap-8 mt-10">
              {[['500+', 'Pacientes'], ['98%', 'Satisfacción'], ['24/7', 'Disponible']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-indigo-600">{n}</p>
                  <p className="text-sm text-gray-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-300">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Pacientes Activos', value: '120', color: 'bg-white/20' },
                  { label: 'Citas Hoy', value: '8', color: 'bg-white/20' },
                  { label: 'Juegos Completados', value: '340', color: 'bg-white/20' },
                  { label: 'Reportes', value: '45', color: 'bg-white/20' },
                ].map((item) => (
                  <div key={item.label} className={`${item.color} rounded-2xl p-4`}>
                    <p className="text-3xl font-bold">{item.value}</p>
                    <p className="text-xs opacity-80 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-sm opacity-80 mb-2">Progreso del paciente</p>
                <div className="space-y-2">
                  {[['Nivel 1', 100], ['Nivel 2', 75], ['Nivel 3', 40]].map(([n, p]) => (
                    <div key={n}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{n}</span><span>{p}%</span>
                      </div>
                      <div className="bg-white/20 rounded-full h-2">
                        <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 rounded-2xl px-4 py-2 text-sm font-bold shadow-lg">
              ⭐ 4.9/5
            </div>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section id="caracteristicas" className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Todo lo que necesitas en un solo lugar</h2>
            <p className="text-gray-500 text-lg">Herramientas profesionales diseñadas para psicólogos especializados en dislexia</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Gestión de Pacientes', desc: 'Expedientes completos, historial clínico, seguimiento personalizado y archivos adjuntos por paciente.', color: 'from-blue-500 to-cyan-500' },
              { icon: Calendar, title: 'Calendario Clínico', desc: 'Agenda de citas con vista mensual, semanal y diaria. Notificaciones automáticas y gestión de estados.', color: 'from-indigo-500 to-purple-500' },
              { icon: Gamepad2, title: 'Juegos Terapéuticos', desc: 'Juegos fonológicos interactivos con niveles, personajes y recompensas diseñados para niños con dislexia.', color: 'from-pink-500 to-rose-500' },
              { icon: BarChart3, title: 'Estadísticas Avanzadas', desc: 'Gráficas de progreso en tiempo real, resultados por nivel, comparativas y reportes exportables.', color: 'from-orange-500 to-amber-500' },
              { icon: Shield, title: 'Tests Clínicos', desc: 'Banco de tests psicológicos con preguntas, opciones y resultados guardados automáticamente.', color: 'from-green-500 to-emerald-500' },
              { icon: Brain, title: 'Reportes Inteligentes', desc: 'Generación automática de reportes clínicos con historial de sesiones y evolución del paciente.', color: 'from-violet-500 to-purple-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className="text-white w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">¿Cómo funciona?</h2>
          <p className="text-gray-500 text-lg mb-14">Tres pasos simples para transformar la terapia</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { paso: '01', title: 'Registra al paciente', desc: 'Crea el expediente completo con diagnóstico, datos del padre y asignación al psicólogo.' },
              { paso: '02', title: 'Asigna actividades', desc: 'Programa citas, asigna juegos terapéuticos y tests según el nivel del paciente.' },
              { paso: '03', title: 'Monitorea el progreso', desc: 'Visualiza estadísticas en tiempo real, genera reportes y ajusta el plan terapéutico.' },
            ].map(({ paso, title, desc }) => (
              <div key={paso} className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-5 mx-auto">
                  {paso}
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Diseñado para psicólogos que quieren resultados reales</h2>
            <div className="space-y-4">
              {[
                'Acceso desde cualquier dispositivo con internet',
                'Datos seguros con autenticación JWT',
                'Interfaz intuitiva, sin curva de aprendizaje',
                'Juegos validados clínicamente para dislexia',
                'Reportes automáticos listos para imprimir',
                'Soporte para múltiples psicólogos y clínicas',
              ].map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="text-indigo-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-700">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Testimonio</p>
                <p className="text-sm opacity-70">Psicóloga Clínica</p>
              </div>
            </div>
            <p className="text-lg leading-relaxed opacity-90 mb-6">
              "NeuroGym transformó completamente mi práctica clínica. Los niños adoran los juegos y yo puedo ver el progreso en tiempo real. Es exactamente lo que necesitaba."
            </p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-8 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">🚀 Plataforma lista para usar</span>
          <h2 className="text-4xl font-bold mb-4">Comienza a transformar la terapia de tus pacientes</h2>
          <p className="text-lg opacity-80 mb-8">Únete a los psicólogos que ya usan NeuroGym para gestionar sus clínicas de forma profesional y eficiente.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/login" className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition inline-flex items-center gap-2">
              Acceder al sistema <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex gap-8 justify-center mt-10 text-sm opacity-70">
            <span>✓ Sin costo de instalación</span>
            <span>✓ Datos seguros</span>
            <span>✓ Soporte incluido</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="text-indigo-400 w-5 h-5" />
          <span className="text-white font-bold">NeuroGym</span>
        </div>
        <p>© 2024 NeuroGym — Sistema de Gestión Clínica para Dislexia. Todos los derechos reservados.</p>
      </footer>

    </div>
  )
}
