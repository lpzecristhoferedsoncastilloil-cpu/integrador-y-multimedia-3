import React, { useState, useEffect } from 'react'
import GameLogin from './games/GameLogin'
import RocketBuilder from './games/RocketBuilder'
import GrafemaHunter from './games/GrafemaHunter'
import PodioFinal from './games/PodioFinal'
import AvatarRender from '../components/AvatarRender'
import SpaceParallaxBackground from '../components/SpaceParallaxBackground'
import api from '../services/api'
import { Gamepad2, Play, Star, Trophy, Loader2, Heart, Clock, LogOut, Settings, Eye, Scissors, Crown, Glasses, Smile, Orbit, Compass, Brain, Sparkles, Search, Waves, Package, Bell, Cpu, Type, Award, Activity, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import Game1_1Phonological from './games/Game1_1Phonological'
import Game1_2Superficial from './games/Game1_2Superficial'
import Game1_3Mixed from './games/Game1_3Mixed'
import Game2Cheese from './games/Game2Cheese'
import Game3Hangman from './games/Game3Hangman'
import Game4SyllableMachine from './games/Game4SyllableMachine'
import Game4_1SyllableMachine from './games/Game4_1SyllableMachine'
import Game5River from './games/Game5River'
import Game5_1River from './games/Game5_1River'
import Game6Warehouse from './games/Game6Warehouse'
import Game6_1Warehouse from './games/Game6_1Warehouse'
import Game7Temple from './games/Game7Temple'
import Game7_1Temple from './games/Game7_1Temple'
import Game8Train from './games/Game8Train'

export default function Juegos() {
  const [player, setPlayer] = useState(null)
  const [activeGame, setActiveGame] = useState(null)
  const [gameFinishedData, setGameFinishedData] = useState(null)
  const [dbGames, setDbGames] = useState([])
  const [cheeseSpeed, setCheeseSpeed] = useState(6)

  const [playerAvatar, setPlayerAvatar] = useState(null)
  const [avatarOptions, setAvatarOptions] = useState([])
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [tempAvatar, setTempAvatar] = useState(null)
  const [creatorTab, setCreatorTab] = useState('rostro')
  const [guardandoAvatar, setGuardandoAvatar] = useState(false)

  useEffect(() => {
    if (player?.id_paciente) {
      const cargarAvatar = async () => {
        try {
          const res = await api.get(`/avatar/paciente/${player.id_paciente}/`)
          setPlayerAvatar(res.data)
        } catch (e) {
          console.error('Error al cargar avatar:', e)
        }
      }
      cargarAvatar()
    }
  }, [player?.id_paciente])

  useEffect(() => {
    if (avatarOptions.length > 0) return
    const cargarOpciones = async () => {
      try {
        const res = await api.get('/avatar/opciones/')
        setAvatarOptions(res.data)
      } catch (e) {
        console.error('Error al cargar opciones de avatar:', e)
      }
    }
    cargarOpciones()
  }, [showConfigModal])

  // Estado del juego demo (Sílabas Mágicas)
  const [vidas, setVidas] = useState(3)
  const [puntaje, setPuntaje] = useState(0)
  const [tiempo, setTiempo] = useState(30)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null)
  const [jugandoDemo, setJugandoDemo] = useState(false)
  const [silabasBgTrigger, setSilabasBgTrigger] = useState(0)
  const [showSilabasHelpModal, setShowSilabasHelpModal] = useState(false)

  const silabas = [
    { palabra: 'CASA', silabas: ['CA', 'SA', 'LA', 'MA'], correcta: 0 },
    { palabra: 'MESA', silabas: ['PE', 'ME', 'SA', 'TA'], correcta: 1 },
    { palabra: 'LUNA', silabas: ['LU', 'NA', 'BO', 'CA'], correcta: 0 },
    { palabra: 'PATO', silabas: ['PA', 'TO', 'SI', 'LO'], correcta: 0 },
  ]

  useEffect(() => {
    const gameButtonStyles = document.createElement('style');
    gameButtonStyles.id = 'game-button-pulse-styles';
    gameButtonStyles.textContent = `
      @keyframes gameButtonPulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
        }
        50% {
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.7), 0 0 15px rgba(167, 139, 250, 0.5);
        }
      }
      @keyframes gameButtonPulseNormal {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }
        50% {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.6), 0 0 10px rgba(167, 139, 250, 0.4);
        }
      }
      @keyframes gameSyllablePulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 6px 16px rgba(26, 86, 219, 0.4);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 10px 24px rgba(26, 86, 219, 0.7), 0 0 15px rgba(96, 165, 250, 0.5);
        }
      }
      @keyframes modalFadeIn {
        from {
          transform: scale(0.9) translateY(20px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      .animate-pulse-slow-featured {
        animation: gameButtonPulse 2.8s ease-in-out infinite;
        transition: all 0.3s ease;
      }
      .animate-pulse-slow-featured:hover {
        transform: scale(1.08) !important;
        animation-play-state: paused;
        box-shadow: 0 12px 30px rgba(124, 58, 237, 0.9), 0 0 25px rgba(167, 139, 250, 0.8) !important;
        filter: brightness(1.15);
      }
      .animate-pulse-slow-normal {
        animation: gameButtonPulseNormal 3s ease-in-out infinite;
        transition: all 0.3s ease;
      }
      .animate-pulse-slow-normal:hover {
        transform: scale(1.06) !important;
        animation-play-state: paused;
        box-shadow: 0 10px 24px rgba(99, 102, 241, 0.8), 0 0 18px rgba(167, 139, 250, 0.6) !important;
        filter: brightness(1.15);
      }
      .animate-pulse-slow-syllable {
        animation: gameSyllablePulse 2.5s ease-in-out infinite;
        transition: all 0.2s ease;
      }
      .animate-pulse-slow-syllable:hover {
        transform: scale(1.1) !important;
        animation-play-state: paused;
        box-shadow: 0 12px 28px rgba(26, 86, 219, 0.8), 0 0 20px rgba(96, 165, 250, 0.7) !important;
        filter: brightness(1.15);
      }
      .option-card-hover {
        transition: all 0.2s ease;
      }
      .option-card-hover:hover {
        transform: scale(1.08);
        border-color: #a78bfa !important;
        box-shadow: 0 4px 12px rgba(167, 139, 250, 0.4);
      }
      .color-circle-hover {
        transition: all 0.2s ease;
      }
      .color-circle-hover:hover {
        transform: scale(1.2);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
      }
    `;
    if (!document.querySelector('#game-button-pulse-styles')) {
      document.head.appendChild(gameButtonStyles);
    }
  }, []);

  // Cargar juegos adicionales desde la base de datos
  useEffect(() => {
    if (!player?.id_paciente) return
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
  }, [player?.id_paciente])

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
      gameName: 'Constructor de Cohetes',
      gameType: 'fonologica',
      sessionId: results.sessionId
    })
  }

  const handleFinishGrafema = (results) => {
    setGameFinishedData({
      score: results.score,
      level: results.level,
      gameName: 'La Caza del Grafema Perdido',
      gameType: 'grafema',
      sessionId: results.sessionId
    })
  }

  const handleFinishGeneric = (results, gameName, gameType) => {
    setGameFinishedData({
      score: results.score,
      level: results.level,
      gameName: gameName,
      gameType: gameType,
      sessionId: results.sessionId
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
      setSilabasBgTrigger(prev => prev + 1)
      toast.success('¡Correcto! +10 puntos')
    } else {
      setVidas(v => v - 1)
      toast.error('Incorrecto')
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

  const abrirConfiguracion = () => {
    // Buscar IDs de estilo por defecto en el catálogo cargado
    const defRostro = avatarOptions.find(o => o.categoria?.toLowerCase() === 'rostro')?.id_estilo || 1;
    const defOjos = avatarOptions.find(o => o.categoria?.toLowerCase() === 'ojos')?.id_estilo || 4;
    const defCabello = avatarOptions.find(o => o.categoria?.toLowerCase() === 'cabello')?.id_estilo || 7;

    setTempAvatar(playerAvatar ? {
      ...playerAvatar,
      id_rostro: playerAvatar.id_rostro?.id_estilo || playerAvatar.id_rostro_id || playerAvatar.id_rostro || defRostro,
      id_ojos: playerAvatar.id_ojos?.id_estilo || playerAvatar.id_ojos_id || playerAvatar.id_ojos || defOjos,
      id_cabello: playerAvatar.id_cabello?.id_estilo || playerAvatar.id_cabello_id || playerAvatar.id_cabello || defCabello,
      id_gorra: playerAvatar.id_gorra?.id_estilo || playerAvatar.id_gorra_id || playerAvatar.id_gorra || null,
      id_lentes: playerAvatar.id_lentes?.id_estilo || playerAvatar.id_lentes_id || playerAvatar.id_lentes || null,
    } : {
      id_rostro: defRostro,
      id_ojos: defOjos,
      id_cabello: defCabello,
      id_gorra: null,
      id_lentes: null,
      color_piel: '#ffd8b3',
      color_ojos: '#4f46e5',
      color_cabello: '#1e1b4b',
      rostro_recurso: 'rostro_redondo',
      ojos_recurso: 'ojos_felices',
      cabello_recurso: 'cabello_corto',
      gorra_recurso: null,
      lentes_recurso: null
    })
    setCreatorTab('rostro')
    setShowConfigModal(true)
  }

  const handleSelectPiece = (tipo, idOption, recurso) => {
    setTempAvatar(prev => ({
      ...prev,
      [`id_${tipo}`]: idOption,
      [`${tipo}_recurso`]: recurso
    }))
  }

  const handleSelectColor = (tipo, color) => {
    setTempAvatar(prev => ({
      ...prev,
      [tipo]: color
    }))
  }

  const guardarAvatar = async () => {
    setGuardandoAvatar(true)
    try {
      const getCleanId = (val) => {
        if (!val) return null;
        if (typeof val === 'object') return val.id_estilo || val.id || null;
        return val;
      };

      const payload = {
        id_rostro: getCleanId(tempAvatar.id_rostro),
        id_ojos: getCleanId(tempAvatar.id_ojos),
        id_cabello: getCleanId(tempAvatar.id_cabello),
        id_gorra: getCleanId(tempAvatar.id_gorra),
        id_lentes: getCleanId(tempAvatar.id_lentes),
        color_piel: tempAvatar.color_piel,
        color_ojos: tempAvatar.color_ojos,
        color_cabello: tempAvatar.color_cabello
      }
      const res = await api.post(`/avatar/paciente/${player.id_paciente}/`, payload)
      setPlayerAvatar(res.data)
      toast.success('¡Tu personaje espacial se guardó con éxito!')
      setShowConfigModal(false)
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar tu personaje')
    } finally {
      setGuardandoAvatar(false)
    }
  }

  const salirAlLobby = () => {
    setActiveGame(null)
    setGameFinishedData(null)
  }

  if (!player) {
    return <GameLogin onLogin={handleLogin} />
  }

  const handleRetryGame = () => {
    const game = gameFinishedData.gameType === 'fonologica'
      ? 'rocket_builder'
      : gameFinishedData.gameType === 'grafema'
        ? 'grafema_hunter'
        : gameFinishedData.gameType === 'silabas_magicas'
          ? 'silabas_magicas'
          : gameFinishedData.gameType;
    
    if (game === 'silabas_magicas') {
      iniciarDemo();
    }
    setActiveGame(game);
    setGameFinishedData(null);
  }

  const handleExitGame = () => {
    setActiveGame(null);
    setGameFinishedData(null);
  }

  // Pantalla de Resultados (Podio Animado Kahoot!)
  if (gameFinishedData) {
    return (
      <PodioFinal
        sessionData={gameFinishedData}
        onRetry={handleRetryGame}
        onExit={handleExitGame}
      />
    )
  }

  // 1. Selector de Juegos (Lobby de Paciente)
  if (activeGame === null) {
    return (
      <div style={styles.lobbyContainer}>
        <div style={styles.lobbyHeader}>
          {/* Esquina superior izquierda */}
          <div style={styles.brandGroup}>
            <Gamepad2 style={{ width: '32px', height: '32px', color: '#a78bfa' }} />
            <h1 style={styles.lobbyTitle}>Sala de Juegos NeuroGym</h1>
          </div>

          {/* Centro superior: texto de bienvenida "¡Hola, [Apodo del Niño]!" grande, llamativo y centrado */}
          <div style={styles.centeredWelcome}>
            <span style={styles.largeWelcomeText}>¡Hola, <strong style={styles.glowNickname}>{player.nickname}</strong>!</span>
          </div>

          {/* Esquina superior derecha */}
          <div style={styles.userControls}>
            {/* Visualización del avatar personalizado del niño */}
            <div style={styles.avatarPreviewWrapper} onClick={abrirConfiguracion} title="¡Configurar mi personaje!">
              <AvatarRender avatar={playerAvatar} className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
            </div>

            {/* Botón de Configuraciones engranaje */}
            <button 
              className="animate-pulse-slow-normal" 
              style={styles.btnConfigLobby} 
              onClick={abrirConfiguracion}
            >
              <Settings style={{ width: '18px', height: '18px', color: '#facc15' }} />
              <span>Configuraciones</span>
            </button>

            {/* Botón Salir */}
            <button style={styles.btnLogoutLobby} onClick={handleLogout}>
              <LogOut style={{ width: '16px', height: '16px' }} /> 
              <span>Salir</span>
            </button>
          </div>
        </div>

        <div style={styles.lobbyContent}>
          <h2 style={styles.lobbySubtitle}>Elige un juego para comenzar a entrenar tu cerebro:</h2>
          
          <div style={styles.gamesGrid}>
            {/* Juego 1: Constructor de Cohetes (Principal Phaser) */}
            <div style={styles.gameCardFeatured} onClick={() => setActiveGame('rocket_builder')}>
              <div style={styles.badgeFeatured}>RECOMENDADO</div>
              <div className="flex items-center justify-center p-3 mb-2">
                <Orbit className="w-12 h-12 text-indigo-400 animate-pulse" />
              </div>
              <h3 style={styles.gameCardTitle}>Constructor de Cohetes</h3>
              <p style={styles.gameCardDesc}>Forma palabras ordenando las sílabas. ¡Construye tu cohete y lánzalo al espacio!</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>Phaser 2D</span>
                <span style={styles.tag}>Sílabas</span>
                <span style={styles.tag}>Voz Habilitada</span>
              </div>
              <button className="animate-pulse-slow-featured" style={styles.btnPlayFeatured} onClick={(e) => { e.stopPropagation(); setActiveGame('rocket_builder'); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Juego 2: La Caza del Grafema Perdido */}
            <div style={styles.gameCardFeatured} onClick={() => setActiveGame('grafema_hunter')}>
              <div style={{...styles.badgeFeatured, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>NUEVO</div>
              <div className="flex items-center justify-center p-3 mb-2">
                <Search className="w-12 h-12 text-yellow-400 animate-bounce" />
              </div>
              <h3 style={styles.gameCardTitle}>La Caza del Grafema Perdido</h3>
              <p style={styles.gameCardDesc}>¡Encuentra la letra o sílaba que falta para completar la palabra! Entrena tu reconocimiento visual.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>Grafemas</span>
                <span style={styles.tag}>Visual</span>
                <span style={styles.tag}>10 Niveles</span>
              </div>
              <button className="animate-pulse-slow-featured" style={{...styles.btnPlayFeatured, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}} onClick={(e) => { e.stopPropagation(); setActiveGame('grafema_hunter'); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Juego 3: Sílabas Mágicas (Demo) */}
            <div style={styles.gameCard} onClick={() => { setActiveGame('silabas_magicas'); iniciarDemo(); }}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
              <h3 style={styles.gameCardTitle}>Sílabas Mágicas</h3>
              <p style={styles.gameCardDesc}>Identifica rápidamente la primera sílaba de la palabra antes de que se acabe el tiempo.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>Velocidad</span>
                <span style={styles.tag}>Lectura</span>
              </div>
              <button className="animate-pulse-slow-normal" style={styles.btnPlay} onClick={(e) => { e.stopPropagation(); setActiveGame('silabas_magicas'); iniciarDemo(); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Game 1: El Laberinto - La Isla de los Duendes */}
            <div style={{ ...styles.gameCard, cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Compass className="w-12 h-12 text-teal-400 animate-pulse" style={{ animationDuration: '4s' }} />
              </div>
              <h3 style={styles.gameCardTitle}>La Isla de los Duendes</h3>
              <p style={styles.gameCardDesc}>Explora un laberinto gigante de 5x5. ¡Elige tu ruta para resolver los desafíos de los duendes y escapar!</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>5 x 5 Grid</span>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <button 
                  className="animate-pulse-slow-normal transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2" 
                  style={{
                    ...styles.btnPlay,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    height: '42px',
                    fontSize: '14px'
                  }} 
                  onClick={(e) => { e.stopPropagation(); setActiveGame('maze_phonological'); }}
                >
                   Juego Fonológico
                </button>
                <button 
                  className="animate-pulse-slow-normal transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2" 
                  style={{
                    ...styles.btnPlay,
                    background: 'linear-gradient(135deg, #d946ef 0%, #c084fc 100%)',
                    boxShadow: '0 4px 12px rgba(217, 70, 239, 0.35)',
                    height: '42px',
                    fontSize: '14px'
                  }} 
                  onClick={(e) => { e.stopPropagation(); setActiveGame('maze_superficial'); }}
                >
                   Juego Superficial
                </button>
                <button 
                  className="animate-pulse-slow-normal transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2" 
                  style={{
                    ...styles.btnPlay,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
                    height: '42px',
                    fontSize: '14px'
                  }} 
                  onClick={(e) => { e.stopPropagation(); setActiveGame('maze_mixed'); }}
                >
                   Juego Mixto
                </button>
              </div>
            </div>

            {/* Game 2: El Reto del Queso y los Ratones */}
            <div style={styles.gameCard} onClick={() => setActiveGame('cheese')}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Award className="w-12 h-12 text-yellow-400 animate-bounce" />
              </div>
              <h3 style={styles.gameCardTitle}>El Reto del Queso</h3>
              <p style={styles.gameCardDesc}>Ayuda a los ratones a alcanzar el queso identificando palabras que riman entre sí en 3D.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>Rimas</span>
              </div>
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold" onClick={(e) => e.stopPropagation()}>
                <span className="text-gray-400 mr-1">Velocidad:</span>
                <button 
                  onClick={() => setCheeseSpeed(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-lg border border-slate-700/50 flex items-center justify-center transition-all cursor-pointer"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold text-yellow-400">{cheeseSpeed}</span>
                <button 
                  onClick={() => setCheeseSpeed(prev => Math.min(10, prev + 1))}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-lg border border-slate-700/50 flex items-center justify-center transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
              <button className="animate-pulse-slow-normal" style={styles.btnPlay} onClick={(e) => { e.stopPropagation(); setActiveGame('cheese'); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Game 3: El Rescate de las Letras */}
            <div style={styles.gameCard} onClick={() => setActiveGame('hangman')}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Type className="w-12 h-12 text-pink-400 animate-pulse" />
              </div>
              <h3 style={styles.gameCardTitle}>El Rescate de las Letras</h3>
              <p style={styles.gameCardDesc}>Salva al astronauta adivinando las letras de la palabra misteriosa en el calabozo 3D.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>Ortografía</span>
              </div>
              <button className="animate-pulse-slow-normal" style={styles.btnPlay} onClick={(e) => { e.stopPropagation(); setActiveGame('hangman'); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Game 4: La Máquina de las Sílabas */}
            <div style={styles.gameCard}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Cpu className="w-12 h-12 text-rose-400 animate-pulse" />
              </div>
              <h3 style={styles.gameCardTitle}>La Máquina de Sílabas</h3>
              <p style={styles.gameCardDesc}>Combina prefijos y sufijos en la línea de montaje de la máquina espacial para formar palabras.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>Morfología</span>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('machine7'); }}
                >
                  Jugar (Niños 7 años)
                </button>
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('machine'); }}
                >
                  Jugar (Niños 10 años)
                </button>
              </div>
            </div>

            {/* Game 5: El Río de las Palabras Cruzadas */}
            <div style={styles.gameCard}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Waves className="w-12 h-12 text-blue-400 animate-pulse" />
              </div>
              <h3 style={styles.gameCardTitle}>El Río Cósmico</h3>
              <p style={styles.gameCardDesc}>Esquiva los obstáculos del río espacial recolectando sinónimos y antónimos correctos.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>Semántica</span>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('river7'); }}
                >
                  Jugar (Niños 7 años)
                </button>
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('river'); }}
                >
                  Jugar (Niños 10 años)
                </button>
              </div>
            </div>

            {/* Game 6: El Almacén de las Letras Perdidas */}
            <div style={styles.gameCard}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Package className="w-12 h-12 text-emerald-400 animate-bounce" />
              </div>
              <h3 style={styles.gameCardTitle}>El Almacén</h3>
              <p style={styles.gameCardDesc}>Encuentra y clasifica palabras en una sopa de letras 3D interactiva adaptada por edad.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>Gramática</span>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('warehouse7'); }}
                >
                  Jugar (Niños 7 años)
                </button>
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('warehouse'); }}
                >
                  Jugar (Niños 10 años)
                </button>
              </div>
            </div>

            {/* Game 7: El Eco de las Sílabas */}
            <div style={styles.gameCard}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Bell className="w-12 h-12 text-amber-400 animate-pulse" />
              </div>
              <h3 style={styles.gameCardTitle}>El Eco de las Sílabas</h3>
              <p style={styles.gameCardDesc}>Identifica la sílaba tónica al ritmo del gong y clasifica palabras por su acentuación.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>Acentuación</span>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('temple7'); }}
                >
                  Jugar (Niños 7 años)
                </button>
                <button
                  className="animate-pulse-slow-normal w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:scale-103 cursor-pointer text-xs uppercase"
                  onClick={(e) => { e.stopPropagation(); setActiveGame('temple'); }}
                >
                  Jugar (Niños 10 años)
                </button>
              </div>
            </div>

            {/* Game 8: El Tren de las Letras */}
            <div style={styles.gameCard} onClick={() => setActiveGame('train')}>
              <div className="flex items-center justify-center p-3 mb-2">
                <Activity className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
              <h3 style={styles.gameCardTitle}>El Tren de las Letras</h3>
              <p style={styles.gameCardDesc}>Clasifica juguetes 3D arrastrándolos al vagón que coincide con su letra inicial.</p>
              <div style={styles.tagGroup}>
                <span style={styles.tag}>3D R3F</span>
                <span style={styles.tag}>Fonemas</span>
              </div>
              <button className="animate-pulse-slow-normal" style={styles.btnPlay} onClick={(e) => { e.stopPropagation(); setActiveGame('train'); }}>
                ¡Jugar Ahora!
              </button>
            </div>

            {/* Juegos cargados dinámicamente de la base de datos */}
            {dbGames.map((jg, idx) => (
              <div style={styles.gameCard} key={idx} onClick={() => { setActiveGame('silabas_magicas'); iniciarDemo(); }}>
                <div className="flex items-center justify-center p-3 mb-2">
                  <Brain className="w-12 h-12 text-cyan-400 animate-pulse" />
                </div>
                <h3 style={styles.gameCardTitle}>{jg.nombre}</h3>
                <p style={styles.gameCardDesc}>{jg.descripcion || 'Entrenamiento cognitivo diseñado por tu psicólogo.'}</p>
                <div style={styles.tagGroup}>
                  <span style={styles.tag}>{jg.tipo === 'fonologico' ? 'Fonológico' : 'Mixto'}</span>
                </div>
                <button className="animate-pulse-slow-normal" style={styles.btnPlay} onClick={(e) => { e.stopPropagation(); setActiveGame('silabas_magicas'); iniciarDemo(); }}>
                  ¡Jugar Ahora!
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL CREADOR DE AVATARES PERSONALIZADOS */}
        {showConfigModal && tempAvatar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              
              {/* Encabezado del Modal */}
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Orbit style={{ width: '28px', height: '28px', color: '#facc15' }} className="animate-spin" />
                  <h3 style={styles.modalTitle}>Diseña tu Personaje Espacial</h3>
                </div>
                <button style={styles.btnCloseModal} onClick={() => setShowConfigModal(false)}>✕</button>
              </div>

              {/* Cuerpo del Modal */}
              <div style={styles.modalBody}>
                
                {/* Panel Izquierdo: Vista Previa en Tiempo Real */}
                <div style={styles.leftPreviewPanel}>
                  <div style={styles.previewContainer}>
                    <AvatarRender avatar={tempAvatar} className="w-56 h-56" />
                  </div>
                  <div style={styles.nicknameTag}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#facc15' }}>{player.nickname}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', textAlign: 'center', lineHeight: '1.4' }}>
                    Selecciona los estilos y colores preferidos en el panel derecho.
                  </p>
                </div>

                {/* Panel Derecho: Categorías y Opciones */}
                <div style={styles.rightSelectorPanel}>
                  
                  {/* Pestañas de Navegación */}
                  <div style={styles.tabBar}>
                    {['rostro', 'ojos', 'cabello', 'gorra', 'lentes'].map((tab) => {
                      let tabIcon = null;
                      if (tab === 'rostro') tabIcon = <Smile className="w-4 h-4 mr-1.5 inline-block" />;
                      if (tab === 'ojos') tabIcon = <Eye className="w-4 h-4 mr-1.5 inline-block" />;
                      if (tab === 'cabello') tabIcon = <Scissors className="w-4 h-4 mr-1.5 inline-block" />;
                      if (tab === 'gorra') tabIcon = <Crown className="w-4 h-4 mr-1.5 inline-block" />;
                      if (tab === 'lentes') tabIcon = <Glasses className="w-4 h-4 mr-1.5 inline-block" />;

                      return (
                        <button
                          key={tab}
                          onClick={() => setCreatorTab(tab)}
                          className="hover:scale-105 transition-all duration-200"
                          style={{
                            ...styles.tabButton,
                            ...(creatorTab === tab ? styles.tabButtonActive : {})
                          }}
                        >
                          {tabIcon}
                          {tab.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Contenido de la Pestaña */}
                  <div style={styles.optionsContent}>
                    
                    {/* PARTE A: Seleccionar Forma/Estilo */}
                    <div>
                      <h4 style={styles.sectionSubtitle}>Selecciona el Estilo:</h4>
                      <div className="grid grid-cols-3 gap-4 bg-transparent max-h-[220px] overflow-y-auto p-1 scrollbar-thin">
                        
                        {/* Botón de "Ninguno" para gorra y lentes */}
                        {(creatorTab === 'gorra' || creatorTab === 'lentes') && (
                          <button
                            onClick={() => handleSelectPiece(creatorTab, null, null)}
                            className={`option-card-hover ${tempAvatar[`id_${creatorTab}`] === null ? 'animate-pulse-slow-normal' : ''}`}
                            style={{
                              ...styles.optionCard,
                              ...(tempAvatar[`id_${creatorTab}`] === null ? styles.optionCardActive : {})
                            }}
                          >
                            <span style={{ fontSize: '24px' }}>✕</span>
                            <span style={{ fontSize: '11px', fontWeight: '800', marginTop: '4px' }}>Ninguno</span>
                          </button>
                        )}

                        {avatarOptions
                          .filter(opt => opt.categoria?.toLowerCase() === creatorTab?.toLowerCase())
                          .map((opt) => {
                            const currentId = tempAvatar[`id_${creatorTab}`];
                            const activeId = currentId?.id_estilo || currentId?.id || currentId;
                            const isActive = activeId === opt.id_estilo;
                            
                            // Volumetric mini-character preview representation
                            let previewAvatar = {};
                            if (opt.categoria?.toLowerCase() === 'rostro') {
                              previewAvatar = { color_piel: '#ffd8b3', rostro_recurso: opt.ruta_recurso };
                            } else if (opt.categoria?.toLowerCase() === 'ojos') {
                              previewAvatar = { color_piel: '#ffd8b3', rostro_recurso: 'rostro_redondo', ojos_recurso: opt.ruta_recurso, color_ojos: '#4f46e5' };
                            } else if (opt.categoria?.toLowerCase() === 'cabello') {
                              previewAvatar = { color_piel: '#ffd8b3', rostro_recurso: 'rostro_redondo', cabello_recurso: opt.ruta_recurso, color_cabello: '#1e1b4b' };
                            } else if (opt.categoria?.toLowerCase() === 'gorra') {
                              previewAvatar = { color_piel: '#ffd8b3', rostro_recurso: 'rostro_redondo', gorra_recurso: opt.ruta_recurso };
                            } else if (opt.categoria?.toLowerCase() === 'lentes') {
                              previewAvatar = { color_piel: '#ffd8b3', rostro_recurso: 'rostro_redondo', lentes_recurso: opt.ruta_recurso };
                            }

                            return (
                              <button
                                key={opt.id_estilo}
                                onClick={() => handleSelectPiece(creatorTab, opt.id_estilo, opt.ruta_recurso)}
                                className={`option-card-hover ${isActive ? 'animate-pulse-slow-normal' : ''}`}
                                style={{
                                  ...styles.optionCard,
                                  ...(isActive ? styles.optionCardActive : {})
                                }}
                              >
                                <AvatarRender avatar={previewAvatar} className="w-14 h-14" />
                                <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', textAlign: 'center', lineHeight: '1.2' }}>
                                  {opt.nombre_estilo}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* PARTE B: Seleccionar Color (Únicamente para Rostro, Ojos y Cabello) */}
                    {(creatorTab === 'rostro' || creatorTab === 'ojos' || creatorTab === 'cabello') && (
                      <div style={{ marginTop: '10px' }}>
                        <h4 style={styles.sectionSubtitle}>Selecciona el Color:</h4>
                        <div style={styles.colorsGrid}>
                          {creatorTab === 'rostro' && [
                            '#ffd8b3', '#f1c27d', '#ffdbac', '#e0ac69', '#8d5524', '#ffcccc'
                          ].map((col) => (
                            <button
                              key={col}
                              onClick={() => handleSelectColor('color_piel', col)}
                              className="color-circle-hover"
                              style={{
                                ...styles.colorCircle,
                                backgroundColor: col,
                                border: tempAvatar.color_piel === col ? '4px solid #facc15' : '2px solid rgba(255,255,255,0.2)'
                              }}
                            />
                          ))}

                          {creatorTab === 'ojos' && [
                            '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#3b82f6', '#7c3aed', '#000000'
                          ].map((col) => (
                            <button
                              key={col}
                              onClick={() => handleSelectColor('color_ojos', col)}
                              className="color-circle-hover"
                              style={{
                                ...styles.colorCircle,
                                backgroundColor: col,
                                border: tempAvatar.color_ojos === col ? '4px solid #facc15' : '2px solid rgba(255,255,255,0.2)'
                              }}
                            />
                          ))}

                          {creatorTab === 'cabello' && [
                            '#1e1b4b', '#b45309', '#facc15', '#15803d', '#a21caf', '#e11d48', '#475569', '#ffffff'
                          ].map((col) => (
                            <button
                              key={col}
                              onClick={() => handleSelectColor('color_cabello', col)}
                              className="color-circle-hover"
                              style={{
                                ...styles.colorCircle,
                                backgroundColor: col,
                                border: tempAvatar.color_cabello === col ? '4px solid #facc15' : '2px solid rgba(255,255,255,0.2)'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Pie del Modal */}
              <div style={styles.modalFooter}>
                <button 
                  style={styles.btnCancelModal} 
                  onClick={() => setShowConfigModal(false)}
                  disabled={guardandoAvatar}
                >
                  Cancelar
                </button>
                <button 
                  className="animate-pulse-slow-featured" 
                  style={{
                    ...styles.btnSaveModal,
                    cursor: guardandoAvatar ? 'not-allowed' : 'pointer'
                  }} 
                  onClick={guardarAvatar}
                  disabled={guardandoAvatar}
                >
                  {guardandoAvatar ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" style={{ display: 'inline', marginRight: '6px', color: '#fff' }} />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Personaje Space'
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    )
  }

  // 2. Jugando: Constructor de Cohetes (Phaser)
  if (activeGame === 'rocket_builder') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong> ({player.full_name})</span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
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
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong> ({player.full_name})</span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
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
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBodyDemo}>
          <SpaceParallaxBackground launchTrigger={silabasBgTrigger} />

          {/* Help Button */}
          <button
            onClick={() => setShowSilabasHelpModal(true)}
            className="absolute top-4 right-28 p-2.5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 flex items-center justify-center"
            title="¿Cómo jugar?"
          >
            <HelpCircle className="w-5 h-5 text-indigo-300" />
          </button>

          {/* Exit Button */}
          <button
            onClick={salirAlLobby}
            className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 text-sm"
          >
            SALIR
          </button>
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

        {/* Help Modal Overlay */}
        {showSilabasHelpModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative">
              <HelpCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-white mb-2">Sílabas Mágicas</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Escucha o lee la palabra en el centro de la pantalla.
                Elige la sílaba correcta de las opciones de abajo para completar la palabra antes de que se acabe el tiempo.
              </p>
              <button onClick={() => setShowSilabasHelpModal(false)} className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition duration-200">
                ¡Entendido!
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 5.1. Jugando: El Laberinto de los Duendes - Juego Fonológico (3D R3F)
  if (activeGame === 'maze_phonological') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game1_1Phonological player={player} onFinish={(res) => handleFinishGeneric(res, 'La Isla de los Duendes (Fonológico)', 'maze_phonological')} />
        </div>
      </div>
    )
  }

  // 5.2. Jugando: El Laberinto de los Cofres - Juego Superficial (3D R3F)
  if (activeGame === 'maze_superficial') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game1_2Superficial player={player} onFinish={(res) => handleFinishGeneric(res, 'El Laberinto de los Cofres (Superficial)', 'maze_superficial')} />
        </div>
      </div>
    )
  }

  // 5.3. Jugando: El Laberinto del Constructor - Juego Mixto (3D R3F)
  if (activeGame === 'maze_mixed') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game1_3Mixed player={player} onFinish={(res) => handleFinishGeneric(res, 'El Laberinto del Constructor (Mixto)', 'maze_mixed')} />
        </div>
      </div>
    )
  }

  // 6. Jugando: El Reto del Queso y los Ratones (3D R3F)
  if (activeGame === 'cheese') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game2Cheese player={player} speedLevel={cheeseSpeed} onFinish={(res) => handleFinishGeneric(res, 'El Reto del Queso y los Ratones', 'cheese')} />
        </div>
      </div>
    )
  }

  // 7. Jugando: El Rescate de las Letras (3D R3F)
  if (activeGame === 'hangman') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game3Hangman player={player} onFinish={(res) => handleFinishGeneric(res, 'El Rescate de las Letras', 'hangman')} />
        </div>
      </div>
    )
  }

  // 8. Jugando: La Máquina de las Sílabas (3D R3F)
  if (activeGame === 'machine') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game4SyllableMachine player={player} onFinish={(res) => handleFinishGeneric(res, 'La Máquina de las Sílabas', 'machine')} />
        </div>
      </div>
    )
  }

  // 8.1 Jugando: La Máquina de las Sílabas para Niños de 7 años (3D R3F)
  if (activeGame === 'machine7') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game4_1SyllableMachine player={player} onFinish={(res) => handleFinishGeneric(res, 'La Máquina de Sílabas - 7 años', 'machine')} />
        </div>
      </div>
    )
  }

  // 9. Jugando: El Río de las Palabras Cruzadas (3D R3F)
  if (activeGame === 'river') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game5River player={player} onFinish={(res) => handleFinishGeneric(res, 'El Río de las Palabras Cruzadas', 'river')} />
        </div>
      </div>
    )
  }

  // 9.1 Jugando: El Río Cósmico para Niños de 7 años (3D R3F)
  if (activeGame === 'river7') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game5_1River player={player} onFinish={(res) => handleFinishGeneric(res, 'El Río Cósmico - 7 años', 'river')} />
        </div>
      </div>
    )
  }

  // 10. Jugando: El Almacén de las Letras Perdidas (3D R3F)
  if (activeGame === 'warehouse') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game6Warehouse player={player} onFinish={(res) => handleFinishGeneric(res, 'El Almacén de las Letras Perdidas', 'warehouse')} />
        </div>
      </div>
    )
  }

  // 10.1 Jugando: El Almacén para Niños de 7 años (3D R3F)
  if (activeGame === 'warehouse7') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game6_1Warehouse player={player} onFinish={(res) => handleFinishGeneric(res, 'El Almacén - 7 años', 'warehouse')} />
        </div>
      </div>
    )
  }

  // 11. Jugando: El Eco de las Sílabas (3D R3F) – 10 años
  if (activeGame === 'temple') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game7Temple player={player} onFinish={(res) => handleFinishGeneric(res, 'El Eco de las Sílabas', 'temple')} />
        </div>
      </div>
    )
  }

  // 11.1 Jugando: El Eco de las Sílabas – 7 años
  if (activeGame === 'temple7') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game7_1Temple player={player} onFinish={(res) => handleFinishGeneric(res, 'El Eco de las Sílabas - 7 años', 'temple')} />
        </div>
      </div>
    )
  }

  // 12. Jugando: El Tren de las Letras (3D R3F)
  if (activeGame === 'train') {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameHeader}>
          <span style={styles.playerTag}>Jugador: <strong>{player.nickname}</strong></span>
          <button style={styles.btnBackToLobby} onClick={salirAlLobby}>Volver a la Sala</button>
        </div>
        <div style={styles.gameBody}>
          <Game8Train player={player} onFinish={(res) => handleFinishGeneric(res, 'El Tren de las Letras', 'train')} />
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
    height: '80px',
    background: 'rgba(15, 23, 42, 0.65)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    backdropFilter: 'blur(12px)',
    position: 'relative',
    zIndex: 20
  },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  lobbyTitle: { fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.5px' },
  
  centeredWelcome: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    pointerEvents: 'none'
  },
  largeWelcomeText: {
    fontSize: '25px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '0.5px',
    textShadow: '0 0 10px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)',
  },
  glowNickname: {
    background: 'linear-gradient(135deg, #facc15 0%, #fb923c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '900'
  },
  avatarPreviewWrapper: {
    border: '2.5px solid rgba(167, 139, 250, 0.5)',
    borderRadius: '50%',
    padding: '2px',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 0 12px rgba(167, 139, 250, 0.3)'
  },
  btnConfigLobby: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
    border: '1px solid rgba(167, 139, 250, 0.35)',
    color: '#fff',
    padding: '8px 18px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
  },
  
  userControls: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcomeText: { fontSize: '14px', color: '#cbd5e1' },
  btnLogoutLobby: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)'
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
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
    transition: 'all 0.3s ease'
  },

  // MODAL AVATAR CREATOR
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modalContent: {
    background: 'linear-gradient(135deg, #131238 0%, #080a1c 100%)',
    border: '2px solid rgba(167, 139, 250, 0.3)',
    borderRadius: '32px',
    width: '100%',
    maxWidth: '860px',
    boxShadow: '0 25px 60px -12px rgba(124, 58, 237, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'modalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  modalHeader: {
    padding: '20px 30px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.02)'
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#fff',
    margin: 0,
    fontFamily: 'Inter, sans-serif'
  },
  btnCloseModal: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '4px',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '30px',
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: '30px',
    maxHeight: '480px',
    overflowY: 'auto'
  },
  leftPreviewPanel: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 0 24px rgba(0, 0, 0, 0.3)'
  },
  previewContainer: {
    background: 'rgba(15, 23, 42, 0.65)',
    borderRadius: '50%',
    padding: '10px',
    boxShadow: '0 12px 36px rgba(124, 58, 237, 0.25)',
    border: '3.5px solid rgba(167, 139, 250, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '240px',
    height: '240px',
    overflow: 'visible'
  },
  nicknameTag: {
    marginTop: '18px',
    background: 'rgba(250, 204, 21, 0.12)',
    border: '1.5px solid rgba(250, 204, 21, 0.35)',
    padding: '6px 20px',
    borderRadius: '12px',
    fontWeight: '900',
    letterSpacing: '0.5px'
  },
  rightSelectorPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  tabButton: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#94a3b8',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.5px'
  },
  tabButtonActive: {
    background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    border: '1px solid #c084fc',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)'
  },
  optionsContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionSubtitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#a78bfa',
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
    gap: '12px',
    maxHeight: '190px',
    overflowY: 'auto',
    padding: '4px'
  },
  optionCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '18px',
    padding: '12px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
  },
  optionCardActive: {
    background: 'rgba(124, 58, 237, 0.15)',
    border: '2px solid #a78bfa',
    boxShadow: '0 0 14px rgba(167, 139, 250, 0.35)',
    transform: 'scale(1.03)'
  },
  colorsGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    padding: '4px'
  },
  colorCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 6px rgba(0,0,0,0.25)'
  },
  modalFooter: {
    padding: '20px 30px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'end',
    gap: '16px',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  btnCancelModal: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#cbd5e1',
    padding: '10px 22px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnSaveModal: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '800',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)'
  },

  // GAME MODES VIEWPORTS (Sin márgenes)
  gameContainer: {
    height: '100vh',
    background: '#090d16',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    overflow: 'hidden'
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
    height: 'calc(100vh - 60px)',
    width: '100%',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: '0px',
    overflow: 'hidden'
  },

  // DEMO GAME (Sílabas Mágicas)
  gameBodyDemo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden'
  },
  demoCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 2
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
