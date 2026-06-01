// ============================================================
// pages/games/GrafemaHunter.jsx — La Caza del Grafema Perdido
// Juego 2: Dislexia — Grafema
// El jugador identifica el grafema correcto para completar palabras
// Niveles 1-10 con dificultad progresiva
// Pure React con CSS animations (sin Phaser)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import API from '../../services/api';

// ---- Palabras por nivel (DEFAULTS) ----
const DEFAULT_LEVELS = {
  1: {
    words: [
      { display: '_ASA', answer: 'C', options: ['C', 'M', 'P', 'L'], hint: 'Donde vives' },
      { display: '_ATO', answer: 'G', options: ['G', 'T', 'P', 'R'], hint: 'Un animal que maúlla' },
      { display: '_UNA', answer: 'L', options: ['L', 'M', 'N', 'T'], hint: 'Brilla en la noche' },
      { display: '_OSA', answer: 'R', options: ['R', 'C', 'P', 'L'], hint: 'Una flor bonita' },
      { display: '_ESO', answer: 'P', options: ['P', 'B', 'M', 'L'], hint: 'Se mide en kilos' },
    ],
    label: 'Letras iniciales',
    timeLimit: 0,
  },
  2: {
    words: [
      { display: 'SOL_', answer: 'O', options: ['O', 'A', 'E', 'I'], hint: 'Cuando estás sin compañía' },
      { display: 'GAT_', answer: 'O', options: ['O', 'A', 'E', 'U'], hint: 'Animal que dice miau' },
      { display: 'PAN_', answer: 'A', options: ['A', 'O', 'E', 'I'], hint: 'Se hace con harina' },
      { display: 'MES_', answer: 'A', options: ['A', 'O', 'E', 'U'], hint: 'Donde comes' },
      { display: 'LUZ_', answer: 'A', options: ['A', 'O', 'E', 'I'], hint: 'Lo que alumbra pero... ¡sin nada!' },
    ],
    label: 'Letras finales',
    timeLimit: 0,
  },
  3: {
    words: [
      { display: '_LOTA', answer: 'PE', options: ['PE', 'BO', 'MA', 'TI'], hint: 'Un juguete redondo' },
      { display: '_RRO', answer: 'PE', options: ['PE', 'GO', 'BU', 'CA'], hint: 'Mejor amigo del hombre' },
      { display: '_LLA', answer: 'SI', options: ['SI', 'PA', 'BO', 'TI'], hint: 'Para sentarse' },
      { display: '_SA', answer: 'CA', options: ['CA', 'ME', 'PO', 'BO'], hint: 'Donde vive la familia' },
      { display: '_NO', answer: 'MA', options: ['MA', 'PI', 'RE', 'LU'], hint: 'Parte del cuerpo' },
    ],
    label: 'Sílabas iniciales',
    timeLimit: 0,
  },
  4: {
    words: [
      { display: 'CA_A', answer: 'S', options: ['S', 'M', 'L', 'R'], hint: 'Donde vives' },
      { display: 'PA_O', answer: 'T', options: ['T', 'L', 'N', 'S'], hint: 'Un ave' },
      { display: 'ME_A', answer: 'S', options: ['S', 'T', 'L', 'N'], hint: 'Un mueble' },
      { display: 'LU_A', answer: 'N', options: ['N', 'C', 'P', 'M'], hint: 'Brilla de noche' },
      { display: 'CO_A', answer: 'P', options: ['P', 'M', 'S', 'L'], hint: 'Para beber agua' },
    ],
    label: 'Letras del medio',
    timeLimit: 0,
  },
  5: {
    words: [
      { display: '_OTE', answer: 'b', options: ['b', 'd', 'p', 'q'], hint: 'Un recipiente' },
      { display: '_EDO', answer: 'd', options: ['d', 'b', 'p', 'q'], hint: 'Parte de la mano' },
      { display: '_OLA', answer: 'b', options: ['b', 'd', 'p', 'q'], hint: 'De jugar bolos' },
      { display: '_ADO', answer: 'd', options: ['d', 'b', 'p', 'q'], hint: 'Cada lado de algo' },
      { display: '_AÑO', answer: 'b', options: ['b', 'd', 'p', 'q'], hint: 'Donde te duchas' },
    ],
    label: 'Confusión b/d',
    timeLimit: 0,
  },
  6: {
    words: [
      { display: '_ATO', answer: 'p', options: ['p', 'q', 'b', 'd'], hint: 'Un ave' },
      { display: '_ESO', answer: 'p', options: ['p', 'q', 'b', 'd'], hint: 'Se mide en kilos' },
      { display: '_UE', answer: 'q', options: ['q', 'p', 'b', 'd'], hint: 'Pregunta: ¿_ué?' },
      { display: '_IÉN', answer: 'q', options: ['q', 'p', 'b', 'd'], hint: '¿_uién es?' },
      { display: '_ALO', answer: 'p', options: ['p', 'q', 'b', 'd'], hint: 'Un pedazo de madera' },
    ],
    label: 'Confusión p/q',
    timeLimit: 0,
  },
  7: {
    words: [
      { display: '_OCOLATE', answer: 'CH', options: ['CH', 'SH', 'LL', 'RR'], hint: 'Dulce y delicioso' },
      { display: '_AVE', answer: 'LL', options: ['LL', 'CH', 'RR', 'SH'], hint: 'Abre una puerta' },
      { display: '_ORAR', answer: 'LL', options: ['LL', 'CH', 'RR', 'SH'], hint: 'Cuando estás triste' },
      { display: '_OCHE', answer: 'CH', options: ['CH', 'LL', 'RR', 'SH'], hint: 'Cuando está oscuro' },
      { display: 'PE_O', answer: 'RR', options: ['RR', 'CH', 'LL', 'SH'], hint: 'Un animal fiel' },
    ],
    label: 'Dígrafos',
    timeLimit: 0,
  },
  8: {
    words: [
      { display: '_UTA', answer: 'FR', options: ['FR', 'FL', 'PR', 'CR'], hint: 'Manzana, pera...' },
      { display: '_OR', answer: 'FL', options: ['FL', 'FR', 'CL', 'PR'], hint: 'Rosa, margarita...' },
      { display: '_IMER', answer: 'PR', options: ['PR', 'FR', 'TR', 'CR'], hint: 'El número uno' },
      { display: '_UZ', answer: 'CR', options: ['CR', 'CL', 'FR', 'TR'], hint: 'Símbolo en forma de +' },
      { display: '_EN', answer: 'TR', options: ['TR', 'PR', 'FR', 'DR'], hint: 'Transporte sobre rieles' },
    ],
    label: 'Grupos consonánticos',
    timeLimit: 0,
  },
  9: {
    words: [
      { display: 'COMPU_ADORA', answer: 'T', options: ['T', 'D', 'S', 'N'], hint: 'Máquina para trabajar' },
      { display: 'ELEFAN_E', answer: 'T', options: ['T', 'D', 'S', 'N'], hint: 'Animal grande con trompa' },
      { display: 'CHOCO_ATE', answer: 'L', options: ['L', 'R', 'N', 'T'], hint: 'Dulce de cacao' },
      { display: 'BIBLIO_ECA', answer: 'T', options: ['T', 'D', 'S', 'N'], hint: 'Lugar con muchos libros' },
      { display: 'DINO_AURIO', answer: 'S', options: ['S', 'T', 'C', 'N'], hint: 'Animal prehistórico' },
    ],
    label: 'Palabras complejas',
    timeLimit: 0,
  },
  10: {
    words: [
      { display: '_UEGO', answer: 'F', options: ['F', 'J', 'G', 'H'], hint: 'Caliente y con llamas' },
      { display: 'MA_IPOSA', answer: 'R', options: ['R', 'L', 'N', 'S'], hint: 'Insecto con alas de colores' },
      { display: '_IERRA', answer: 'T', options: ['T', 'D', 'S', 'P'], hint: 'Nuestro planeta' },
      { display: '_RACIAS', answer: 'G', options: ['G', 'C', 'J', 'K'], hint: 'Palabra de cortesía' },
      { display: 'ESTRE_LA', answer: 'LL', options: ['LL', 'CH', 'RR', 'L'], hint: 'Brilla en el cielo nocturno' },
    ],
    label: 'Desafío mixto',
    timeLimit: 0,
  },
};

// CSS Keyframes injection
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes grafemaFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-12px) rotate(2deg); }
    50% { transform: translateY(-6px) rotate(-1deg); }
    75% { transform: translateY(-14px) rotate(1deg); }
  }
  @keyframes grafemaPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.4), 0 8px 32px rgba(0,0,0,0.3); }
    50% { box-shadow: 0 0 35px rgba(99,102,241,0.7), 0 8px 32px rgba(0,0,0,0.3); }
  }
  @keyframes grafemaShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
  @keyframes grafemaCorrect {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes grafemaConfetti {
    0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
    100% { opacity: 0; transform: translateY(-120px) rotate(360deg) scale(0.3); }
  }
  @keyframes grafemaStar {
    0% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
    100% { opacity: 0; transform: scale(0) rotate(360deg); }
  }
  @keyframes grafemaBlankPulse {
    0%, 100% { border-color: rgba(251,191,36,0.6); background: rgba(251,191,36,0.08); }
    50% { border-color: rgba(251,191,36,1); background: rgba(251,191,36,0.2); }
  }
  @keyframes grafemaSlideIn {
    0% { opacity: 0; transform: translateY(30px) scale(0.8); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes grafemaHudPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes grafemaBgStars {
    0% { opacity: 0.3; }
    50% { opacity: 0.8; }
    100% { opacity: 0.3; }
  }
  @keyframes grafemaOrbitSlow {
    0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
  }
  @keyframes grafemaGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
  }
  .grafema-option-btn {
    transition: all 0.25s ease !important;
  }
  .grafema-option-btn:hover {
    transform: scale(1.1) translateY(-5px) !important;
    border-color: rgba(167, 139, 250, 0.9) !important;
    box-shadow: 0 12px 28px rgba(99, 102, 241, 0.7), 0 0 20px rgba(167, 139, 250, 0.5) !important;
    filter: brightness(1.2);
  }
`;
if (!document.querySelector('#grafema-hunter-styles')) {
  styleSheet.id = 'grafema-hunter-styles';
  document.head.appendChild(styleSheet);
}

export default function GrafemaHunter({ player, onFinish }) {
  const [levels, setLevels] = useState(DEFAULT_LEVELS);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalClicks, setTotalClicks] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', answer }
  const [confetti, setConfetti] = useState([]);
  const [currentWordData, setCurrentWordData] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongInLevel, setWrongInLevel] = useState(0);

  // Stars decoratives refs
  const starsRef = useRef(
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 1.5,
    }))
  );

  // Load custom config + start session
  useEffect(() => {
    const init = async () => {
      try {
        const res = await API.get(`/games/config/${player.id}/grafema_hunter`);
        const customData = res.data;
        if (customData && typeof customData === 'object' && Object.keys(customData).length > 0) {
          const merged = { ...DEFAULT_LEVELS };
          Object.entries(customData).forEach(([lvl, cfg]) => {
            const levelNum = parseInt(lvl);
            const defaultLevel = DEFAULT_LEVELS[levelNum] || {};
            merged[levelNum] = {
              words: cfg.words || defaultLevel.words || [],
              label: cfg.label || defaultLevel.label || `Nivel ${levelNum}`,
              timeLimit: cfg.timeLimit !== undefined ? cfg.timeLimit : (defaultLevel.timeLimit || 0),
            };
          });
          console.log('[GrafemaHunter] Config personalizada cargada:', Object.keys(customData).length, 'niveles personalizados');
          setLevels(merged);
        } else {
          console.log('[GrafemaHunter] Sin config personalizada, usando defaults');
        }
      } catch (e) {
        console.log('[GrafemaHunter] Error cargando config, usando defaults:', e.message);
      }
      startSession();
    };
    init();
  }, [player.id]);

  // Load word when level/wordIndex/levels change
  useEffect(() => {
    if (!gameOver) loadWord();
  }, [level, wordIndex, levels]);

  const startSession = async () => {
    setSessionStartTime(Date.now());
    try {
      const res = await API.post('/games/session/start', {
        player_id: player.id,
        game_type: 'grafema',
        game_number: 2,
        level: 1,
      });
      setSessionId(res.data.id);
    } catch (e) {
      console.error('Error iniciando sesión de juego');
    }
  };

  const loadWord = () => {
    const levelData = levels[level];
    if (!levelData) return;
    if (wordIndex >= levelData.words.length) {
      setLevelComplete(true);
      return;
    }
    const rawWord = levelData.words[wordIndex];
    if (!rawWord) return;

    // Support both array format and object format
    let wordData;
    if (typeof rawWord === 'object' && !Array.isArray(rawWord)) {
      wordData = rawWord;
    } else {
      wordData = { display: '', answer: '', options: [], hint: '' };
    }

    setCurrentWordData(wordData);
    setSelectedOption(null);
    setFeedback(null);
    setStartTime(Date.now());
    setTotalClicks(0);

    // Shuffle options
    const opts = [...(wordData.options || [])].sort(() => Math.random() - 0.5);
    setShuffledOptions(opts);
    setTransitioning(false);
  };

  const playCorrectSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  };

  const playWrongSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const spawnConfetti = () => {
    const emojis = ['🎉', '✨', '⭐', '🌟', '💫', '🎊', '🔥', '💎'];
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 20,
      delay: Math.random() * 0.3,
    }));
    setConfetti(items);
    setTimeout(() => setConfetti([]), 1500);
  };

  const handleOptionClick = async (option, idx) => {
    if (feedback || transitioning || !currentWordData) return;

    setTotalClicks((c) => c + 1);
    setSelectedOption(idx);

    const isCorrect = option === currentWordData.answer;
    const reactionTime = Date.now() - startTime;

    const attempt = {
      word_shown: currentWordData.display,
      answer_given: option,
      is_correct: isCorrect,
      reaction_time_ms: reactionTime,
      num_clicks: totalClicks + 1,
      attempt_number: 1,
    };

    setAttempts((prev) => [...prev, attempt]);

    if (sessionId) {
      try {
        await API.post('/games/attempt', { session_id: sessionId, ...attempt });
      } catch (e) {
        console.error(e);
      }
    }

    if (isCorrect) {
      setFeedback({ type: 'correct', answer: option });
      setScore((s) => s + 10 * level);
      setCorrectCount((c) => c + 1);
      playCorrectSound();
      spawnConfetti();
    } else {
      setFeedback({ type: 'wrong', answer: currentWordData.answer });
      setWrongInLevel((w) => w + 1);
      playWrongSound();
      setLives((l) => {
        if (l - 1 <= 0) {
          setTimeout(() => setGameOver(true), 1200);
          return 0;
        }
        return l - 1;
      });
    }

    setTransitioning(true);
    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setTotalClicks(0);
      setTransitioning(false);
      setWordIndex((i) => i + 1);
    }, 1800);
  };

  const handleNextLevel = () => {
    if (level >= 10) {
      finishGame();
      return;
    }
    setLevel((l) => l + 1);
    setWordIndex(0);
    setLevelComplete(false);
    setSelectedOption(null);
    setFeedback(null);
    setWrongInLevel(0);
  };

  const finishGame = async () => {
    if (sessionId) {
      try {
        await API.put(`/games/session/${sessionId}/complete`, {
          total_time_seconds: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0,
          final_score: score,
        });
      } catch (e) {
        console.error(e);
      }
    }
    onFinish({ score, level, attempts, sessionId });
  };

  const getStars = () => {
    const totalWords = Object.values(levels).reduce((sum, l) => sum + (l.words?.length || 0), 0);
    const pct = totalWords > 0 ? (correctCount / totalWords) * 100 : 0;
    if (pct >= 80) return 3;
    if (pct >= 50) return 2;
    return 1;
  };

  // Build the displayed word with the blank highlighted
  const renderWord = () => {
    if (!currentWordData) return null;
    const display = currentWordData.display;
    const parts = display.split('_');

    return (
      <div style={styles.wordContainer}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part && <span style={styles.wordLetter}>{part}</span>}
            {i < parts.length - 1 && (
              <span
                style={{
                  ...styles.wordBlank,
                  ...(feedback && feedback.type === 'correct'
                    ? styles.wordBlankCorrect
                    : feedback && feedback.type === 'wrong'
                    ? styles.wordBlankWrong
                    : {}),
                }}
                className="grafemaBlankPulse"
              >
                {feedback
                  ? feedback.type === 'correct'
                    ? currentWordData.answer
                    : feedback.answer
                  : '?'}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ---- Game Over Screen ----
  if (gameOver) {
    const stars = getStars();
    return (
      <div style={styles.overlay}>
        <div style={styles.endCard}>
          <div style={{ fontSize: '64px' }}>😔</div>
          <h2 style={{ color: '#dc2626', margin: '8px 0', fontSize: '28px' }}>
            ¡Se acabaron las vidas!
          </h2>
          <div style={{ fontSize: '32px', margin: '8px 0' }}>
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <p style={styles.scoreText}>
            Puntaje final: <strong>{score}</strong>
          </p>
          <p style={styles.scoreText}>
            Llegaste al nivel: <strong>{level}</strong>
          </p>
          <p style={styles.scoreText}>
            Grafemas encontrados: <strong>{correctCount}</strong>
          </p>
          <button onClick={finishGame} style={styles.btnEnd}>
            🔍 Ver Resultados
          </button>
        </div>
      </div>
    );
  }

  // ---- Level Complete Screen ----
  if (levelComplete) {
    const stars = getStars();
    return (
      <div style={styles.overlay}>
        <div style={styles.endCard}>
          <div style={{ fontSize: '64px' }}>🎉</div>
          <h2 style={{ color: '#059669', margin: '8px 0', fontSize: '28px' }}>
            ¡Nivel {level} completado!
          </h2>
          <div style={{ fontSize: '32px', margin: '8px 0' }}>
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <p style={styles.scoreText}>
            Puntaje: <strong>{score}</strong>
          </p>
          <p style={styles.scoreText}>
            Grafemas encontrados: <strong>{correctCount}</strong>
          </p>
          {level < 10 ? (
            <button onClick={handleNextLevel} style={styles.btnEnd}>
              🔍 Nivel {level + 1} →
            </button>
          ) : (
            <button onClick={finishGame} style={styles.btnEnd}>
              🏆 ¡Juego Completado!
            </button>
          )}
        </div>
      </div>
    );
  }

  const levelData = levels[level];

  // Floating option positions (scattered layout)
  const getOptionPosition = (idx, total) => {
    const positions = [
      { top: '8%', left: '15%' },
      { top: '5%', right: '15%' },
      { bottom: '18%', left: '12%' },
      { bottom: '15%', right: '12%' },
      { top: '40%', left: '5%' },
      { top: '35%', right: '5%' },
    ];
    return positions[idx % positions.length] || {};
  };

  return (
    <div style={styles.gameWrapper}>
      {/* Background stars */}
      {starsRef.current.map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.5,
            animation: `grafemaBgStars ${star.duration}s ease-in-out ${star.delay}s infinite`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Decorative orbiting emojis */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 0,
          height: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            fontSize: '24px',
            animation: 'grafemaOrbitSlow 20s linear infinite',
            opacity: 0.15,
          }}
        >
          🔍
        </div>
        <div
          style={{
            position: 'absolute',
            fontSize: '20px',
            animation: 'grafemaOrbitSlow 25s linear infinite reverse',
            opacity: 0.1,
          }}
        >
          🔭
        </div>
      </div>

      {/* Confetti particles */}
      {confetti.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}%`,
            fontSize: '28px',
            animation: `grafemaConfetti 1.2s ease-out ${c.delay}s forwards`,
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {c.emoji}
        </div>
      ))}

      {/* HUD */}
      <div style={styles.hud}>
        <div style={styles.hudItem}>
          <span style={styles.hudLabel}>Nivel</span>
          <span style={styles.hudValue}>{level}/10</span>
        </div>
        <div style={styles.hudItem}>
          <span style={styles.hudLabel}>Puntaje</span>
          <span style={styles.hudValue}>{score}</span>
        </div>
        <div style={styles.hudItem}>
          <span style={styles.hudLabel}>Vidas</span>
          <span style={styles.hudValue}>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
        </div>
        <div style={styles.hudItem}>
          <span style={styles.hudLabel}>Tipo</span>
          <span style={styles.hudValueSmall}>{levelData?.label}</span>
        </div>
        <button onClick={finishGame} style={styles.btnExit}>
          🚪 Salir
        </button>
      </div>

      {/* Game Area */}
      <div style={styles.gameArea}>
        {/* Instruction */}
        <p style={styles.instruction}>
          🔍 ¡Encuentra el grafema perdido para completar la palabra!
        </p>

        {/* Hint */}
        {currentWordData?.hint && (
          <div style={styles.hintBubble}>💡 Pista: {currentWordData.hint}</div>
        )}

        {/* Image hint */}
        {currentWordData?.image && (
          <img
            src={currentWordData.image}
            alt="Pista"
            style={styles.wordImage}
          />
        )}

        {/* Word display */}
        {renderWord()}

        {/* Feedback message */}
        {feedback && (
          <div
            style={{
              ...styles.feedbackBar,
              background: feedback.type === 'correct'
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #dc2626, #ef4444)',
              animation: feedback.type === 'correct'
                ? 'grafemaCorrect 0.5s ease'
                : 'grafemaShake 0.5s ease',
            }}
          >
            {feedback.type === 'correct'
              ? '¡Correcto! 🎉 ¡Encontraste el grafema!'
              : `Incorrecto 😔 Era: ${feedback.answer}`}
          </div>
        )}

        {/* Options - floating cards */}
        <div style={styles.optionsGrid}>
          {shuffledOptions.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = feedback && option === currentWordData?.answer;
            const isWrongSelected =
              feedback && feedback.type === 'wrong' && isSelected;

            let cardStyle = { ...styles.optionCard };
            // Stagger animation delay
            cardStyle.animationDelay = `${idx * 0.1}s`;

            if (isCorrectOption && feedback) {
              cardStyle = {
                ...cardStyle,
                background: 'linear-gradient(135deg, #059669, #10b981)',
                borderColor: '#34d399',
                transform: 'scale(1.15)',
                boxShadow: '0 0 30px rgba(16,185,129,0.6), 0 8px 32px rgba(0,0,0,0.3)',
                animation: 'grafemaCorrect 0.5s ease',
              };
            } else if (isWrongSelected) {
              cardStyle = {
                ...cardStyle,
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                borderColor: '#f87171',
                animation: 'grafemaShake 0.5s ease',
                boxShadow: '0 0 30px rgba(220,38,38,0.6), 0 8px 32px rgba(0,0,0,0.3)',
              };
            } else if (feedback) {
              cardStyle = {
                ...cardStyle,
                opacity: 0.35,
                transform: 'scale(0.9)',
              };
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option, idx)}
                disabled={!!feedback || transitioning}
                className="grafema-option-btn"
                style={cardStyle}
              >
                <span style={styles.optionText}>{option}</span>
                <span style={styles.optionGlow} />
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div style={styles.progressBar}>
          <div style={styles.progressText}>
            🔎 Palabra {Math.min(wordIndex + 1, levelData?.words?.length || 1)} de{' '}
            {levelData?.words?.length || 1}
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${((wordIndex) / (levelData?.words?.length || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Styles ----
const styles = {
  gameWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  },

  // HUD
  hud: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    zIndex: 20,
    flexShrink: 0,
  },
  hudItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  hudLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontWeight: '700',
  },
  hudValue: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  hudValueSmall: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#a78bfa',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },

  // Game area
  gameArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 24px',
    gap: '18px',
    zIndex: 10,
    position: 'relative',
  },

  instruction: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    margin: 0,
    fontWeight: '600',
    letterSpacing: '0.3px',
  },

  hintBubble: {
    background: 'rgba(167,139,250,0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(167,139,250,0.3)',
    borderRadius: '14px',
    padding: '10px 20px',
    color: '#c4b5fd',
    fontSize: '14px',
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    animation: 'grafemaSlideIn 0.4s ease-out',
  },

  wordImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '16px',
    border: '2px solid rgba(167,139,250,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },

  // Word display
  wordContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    margin: '8px 0',
    animation: 'grafemaSlideIn 0.5s ease-out',
  },
  wordLetter: {
    fontSize: '52px',
    fontWeight: '900',
    color: '#e2e8f0',
    textShadow: '0 0 20px rgba(167,139,250,0.3), 0 4px 8px rgba(0,0,0,0.5)',
    letterSpacing: '4px',
    fontFamily: "'Segoe UI', monospace",
  },
  wordBlank: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    height: '68px',
    border: '3px dashed rgba(251,191,36,0.6)',
    borderRadius: '14px',
    fontSize: '44px',
    fontWeight: '900',
    color: '#fbbf24',
    background: 'rgba(251,191,36,0.08)',
    margin: '0 4px',
    animation: 'grafemaBlankPulse 1.5s ease-in-out infinite',
    textShadow: '0 0 10px rgba(251,191,36,0.5)',
    transition: 'all 0.3s ease',
    padding: '0 8px',
  },
  wordBlankCorrect: {
    borderColor: '#34d399',
    color: '#34d399',
    background: 'rgba(52,211,153,0.15)',
    animation: 'grafemaCorrect 0.5s ease',
    boxShadow: '0 0 30px rgba(52,211,153,0.4)',
  },
  wordBlankWrong: {
    borderColor: '#f87171',
    color: '#f87171',
    background: 'rgba(248,113,113,0.15)',
    animation: 'grafemaShake 0.5s ease',
    boxShadow: '0 0 30px rgba(248,113,113,0.4)',
  },

  // Options grid
  optionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px',
    maxWidth: '550px',
    margin: '10px 0',
    animation: 'grafemaSlideIn 0.6s ease-out',
  },
  optionCard: {
    position: 'relative',
    width: '110px',
    height: '110px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #312e81, #4c1d95)',
    border: '2px solid rgba(167,139,250,0.4)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    animation: 'grafemaFloat 3s ease-in-out infinite, grafemaPulse 2s ease-in-out infinite',
    boxShadow: '0 0 20px rgba(99,102,241,0.4), 0 8px 32px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    outline: 'none',
  },
  optionText: {
    fontSize: '34px',
    fontWeight: '900',
    color: '#fff',
    textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(167,139,250,0.5)',
    zIndex: 2,
    letterSpacing: '2px',
    fontFamily: "'Segoe UI', monospace",
  },
  optionGlow: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: 1,
  },

  // Feedback
  feedbackBar: {
    padding: '12px 28px',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    zIndex: 30,
  },

  // Progress
  progressBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    maxWidth: '300px',
  },
  progressText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },

  // Overlay screens
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
  },
  endCard: {
    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    borderRadius: '28px',
    padding: '40px 48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '420px',
    boxShadow: '0 25px 60px rgba(99,102,241,0.3), 0 0 0 1px rgba(167,139,250,0.2)',
    border: '1px solid rgba(167,139,250,0.2)',
    animation: 'grafemaSlideIn 0.5s ease-out',
  },
  scoreText: {
    fontSize: '17px',
    color: '#c4b5fd',
    fontWeight: '500',
    margin: '4px 0',
  },
  btnEnd: {
    height: '52px',
    padding: '0 40px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
    transition: 'all 0.2s ease',
    letterSpacing: '0.5px',
  },
  btnExit: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

export { DEFAULT_LEVELS as GRAFEMA_DEFAULT_LEVELS };
