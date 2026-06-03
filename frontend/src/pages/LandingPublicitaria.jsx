import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  ChevronRight, 
  Gamepad2, 
  Trophy, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  X, 
  Play
} from 'lucide-react';
import FondoInteractivo3D from '../components/FondoInteractivo3D';

export default function LandingPublicitaria() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    zona: 'Zona Sur',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulación de envío
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setFormData({ nombre: '', email: '', telefono: '', zona: 'Zona Sur', mensaje: '' });
    }, 4000);
  };

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      
      {/* FONDO 3D INTERACTIVO */}
      <FondoInteractivo3D />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent tracking-wider">
              NEUROGYM
            </span>
            <span className="block text-[9px] text-purple-300 font-semibold uppercase tracking-widest -mt-1">La Paz, Bolivia</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <a href="#ecosistema" className="hover:text-purple-400 transition-colors duration-200">Sala de Juegos</a>
          <a href="#nosotros" className="hover:text-purple-400 transition-colors duration-200">¿Por qué La Paz?</a>
          <a href="#especialidades" className="hover:text-purple-400 transition-colors duration-200">Especialistas</a>
          <a href="#podio" className="hover:text-purple-400 transition-colors duration-200">Podio</a>
          <a href="#contacto" className="hover:text-purple-400 transition-colors duration-200">Contacto</a>
        </div>
        <Link 
          to="/login" 
          className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="relative z-10">Iniciar Sesión</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </nav>

      {/* 1. SECCIÓN HERO */}
      <header className="relative pt-32 pb-24 md:pt-40 md:pb-36 px-6 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-12 items-center min-h-[90vh]">
        <div className="md:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-inner tracking-wider uppercase animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Tecnología Médica & Terapia Cognitiva
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-white">
            NeuroGym La Paz: <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              Terapia Avanzada para la Dislexia
            </span> <br />
            con Soporte Tecnológico y Clínico
          </h1>
          
          <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-2xl font-light">
            Transformamos el aprendizaje de los niños paceños mediante un sistema integral de gestión clínica. 
            Combinamos juegos terapéuticos fonológicos interactivos con el monitoreo en tiempo real y reportes avanzados 
            diseñados específicamente para psicólogos y psicopedagogos en Bolivia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Botón Comenzar Entrenamiento (Morado Neón) */}
            <Link 
              to="/login" 
              className="px-8 py-4 rounded-2xl font-extrabold text-center text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8)] border border-purple-400 transition-all duration-300 flex items-center justify-center gap-2 group transform hover:-translate-y-1"
            >
              Comenzar Entrenamiento
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {/* Botón Ver Demo de la Sala de Juegos */}
            <button 
              onClick={() => setShowDemoModal(true)}
              className="px-8 py-4 rounded-2xl font-extrabold text-center text-white bg-transparent border-2 border-white/20 hover:border-white hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Ver Demo de la Sala de Juegos
            </button>
          </div>
        </div>

        {/* Tarjeta Flotante / Progreso */}
        <div className="md:col-span-5 w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Historial Clínico</p>
                <h4 className="text-xl font-bold text-white">Progreso del Paciente</h4>
              </div>
              <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-lg">
                Activo
              </div>
            </div>
            
            {/* Barras de Nivel */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-300">Nivel 1: Conciencia Fonológica</span>
                  <span className="font-bold text-purple-400">100%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3.5 border border-white/5 p-0.5">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-2 transition-all duration-1000" style={{ width: '100%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-300">Nivel 2: Caza del Grafema</span>
                  <span className="font-bold text-pink-400">75%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3.5 border border-white/5 p-0.5">
                  <div className="bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full h-2 transition-all duration-1000" style={{ width: '75%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-300">Nivel 3: Velocidad Lectora</span>
                  <span className="font-bold text-indigo-400">40%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3.5 border border-white/5 p-0.5">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-2 transition-all duration-1000" style={{ width: '40%' }} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
              <span>Última sesión: Hoy a las 11:30</span>
              <span className="text-purple-300 font-bold hover:underline cursor-pointer">Ver reporte completo →</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. PANEL DE MÉTRICAS REGIONALES */}
      <section className="relative -mt-10 mb-20 px-6 max-w-7xl mx-auto z-10">
        <div className="bg-black/55 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center divide-y-2 md:divide-y-0 md:divide-x divide-white/10">
            <div className="pt-4 md:pt-0">
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-mono mb-2">+500</p>
              <p className="text-xs text-gray-400 tracking-wide uppercase font-medium">Pacientes evaluados en el dpto. de La Paz</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent font-mono mb-2">98%</p>
              <p className="text-xs text-gray-400 tracking-wide uppercase font-medium">Satisfacción y recomendación de padres</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent font-mono mb-2">120</p>
              <p className="text-xs text-gray-400 tracking-wide uppercase font-medium">Pacientes activos este mes en terapia</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent font-mono mb-2">340</p>
              <p className="text-xs text-gray-400 tracking-wide uppercase font-medium">Sesiones de juego completadas con éxito</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-mono mb-2">45</p>
              <p className="text-xs text-gray-400 tracking-wide uppercase font-medium">Reportes clínicos automáticos generados</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ¿QUÉ ES NEUROGYM Y POR QUÉ EN LA PAZ? */}
      <section id="nosotros" className="relative py-24 px-6 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-start">
            <span className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              Identidad Paceña
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
              ¿Qué es NeuroGym <br />y por qué en La Paz?
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 text-justify font-light">
              En la ciudad de La Paz, las dificultades de aprendizaje como la dislexia requieren un enfoque dinámico que rompa con las terapias tradicionales de papel y lápiz. NeuroGym nace en la hoyada paceña como la primera plataforma que une la psicología clínica con la gamificación espacial. 
            </p>
            <p className="text-lg text-gray-300 leading-relaxed text-justify font-light">
              Nuestro software permite a los especialistas locales automatizar el seguimiento de sus pacientes, ofreciendo intervenciones oportunas basadas en datos reales y adaptadas al ritmo de cada niño, permitiendo conectar el entorno de la consulta clínica de Sopocachi, Calacoto o El Alto directamente con la calidez del hogar.
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition duration-700"></div>
            <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1599839385201-9f7998b5849d?q=80&w=600" 
                alt="Ciudad de La Paz de noche, Bolivia" 
                className="w-full h-[400px] object-cover filter brightness-75 hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">Nuestra Inspiración</span>
                <h4 className="text-white text-xl font-bold">Uniendo la tecnología y el desarrollo cognitivo paceño</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NUESTRO ECOSISTEMA DE JUEGOS TERAPÉUTICOS */}
      <section id="ecosistema" className="relative py-24 px-6 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest inline-block">
            Diversión con Propósito
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Nuestro Ecosistema de Juegos Terapéuticos
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed font-light">
            El cerebro aprende jugando. Nuestra Sala de Juegos Espacial está diseñada bajo rigurosos criterios neuropsicológicos para entrenar la conciencia fonológica, el reconocimiento visual y la velocidad lectora. Cada sesión es una aventura espacial interactiva.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Tarjeta 1 */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6">
                <img 
                  src="/images/game_cohete.png" 
                  alt="Cohete" 
                  className="w-10 h-10 object-contain error-fallback"
                  onError={(e) => {
                    // Fallback a SVG si la imagen no existe en disco
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '🚀';
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Constructor de Cohetes</h3>
              <p className="text-gray-300 font-light leading-relaxed mb-6">
                Entrenamiento de conciencia silábica. Los niños ordenan sílabas dispersas en el espacio para formar palabras correctamente. Al lograrlo, ¡su cohete despega a la siguiente galaxia!
              </p>
            </div>
            <span className="text-xs text-purple-300 font-semibold tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-lg self-start">Conciencia Silábica</span>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/30 rounded-2xl flex items-center justify-center mb-6">
                <img 
                  src="/images/game_grafema.png" 
                  alt="Lupa" 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '🔍';
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">La Caza del Grafema Perdido</h3>
              <p className="text-gray-300 font-light leading-relaxed mb-6">
                Discriminación visual avanzada. El paciente debe encontrar la letra o sílaba faltante que completa la palabra clave, potenciando el reconocimiento visual a través de 10 niveles de dificultad.
              </p>
            </div>
            <span className="text-xs text-pink-300 font-semibold tracking-wider uppercase bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-lg self-start">Discriminación Visual</span>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6">
                <img 
                  src="/images/game_silabas.png" 
                  alt="Destellos" 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '✨';
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sílabas Mágicas</h3>
              <p className="text-gray-300 font-light leading-relaxed mb-6">
                Velocidad y fluidez de lectura. Ejercicios cronometrados de alta intensidad cognitiva donde el niño identifica rápidamente la primera sílaba de la palabra proyectada antes de que el tiempo expire.
              </p>
            </div>
            <span className="text-xs text-indigo-300 font-semibold tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg self-start">Velocidad Lectora</span>
          </div>
        </div>
      </section>

      {/* 5. ÁREAS DE ESPECIALIDAD CLÍNICA */}
      <section id="especialidades" className="relative py-24 px-6 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest inline-block">
            Equipo Multidisciplinario
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Áreas de Especialidad Clínica
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed font-light">
            Contamos con un panel de profesionales registrados y validados en el sistema, dedicados a las distintas ramas del desarrollo cognitivo infantil.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Psicología Clínica */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 p-1 mb-6">
              <img 
                src="/avatares/avatar_psicologo.png" 
                alt="Psicología Clínica" 
                className="w-full h-full rounded-full object-cover" 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200';
                }}
              />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Psicología Clínica</h4>
            <p className="text-purple-300 text-sm font-semibold mb-4 tracking-wider uppercase">Soporte y Diagnóstico</p>
            <p className="text-gray-300 font-light leading-relaxed">
              Atención e intervención psicológica integral de la plataforma. Diagnósticos precisos y seguimiento conductual adaptado.
            </p>
          </div>

          {/* Psicología Infantil */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500 p-1 mb-6">
              <img 
                src="/avatares/avatar_psicologo.png" 
                alt="Psicología Infantil" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=200';
                }}
              />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Psicología Infantil</h4>
            <p className="text-pink-300 text-sm font-semibold mb-4 tracking-wider uppercase">Enfoque Lúdico y Emocional</p>
            <p className="text-gray-300 font-light leading-relaxed">
              Especialistas enfocados de manera exclusiva en el desarrollo infantil, el diseño de estrategias lúdicas y el bienestar socioemocional de los niños paceños.
            </p>
          </div>

          {/* Neuropsicología */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 p-1 mb-6">
              <img 
                src="/avatares/avatar_psicologo.png" 
                alt="Neuropsicología" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200';
                }}
              />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Neuropsicología</h4>
            <p className="text-indigo-300 text-sm font-semibold mb-4 tracking-wider uppercase">Estimulación Científica</p>
            <p className="text-gray-300 font-light leading-relaxed">
              Expertos en estimulación cognitiva avanzada, rehabilitación de funciones ejecutivas y abordaje científico de la dislexia y discalculia.
            </p>
          </div>
        </div>
      </section>

      {/* 6. EL GRAN PODIO NEUROGYM */}
      <section id="podio" className="relative py-24 px-6 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-start">
            <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              Compromiso y Recompensas
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
              El Gran Podio NeuroGym <br />
              <span className="text-purple-400 font-bold">Gamificación e Incentivos</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-6 font-light text-justify">
              ¡Motivación al estilo de los grandes campeones! Nuestro sistema incluye el 'Gran Podio NeuroGym', una pizarra de récords históricos inspirada en dinámicas competitivas saludables como Kahoot!.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed font-light text-justify">
              Los niños acumulan puntos al completar sus tareas diarias de entrenamiento y compiten por entrar al Top 3 mensual. Esto no solo refuerza su constancia, sino que transforma el proceso terapéutico en una experiencia emocionante y gratificante.
            </p>
          </div>

          {/* Podio Real HTML/CSS */}
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-2 mb-8">
              <Trophy className="text-yellow-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              <h4 className="text-2xl font-bold text-white text-center">Top 3 Histórico - Mayo</h4>
            </div>

            <div className="w-full flex items-end justify-center gap-4 h-64 mt-4">
              {/* Segundo Lugar (Izquierda) */}
              <div className="flex flex-col items-center w-28">
                <div className="mb-2 text-center">
                  <p className="font-extrabold text-white text-sm">Luciana V.</p>
                  <p className="text-xs text-pink-400 font-mono font-bold">2,100 pts</p>
                </div>
                <div className="w-full bg-gradient-to-t from-purple-800 to-purple-600 border-x border-t border-purple-500 rounded-t-2xl flex items-center justify-center shadow-lg h-32">
                  <span className="text-4xl font-extrabold text-white/50">2</span>
                </div>
              </div>

              {/* Primer Lugar (Centro) */}
              <div className="flex flex-col items-center w-32 relative">
                <div className="absolute -top-10 flex flex-col items-center">
                  <div className="w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white animate-bounce">
                    👑
                  </div>
                </div>
                <div className="mb-2 text-center">
                  <p className="font-extrabold text-white text-base">Alejandro M.</p>
                  <p className="text-sm text-yellow-400 font-mono font-bold">2,450 pts</p>
                </div>
                <div className="w-full bg-gradient-to-t from-purple-600 to-pink-500 border-x border-t border-pink-400 rounded-t-2xl flex items-center justify-center shadow-xl h-44">
                  <span className="text-5xl font-extrabold text-white">1</span>
                </div>
              </div>

              {/* Tercer Lugar (Derecha) */}
              <div className="flex flex-col items-center w-28">
                <div className="mb-2 text-center">
                  <p className="font-extrabold text-white text-sm">Bruno S.</p>
                  <p className="text-xs text-indigo-400 font-mono font-bold">1,850 pts</p>
                </div>
                <div className="w-full bg-gradient-to-t from-purple-950 to-purple-800 border-x border-t border-purple-800 rounded-t-2xl flex items-center justify-center shadow-md h-24">
                  <span className="text-4xl font-extrabold text-white/30">3</span>
                </div>
              </div>
            </div>

            <div className="w-full mt-8 bg-black/30 rounded-2xl p-4 divide-y divide-white/10">
              <div className="flex justify-between items-center py-2 text-sm text-gray-300">
                <span className="font-semibold">4. Mateo R.</span>
                <span className="font-mono text-xs">1,720 pts</span>
              </div>
              <div className="flex justify-between items-center py-2 text-sm text-gray-300">
                <span className="font-semibold">5. Camila F.</span>
                <span className="font-mono text-xs">1,680 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FORMULARIO DE CONTACTO LOCALIZADO */}
      <section id="contacto" className="relative py-24 px-6 max-w-4xl mx-auto z-10">
        <div className="relative bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4">
              Contáctanos hoy mismo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Solicita tu Evaluación</h2>
            <p className="text-gray-300 mt-2 font-light">Completa el formulario para reservar una evaluación de diagnóstico especializada en La Paz.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Juan Pérez Mamani"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    required
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Teléfono de contacto</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400 font-mono text-sm font-semibold">+591</span>
                  <Phone className="absolute left-16 text-gray-400 w-4 h-4" />
                  <input 
                    type="tel" 
                    required
                    placeholder="77234567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-24 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Zona de La Paz</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <select 
                    value={formData.zona}
                    onChange={(e) => setFormData({...formData, zona: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 focus:bg-white/10 transition cursor-pointer appearance-none"
                  >
                    <option className="bg-gray-900 text-white" value="Zona Sur">Zona Sur (Calacoto, San Miguel, Obrajes)</option>
                    <option className="bg-gray-900 text-white" value="Sopocachi">Sopocachi</option>
                    <option className="bg-gray-900 text-white" value="Miraflores">Miraflores</option>
                    <option className="bg-gray-900 text-white" value="El Alto">El Alto</option>
                    <option className="bg-gray-900 text-white" value="Centro">Centro / Obelisco</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Mensaje o motivo de consulta</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
                <textarea 
                  rows="4"
                  placeholder="Detalla cómo podemos ayudarte..."
                  value={formData.mensaje}
                  onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition resize-none"
                />
              </div>
            </div>

            {enviado && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold rounded-xl flex items-center gap-3 animate-pulse">
                <CheckCircle className="w-5 h-5" /> ¡Tu solicitud ha sido enviada con éxito! Nos comunicaremos contigo en las próximas 24 horas.
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] text-gray-950 font-black py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-center uppercase tracking-wider text-base border border-emerald-400"
            >
              Solicitar Evaluación de Diagnóstico
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-black/60 border-t border-white/10 py-12 px-6 text-center z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-widest">NEUROGYM</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 NeuroGym S.R.L. - Tecnología Médica y Psicológica. Sede Central: Av. Principal, La Paz, Bolivia. Soporte técnico disponible 24/7.
          </p>
        </div>
      </footer>

      {/* MODAL DE DEMO */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative bg-slate-900 border border-white/20 rounded-3xl max-w-4xl w-full p-6 shadow-2xl">
            <button 
              onClick={() => setShowDemoModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-4 pr-10">Demo: Sala de Juegos Espacial (Constructor de Cohetes)</h3>
            
            {/* Pantalla Simulada del Juego */}
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center p-8 min-h-[350px]">
              {/* Estrellas de fondo simuladas */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,22,50,1)_0%,rgba(5,7,20,1)_100%)] opacity-80" />
              
              <div className="relative z-10 text-center w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                  <div className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg border border-purple-500/30">Nivel 1</div>
                  <div className="text-yellow-400 font-bold font-mono text-sm">Puntos: 450</div>
                </div>

                <div className="text-white text-3xl font-extrabold tracking-widest my-8 animate-pulse text-center">
                  C O _ E T E
                </div>

                <p className="text-gray-400 text-sm mb-6">¿Qué sílaba completa la palabra para que el cohete despegue?</p>

                <div className="grid grid-cols-3 gap-4">
                  <button className="bg-white/5 border border-white/10 hover:bg-purple-600 hover:border-purple-400 rounded-xl py-4 font-bold text-lg text-white transition">PA</button>
                  <button className="bg-purple-600 border border-purple-400 rounded-xl py-4 font-bold text-lg text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition">HE</button>
                  <button className="bg-white/5 border border-white/10 hover:bg-purple-600 hover:border-purple-400 rounded-xl py-4 font-bold text-lg text-white transition">MA</button>
                </div>

                <div className="mt-10 p-3 bg-purple-500/10 text-purple-300 rounded-xl text-xs border border-purple-500/20">
                  💡 Pista: Es un vehículo espacial que viaja a las estrellas.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
