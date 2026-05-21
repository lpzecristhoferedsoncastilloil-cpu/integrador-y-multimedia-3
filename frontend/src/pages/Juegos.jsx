import React, { useState, useEffect } from 'react'
import GameLogin from './games/GameLogin'
import RocketBuilder from './games/RocketBuilder'
import GrafemaHunter from './games/GrafemaHunter'
import api from '../services/api'
import { Gamepad2, Play, Star, Trophy, Loader2, Heart, Clock, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Juegos() {
  const [player, setPlayer] = useState(null)
  const [activeGame, setActiveGame] = useState(null) // null, 'rocket_builder', 'silabas_magicas'
  const [gameFinishedData, setGameFinishedData] = useState(null)
  const [dbGames, setDbGames] = useState([])

  // Estado del juego demo (Sílabas Mágicas)
  const [vidas, setVidas] = useState(3)
  const [puntaje, setPuntaje] = useState(0)
  const [tiempo, setTiempo] = useState(30)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null)
  const [jugandoDemo, setJugandoDemo] = useState(false)

  const silabas = [
    { palabra: 'CASA', silabas: ['CA', 'SA', 'LA', 'MA'], correcta: 0 },
    { palabra: 'MESA', silabas: ['PE', 'ME', 'SA', 'TA'], correcta: 1 },
    { palabra: 'LUNA', silabas: ['LU', 'NA', 'BO', 'CA'], correcta: 0 },
    { palabra: 'PATO', silabas: ['PA', 'TO', 'SI', 'LO'], correcta: 0 },
  ]

  // Cargar juegos adicionales desde la base de datos
  useEffect(() => {
    if (!player) return
    const cargarJuegos = async () => {
      try {
        const res = await api.get('/juegos/')
        const fonologicos = (res.data.fonologicos || []).map(j => ({
          id: j.id_juego_fonologico,
          nombre: j.nombre_juego,
          descripcion: j.descripcion_juego,
          tipo: 'fonologico'
        }))
        const mixtos = (res.data.mixtos || []).map(j => ({
          id: j.id || j.id_juego_mixto,
          nombre: j.nombre || j.nombre_juego,
          descripcion: j.descripcion || j.descripcion_juego,
          tipo: 'mixto'
        }))
        setDbGames([...fonologicos, ...mixtos])
      } catch (e) {
        console.error('Error al cargar juegos de BD:', e)
      }
    }
    cargarJuegos()
  }, [player])

  // Temporizador para el juego demo
  useEffect(() => {
    let interval
    if (activeGame === 'silabas_magicas' && jugandoDemo && tiempo > 0) {
      interval = setInterval(() => setTiempo(t => t - 1), 1000)
    } else if (tiempo === 0 && jugandoDemo) {
      terminarDemo()
    }
    return () => clearInterval(interval)
  }, [activeGame, jugandoDemo, tiempo])

  const handleLogin = (playerData) => {
    setPlayer(playerData)
    setActiveGame(null)
    setGameFinishedData(null)
  }

  const handleLogout = () => {
    setPlayer(null)
    setActiveGame(null)
    setGameFinishedData(null)
  }

  const handleFinishRocket = (results) => {
    setGameFinishedData({
      score: results.score,
      level: results.level,
      gameName: 'Constructor de Cohetes'
    })
  }

  const handleFinishGrafema = (results) => {
    setGameFinishedData({
      score: results.score,
      level: results.level,
      gameName: 'La Caza del Grafema Perdido'
    })
  }

  // Lógica del juego Demo
  const iniciarDemo = () => {
    setVidas(3)
    setPuntaje(0)
    setTiempo(30)
    setPreguntaActual(0)
    setRespuestaSeleccionada(null)
    setJugandoDemo(true)
  }

  const responderDemo = (indice) => {
    if (respuestaSeleccionada !== null) return
    setRespuestaSeleccionada(indice)
    const pregunta = silabas[preguntaActual]
    const correcto = indice === pregunta.correcta

    if (correcto) {
      setPuntaje(p => p + 10)
      toast.success('¡Correcto! +10 puntos', { icon: '⭐' })
    } else {
      setVidas(v => v - 1)
      toast.error('Incorrecto', { icon: '❌' })
    }

    setTimeout(() => {
      setRespuestaSeleccionada(null)
      if (preguntaActual < silabas.length - 1 && vidas > (correcto ? 0 : 1)) {
        setPreguntaActual(p => p + 1)
      } else {
        terminarDemo()
      }
    }, 1000)
  }

  const terminarDemo = async () => {
    setJugandoDemo(false)
    try {
      const nivel = await api.get('/niveles/').catch(() => ({ data: [] }))
      const nivelesList = nivel.data.results || nivel.data
      const primerNivel = nivelesList[0]
      const subniveles = await api.get(`/subniveles/?nivel_id=${primerNivel?.id_nivel || 1}`).catch(() => ({ data: [] }))
      const subnivelsList = subniveles.data.results || subniveles.data
      
      await api.post('/resultados-juegos/', {
        id_paciente: player.patient_id || player.id_paciente,
        id_nivel: primerNivel?.id_nivel || 1,
        id_subnivel: subnivelsList[0]?.id_subnivel || 1,
        nombre_juego: 'Sílabas Mágicas',
        respuestas_correctas: Math.floor(puntaje / 10),
        respuestas_incorrectas: 3 - vidas,
        preguntas_totales: silabas.length,
        tiempo_jugado_segundos: 30 - tiempo,
        estrellas_ganadas: puntaje >= 30 ? 3 : puntaje >= 20 ? 2 : 1,
        porcentaje_resultado: Math.round((Math.floor(puntaje / 10) / silabas.length) * 100),
        estado_resultado: 'completado',
      })
      toast.success('¡Resultado guardado!', { icon: '🏆' })
    } catch (e) {
      console.error(e)
    }
    setGameFinishedData({
      score: puntaje,
      level: preguntaActual + 1,
      gameName: 'Sílabas Mágicas'
    })
  }

  const salirAlLobby = () => {
    setActiveGame(null)
    setGameFinishedData(null)
  }

  if (!player) {
    return <GameLogin onLogin={handleLogin} />
  }

  // Pantalla de Resultados
  if (gameFinishedData) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
          <h2 style={styles.title}>¡Buen trabajo, {player.nickname}!</h2>
          <p style={styles.subtitle}>Has completado {gameFinishedData.gameName}</p>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Puntaje</span>
              <span style={styles.statValue}>{gameFinishedData.score}</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Progreso</span>
              <span style={styles.statValue}>{gameFinishedData.level} niveles</span>
            </div>
          </div>
          <p style={styles.dbHint}>Tus resultados se han guardado automáticamente en tu historial médico. 🧠</p>
          <div style={styles.buttonGroup}>
            <button style={styles.btnPrimary} onClick={salirAlLobby}>
              🎮 Ir a la Sala de Juegos
            </button>
            <button style={styles.btnSecondary} onClick={handleLogout}>
              🚪 Salir
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 1. Selector de Juegos (Lobby de Paciente)
  if (activeGame === null) {
    return (
      <div style={styles.lobbyContainer}>
        <div style={styles.lobbyHeader}>
          <div style={styles.brandGroup}>
            <Gamepad2 style={{ width: '32px', height: '32px', color: '#a78bfa' }} />
            <h1 style={styles.lobbyTitle}>Sala de Juegos NeuroGym</h1>
          </div>
          <div style={styles.userControls}>
            <span style={styles.welcomeText}>👋 ¡Hola, <strong>{player.nickname}</strong>!</span>
            <button style={styles.btnLogoutLobby} onClick={handleLogout}>
              <LogOut style={{ width: '16px', height: '16px' }} /> Salir
            </button>
          </div>
        </div>

        <div style={styles.lobbyContent}>
          <h2 style={styles.lobbySubtitle}>Elige un juego para comenzar a entrenar tu cerebro:</h2>
          
          <div style={styles.gamesGrid}>
            {/* Juego 1: Constructor de Cohetes (Principal Phaser) */}
            <div style={styles.gameCardFeatured} onClick={() => setActiveGame('rocket_builder')}>
              <div style={styles.badgeFeatured}>RECOMENDADO ⭐</div>
              <span style={{ fontSize: '50px' }}>🚀</span>
              <h3 style={styles.gameCardTitle}>Constructor de Cohetes</h3>
              <p style={styles.gameCardDesc}>Forma palabras ordenando las sílabas. ¡Construye tu cohete y lánzalo al espacio!</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>Phaser 2D</span>
                <span style={styles.tag}>Sílabas</span>
                <span style={styles.tag}>Voz Habilitada 🎤</span>
              </div>
              <button style={styles.btnPlayFeatured} onClick={(e) => { e.stopPropagation(); setActiveGame('rocket_builder'); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Juego 2: La Caza del Grafema Perdido */}
            <div style={styles.gameCardFeatured} onClick={() => setActiveGame('grafema_hunter')}>
              <div style={{...styles.badgeFeatured, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>NUEVO 🔥</div>
              <span style={{ fontSize: '50px' }}>🔍</span>
              <h3 style={styles.gameCardTitle}>La Caza del Grafema Perdido</h3>
              <p style={styles.gameCardDesc}>¡Encuentra la letra o sílaba que falta para completar la palabra! Entrena tu reconocimiento visual.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>Grafemas</span>
                <span style={styles.tag}>Visual</span>
                <span style={styles.tag}>10 Niveles</span>
              </div>
              <button style={{...styles.btnPlayFeatured, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}} onClick={(e) => { e.stopPropagation(); setActiveGame('grafema_hunter'); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Juego 3: Sílabas Mágicas (Demo) */}
            <div style={styles.gameCard} onClick={() => { setActiveGame('silabas_magicas'); iniciarDemo(); }}>
              <span style={{ fontSize: '50px' }}>✨</span>
              <h3 style={styles.gameCardTitle}>Sílabas Mágicas</h3>
              <p style={styles.gameCardDesc}>Identifica rápidamente la primera sílaba de la palabra antes de que se acabe el tiempo.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>Velocidad</span>
                <span style={styles.tag}>Lectura</span>
              </div>
              <button style={styles.btnPlay} onClick={(e) => { e.stopPropagation(); setActiveGame('silabas_magicas'); iniciarDemo(); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Juegos cargados dinámicamente de la base de datos */}
            {dbGames.map((jg, idx) => (
              <div style={styles.gameCard} key={idx} onClick={() => { setActiveGame('silabas_magicas'); iniciarDemo(); }}>
                <span style={{ fontSize: '50px' }}>🧠</span>
                <h3 style={styles.gameCardTitle}>{jg.nombre}</h3>
                <p style={styles.gameCardDesc}>{jg.descripcion || 'Entrenamiento cognitivo terapéutico diseñado por tu psicólogo.'}</p>
                <div style={styles.tagGroup}>
                  <span style={styles.tag}>{jg.tipo === 'fonologico' ? 'Fonológico' : 'Mixto'}</span>
                </div>
                <button style={styles.btnPlay} onClick={(e) => { e.stopPropagation(); setActiveGame('silabas_magicas'); iniciarDemo(); }}>
                  ¡Jugar Ahora!
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 2. Jugando: Constructor de Cohetes (Phaser)
  if (activeGame === 'rocket_builder') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>👤 Jugador: <strong>{player.nickname}</strong> ({player.full_name})</span>
        </div>
        <div style={styles.gameBody}>
          <RocketBuilder player={player} onFinish={handleFinishRocket} />
        </div>
      </div>
    )
  }

  // 3. Jugando: La Caza del Grafema Perdido
  if (activeGame === 'grafema_hunter') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>👤 Jugador: <strong>{player.nickname}</strong> ({player.full_name})</span>
        </div>
        <div style={styles.gameBody}>
          <GrafemaHunter player={player} onFinish={handleFinishGrafema} />
        </div>
      </div>
    )
  }

  // 4. Jugando: Sílabas Mágicas (Demo Clásico)
  if (activeGame === 'silabas_magicas') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>👤 Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBodyDemo}>
          {jugandoDemo ? (
            <div style={styles.demoCard}>
              <div style={styles.demoHeader}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(3)].map((_, i) => (
                    <Heart key={i} style={{ width: '24px', height: '24px', fill: i < vidas ? '#ef4444' : 'none', color: '#ef4444' }} />
                  ))}
                </div>
                <div style={styles.demoHudItem}>
                  <Clock style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                  <span style={{ fontWeight: 'bold' }}>{tiempo}s</span>
                </div>
                <div style={styles.demoHudItem}>
                  <Star style={{ width: '18px', height: '18px', color: '#eab308', fill: '#eab308' }} />
                  <span style={{ fontWeight: 'bold' }}>{puntaje}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '8px' }}>¿Cuál es la primera sílaba de la palabra?</p>
                <h2 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '4px', color: '#fff' }}>{silabas[preguntaActual]?.palabra}</h2>
              </div>

              <div style={styles.demoGrid}>
                {silabas[preguntaActual]?.silabas.map((sil, i) => (
                  <button
                    key={i}
                    onClick={() => responderDemo(i)}
                    style={{
                      ...styles.demoBtn,
                      background: respuestaSeleccionada === null 
                        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        : respuestaSeleccionada === i 
                          ? i === silabas[preguntaActual].correcta ? '#10b981' : '#ef4444'
                          : i === silabas[preguntaActual].correcta ? '#10b981' : 'rgba(255,255,255,0.05)'
                    }}
                  >
                    {sil}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', margin: '0 auto', color: '#a78bfa' }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #020617 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Inter, sans-serif'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '28px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    backdropFilter: 'blur(8px)',
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#1e1b4b', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: '0 0 28px 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  statBox: { background: '#f3f4f6', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statLabel: { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' },
  statValue: { fontSize: '24px', fontWeight: '800', color: '#311042' },
  dbHint: { fontSize: '12px', color: '#8b5cf6', fontWeight: '600', margin: '0 0 32px 0', background: '#f5f3ff', padding: '10px 16px', borderRadius: '12px' },
  buttonGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  btnPrimary: { height: '48px', background: 'linear-gradient(135deg, #4f46e5, #c084fc)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)', transition: 'all 0.2s' },
  btnSecondary: { height: '48px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  
  // LOBBY (Sala de Juegos)
  lobbyContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #020617 100%)',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    flexDirection: 'column'
  },
  lobbyHeader: {
    height: '70px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    backdropFilter: 'blur(10px)'
  },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  lobbyTitle: { fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.5px' },
  userControls: { display: 'flex', alignItems: 'center', gap: '20px' },
  welcomeText: { fontSize: '14px', color: '#cbd5e1' },
  btnLogoutLobby: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  lobbySubtitle: {
    fontSize: '18px',
    color: '#a78bfa',
    fontWeight: '600',
    marginBottom: '32px',
    textAlign: 'center'
  },
  lobbyContent: {
    flex: 1,
    padding: '40px 60px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px'
  },
  gameCardFeatured: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid #a78bfa',
    borderRadius: '24px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(167, 139, 250, 0.2)',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  badgeFeatured: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '1px'
  },
  gameCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  gameCardTitle: { fontSize: '22px', fontWeight: '800', margin: '16px 0 8px 0', color: '#fff' },
  gameCardDesc: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 20px 0', flex: 1 },
  tagGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' },
  tag: { background: 'rgba(255, 255, 255, 0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: '#cbd5e1' },
  btnPlayFeatured: {
    width: '100%',
    height: '48px',
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
  },
  btnPlay: {
    width: '100%',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // GAME MODES VIEWPORTS (Sin márgenes)
  gameContainer: {
    minHeight: '100vh',
    background: '#090d16',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    fontFamily: 'Inter, sans-serif'
  },
  gameHeader: {
    height: '60px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 10
  },
  playerTag: { fontSize: '14px', color: '#e2e8f0' },
  btnBackToLobby: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  gameBody: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: '0px'
  },

  // DEMO GAME (Sílabas Mágicas)
  gameBodyDemo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
    padding: '40px'
  },
  demoCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
  },
  demoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '20px'
  },
  demoHudItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '6px 14px',
    borderRadius: '10px'
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  demoBtn: {
    height: '60px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
}
