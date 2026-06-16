import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Info, RefreshCw, Trophy, HelpCircle, Heart } from 'lucide-react';
import api from '../../services/api';

const LEVELS_ROUNDS = [
  // Level 1: Very Easy (3 words, 8x8 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['VER', 'OÍR', 'DAR'],
      intruders: ['SOL', 'PAN', 'FEO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['SOL', 'PAN', 'MAR'],
      intruders: ['VER', 'BUEN', 'GRAN'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['FEO', 'BUEN', 'GRAN'],
      intruders: ['OÍR', 'MAR', 'DAR'],
    }
  ],
  // Level 2: Easy (3 words, 8x8 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['CORRER', 'SALTAR', 'COMER'],
      intruders: ['CASA', 'LÁPIZ', 'ALTO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['CASA', 'MESA', 'LÁPIZ'],
      intruders: ['CORRER', 'COMER', 'FELIZ'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['ALTO', 'AZUL', 'FELIZ'],
      intruders: ['MESA', 'SALTAR', 'LÁPIZ'],
    }
  ],
  // Level 3: Medium (4 words, 10x10 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['ESCRIBIR', 'DIBUJAR', 'PENSAR', 'CANTAR'],
      intruders: ['TELÉFONO', 'CUADERNO', 'PEQUEÑO', 'RÁPIDO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['TELÉFONO', 'CUADERNO', 'MANZANA', 'JUGUETE'],
      intruders: ['ESCRIBIR', 'PENSAR', 'DIVERTIDO', 'CALIENTE'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['DIVERTIDO', 'PEQUEÑO', 'CALIENTE', 'RÁPIDO'],
      intruders: ['DIBUJAR', 'CANTAR', 'MANZANA', 'JUGUETE'],
    }
  ],
  // Level 4: Medium-Hard (4 words, 10x10 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['CAMINAR', 'DORMIR', 'HABLAR', 'COMPRAR'],
      intruders: ['ESTRELLA', 'VENTANA', 'BRILLANTE', 'HERMOSO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['ESTRELLA', 'BOTELLA', 'PLANETA', 'VENTANA'],
      intruders: ['CAMINAR', 'DORMIR', 'COMPLEJO', 'SILENCIOSO'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['BRILLANTE', 'COMPLEJO', 'SILENCIOSO', 'HERMOSO'],
      intruders: ['HABLAR', 'COMPRAR', 'BOTELLA', 'PLANETA'],
    }
  ],
  // Level 5: Hard (5 words, 12x12 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['COMPRENDER', 'CONSTRUIR', 'EXPLICAR', 'ESCUCHAR', 'COMPARTIR'],
      intruders: ['ESCRITORIO', 'COMPUTADORA', 'SABROSO', 'PELIGROSO', 'RESPETUOSO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['ESCRITORIO', 'COMPUTADORA', 'BIBLIOTECA', 'DICCIONARIO', 'ESTUDIANTE'],
      intruders: ['COMPRENDER', 'EXPLICAR', 'INTELIGENTE', 'MARAVILLOSO', 'ESCUCHAR'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['INTELIGENTE', 'SABROSO', 'PELIGROSO', 'MARAVILLOSO', 'RESPETUOSO'],
      intruders: ['CONSTRUIR', 'COMPARTIR', 'BIBLIOTECA', 'DICCIONARIO', 'ESTUDIANTE'],
    }
  ],
  // Level 6: Very Hard (5 words, 12x12 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['RESOLVER', 'INVESTIGAR', 'DESARROLLAR', 'IMAGINAR', 'ORGANIZAR'],
      intruders: ['UNIVERSIDAD', 'ARQUITECTURA', 'CONFIABLE', 'RESPONSABLE', 'PACIENTE'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['UNIVERSIDAD', 'ARQUITECTURA', 'CONOCIMIENTO', 'ELECTRICIDAD', 'HERRAMIENTA'],
      intruders: ['RESOLVER', 'IMAGINAR', 'EXTRAORDINARIO', 'SABIO', 'ORGANIZAR'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['EXTRAORDINARIO', 'SABIO', 'CONFIABLE', 'RESPONSABLE', 'PACIENTE'],
      intruders: ['INVESTIGAR', 'DESARROLLAR', 'CONOCIMIENTO', 'ELECTRICIDAD', 'HERRAMIENTA'],
    }
  ],
  // Level 7: Advanced (6 words, 14x14 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['ADQUIRIR', 'ANALIZAR', 'DETECTAR', 'PRODUCIR', 'SUPERAR', 'OBSERVAR'],
      intruders: ['EDIFICIO', 'CONCIERTO', 'ELEGANTE', 'SILENCIOSO', 'MODERNIDAD', 'PERFECTO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['EDIFICIO', 'CONCIERTO', 'UNIVERSO', 'ATMÓSFERA', 'ESTRUCTURA', 'TECNOLOGÍA'],
      intruders: ['ADQUIRIR', 'ANALIZAR', 'ELEGANTE', 'SILENCIOSO', 'DESCUBRIR', 'RÁPIDO'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['ELEGANTE', 'SILENCIOSO', 'PERFECTO', 'BRILLANTE', 'DINÁMICO', 'EFICIENTE'],
      intruders: ['ADQUIRIR', 'DETECTAR', 'EDIFICIO', 'CONCIERTO', 'UNIVERSO', 'PRODUCIR'],
    }
  ],
  // Level 8: Expert (6 words, 14x14 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['MODIFICAR', 'EXTREMAR', 'COMPONER', 'CALCULAR', 'CONECTAR', 'ELIMINAR'],
      intruders: ['PACIENCIA', 'PROGRESO', 'INMENSO', 'EXTRAÑO', 'DINOSAURIO', 'VELOZ'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['PACIENCIA', 'PROGRESO', 'DINOSAURIO', 'LABORATORIO', 'EXPERIMENTO', 'VEHÍCULO'],
      intruders: ['MODIFICAR', 'EXTREMAR', 'COMPONER', 'INMENSO', 'EXTRAÑO', 'ELIMINAR'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['INMENSO', 'EXTRAÑO', 'VELOZ', 'CURIOSO', 'PODEROSO', 'INGENIOSO'],
      intruders: ['MODIFICAR', 'CALCULAR', 'PACIENCIA', 'PROGRESO', 'LABORATORIO', 'VEHÍCULO'],
    }
  ],
  // Level 9: Master (7 words, 14x14 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['SIMPLIFICAR', 'MULTIPLICAR', 'CLASIFICAR', 'FORTALECER', 'COORDINAR', 'REORGANIZAR', 'SELECCIONAR'],
      intruders: ['COMPUTACIÓN', 'METODOLOGÍA', 'SIGNIFICATIVO', 'ESPECTACULAR', 'ILUMINACIÓN', 'DETERMINACIÓN', 'FABULOSO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['COMPUTACIÓN', 'METODOLOGÍA', 'ILUMINACIÓN', 'DETERMINACIÓN', 'INVESTIGACIÓN', 'CONOCIMIENTO', 'PENSAMIENTO'],
      intruders: ['SIMPLIFICAR', 'MULTIPLICAR', 'SIGNIFICATIVO', 'ESPECTACULAR', 'FABULOSO', 'SELECCIONAR', 'COORDINAR'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['SIGNIFICATIVO', 'ESPECTACULAR', 'FABULOSO', 'SORPRENDENTE', 'MARAVILLOSO', 'DIFICULTOSO', 'INTERESANTE'],
      intruders: ['SIMPLIFICAR', 'CLASIFICAR', 'COMPUTACIÓN', 'METODOLOGÍA', 'ILUMINACIÓN', 'DETERMINACIÓN', 'REORGANIZAR'],
    }
  ],
  // Level 10: Grandmaster (7 words, 14x14 grid)
  [
    {
      category: 'VERBOS',
      instruction: 'Encuentra solo las ACCIONES (verbos)',
      words: ['PERFECCIONAR', 'IMPLEMENTAR', 'TRANSFORMAR', 'INFLUENCIAR', 'CARACTERIZAR', 'ESTRUCTURAR', 'EXPERIMENTAR'],
      intruders: ['CIVILIZACIÓN', 'CARACTERÍSTICA', 'INDISPENSABLE', 'REVOLUCIONARIO', 'REPRESENTANTE', 'DOCUMENTACIÓN', 'EXTRAORDINARIO'],
    },
    {
      category: 'SUSTANTIVOS',
      instruction: 'Encuentra solo los OBJETOS (sustantivos)',
      words: ['CIVILIZACIÓN', 'CARACTERÍSTICA', 'REPRESENTANTE', 'DOCUMENTACIÓN', 'CONTRADICCIÓN', 'ESPECIFICACIÓN', 'PLANIFICACIÓN'],
      intruders: ['PERFECCIONAR', 'IMPLEMENTAR', 'INDISPENSABLE', 'REVOLUCIONARIO', 'EXTRAORDINARIO', 'TRANSFORMAR', 'ESTRUCTURAR'],
    },
    {
      category: 'ADJETIVOS',
      instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
      words: ['INDISPENSABLE', 'REVOLUCIONARIO', 'EXTRAORDINARIO', 'COMPRENSIBLE', 'SATISFACTORIO', 'ESPECÍFICO', 'SIGNIFICATIVO'],
      intruders: ['PERFECCIONAR', 'IMPLEMENTAR', 'CIVILIZACIÓN', 'CARACTERÍSTICA', 'REPRESENTANTE', 'DOCUMENTACIÓN', 'PLANIFICACIÓN'],
    }
  ]
];

const buildGrid = (words, intruders, gridSize) => {
  let attemptsOuter = 0;
  while (attemptsOuter < 10) {
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const placedWords = [];
    const allToPlace = [...words.map(w => ({ word: w, isTarget: true })), ...intruders.map(w => ({ word: w, isTarget: false }))];
    let allTargetsPlaced = true;

    for (const item of allToPlace) {
      let placed = false;
      for (let attempt = 0; attempt < 150 && !placed; attempt++) {
        const horizontal = Math.random() < 0.5;
        const len = item.word.length;
        if (len > gridSize) continue;
        const maxR = horizontal ? gridSize : gridSize - len;
        const maxC = horizontal ? gridSize - len : gridSize;
        const r = Math.floor(Math.random() * maxR);
        const c = Math.floor(Math.random() * maxC);
        
        let canPlace = true;
        for (let i = 0; i < len; i++) {
          const rr = horizontal ? r : r + i;
          const cc = horizontal ? c + i : c;
          if (grid[rr][cc] !== null) { canPlace = false; break; }
        }
        if (canPlace) {
          const positions = [];
          for (let i = 0; i < len; i++) {
            const rr = horizontal ? r : r + i;
            const cc = horizontal ? c + i : c;
            grid[rr][cc] = item.word[i];
            positions.push([rr, cc]);
          }
          placedWords.push({ word: item.word, isTarget: item.isTarget, positions, direction: horizontal ? 'H' : 'V' });
          placed = true;
        }
      }
      if (item.isTarget && !placed) {
        allTargetsPlaced = false;
        break; // retry the whole grid placement
      }
    }

    if (allTargetsPlaced) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (grid[r][c] === null) {
            grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
          }
        }
      }
      return { grid, placedWords };
    }
    attemptsOuter++;
  }
  
  // Fallback
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('A'));
  return { grid, placedWords: [] };
};

const WarehouseScene = () => {
  return (
    <group>
      {/* Space hanger floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[30, 0.1, 20]} />
        <meshLambertMaterial color="#0b0f19" />
      </mesh>
      {/* Hanger back wall */}
      <mesh position={[0, 4, -8]}>
        <boxGeometry args={[30, 8, 0.4]} />
        <meshLambertMaterial color="#1e1b4b" />
      </mesh>
      {/* Cybernetic shelves */}
      {[-10, -5, 5, 10].map(x => (
        <group key={x}>
          <mesh position={[x, 1.5, -7.5]}>
            <boxGeometry args={[2.5, 3, 0.5]} />
            <meshLambertMaterial color="#312e81" />
          </mesh>
          <mesh position={[x, 0.8, -7.5]}>
            <boxGeometry args={[2.3, 0.1, 0.7]} />
            <meshLambertMaterial color="#4f46e5" />
          </mesh>
          <mesh position={[x, 1.8, -7.5]}>
            <boxGeometry args={[2.3, 0.1, 0.7]} />
            <meshLambertMaterial color="#4f46e5" />
          </mesh>
          {/* Cyber Cargo Cubes */}
          {[-0.8, -0.3, 0.2, 0.7].map((bx, i) => (
            <mesh key={i} position={[x + bx, 1.15, -7.4]}>
              <boxGeometry args={[0.3, 0.4, 0.3]} />
              <meshLambertMaterial color={['#f43f5e', '#a855f7', '#3b82f6', '#06b6d4'][i]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const Game6Warehouse = ({ player, onFinish }) => {

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
  const [currentLevel, setCurrentLevel] = useState(1);
  const [roundIndex, setRoundIndex] = useState(0);
  const [foundWords, setFoundWords] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [correctCells, setCorrectCells] = useState([]);
  const [incorrectCells, setIncorrectCells] = useState([]);
  const [lives, setLives] = useState(3);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const round = useMemo(() => LEVELS_ROUNDS[currentLevel - 1][roundIndex], [currentLevel, roundIndex]);
  
  const gridSize = useMemo(() => {
    if (currentLevel <= 2) return 8;
    if (currentLevel <= 4) return 10;
    if (currentLevel <= 6) return 12;
    return 14;
  }, [currentLevel]);

  const [gridData, setGridData] = useState(() => buildGrid(LEVELS_ROUNDS[0][0].words, LEVELS_ROUNDS[0][0].intruders, 8));

  useEffect(() => {
    setGridData(buildGrid(round.words, round.intruders, gridSize));
    setFoundWords(new Set());
  }, [currentLevel, roundIndex, round, gridSize]);

  // Inject CSS styles for micro-animations
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'game6-animations-styles';
    style.textContent = `
      @keyframes game6Wiggle {
        0%, 100% { transform: translate(0, 0) scale(1.1); }
        25% { transform: translate(-1px, -1px) rotate(-1deg) scale(1.1); }
        75% { transform: translate(1px, 1px) rotate(1deg) scale(1.1); }
      }
      @keyframes game6PopGreen {
        0% { transform: scale(1); background-color: rgb(16, 185, 129); }
        50% { transform: scale(1.25); background-color: rgb(16, 185, 129); box-shadow: 0 0 20px rgb(16, 185, 129); }
        100% { transform: scale(1); background-color: rgb(16, 185, 129); }
      }
      @keyframes game6PopRed {
        0% { transform: scale(1); background-color: rgb(239, 68, 68); }
        50% { transform: scale(1.25); background-color: rgb(239, 68, 68); box-shadow: 0 0 20px rgb(239, 68, 68); }
        100% { transform: scale(1); background-color: rgb(239, 68, 68); }
      }
      .animate-wiggle-purple {
        animation: game6Wiggle 0.18s ease-in-out infinite;
        background-color: rgb(147, 51, 234) !important;
        border-color: rgb(192, 132, 252) !important;
        color: white !important;
        box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.5);
      }
      .animate-pop-green {
        animation: game6PopGreen 0.5s ease-out forwards;
        border-color: rgb(52, 211, 153) !important;
        color: white !important;
        box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.6);
      }
      .animate-pop-red {
        animation: game6PopRed 0.5s ease-out forwards;
        border-color: rgb(248, 113, 113) !important;
        color: white !important;
        box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.6);
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('game6-animations-styles');
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'warehouse',
          game_number: 8,
          level: 1,
        });
        setSessionId(res.data.id);
      } catch (e) {
        console.error('Error al iniciar sesión de juego:', e);
      }
    };
    startSession();
  }, [player]);

  const finishGame = async (correct, incorrect, total, finalScore, finalLevel = currentLevel) => {
    const elapsed = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
    if (sessionId) {
      try {
        await api.put(`/games/session/${sessionId}/complete`, {
          total_time_seconds: elapsed,
          final_score: finalScore,
          correct_attempts: correct,
          incorrect_attempts: incorrect,
          total_attempts: total
        });
      } catch (e) {
        console.error('Error al guardar progreso:', e);
      }
    }
    onFinish({ score: finalScore, level: finalLevel, sessionId });
  };

  const selectedCells = useMemo(() => {
    if (!startCell || !endCell) return [];
    const [r1, c1] = startCell;
    const [r2, c2] = endCell;
    const cells = [];
    if (r1 === r2) {
      const min = Math.min(c1, c2), max = Math.max(c1, c2);
      for (let c = min; c <= max; c++) cells.push([r1, c]);
    } else if (c1 === c2) {
      const min = Math.min(r1, r2), max = Math.max(r1, r2);
      for (let r = min; r <= max; r++) cells.push([r, c1]);
    }
    return cells;
  }, [startCell, endCell]);

  const handleCellMouseDown = (r, c) => {
    if (gameState !== 'playing') return;
    if (correctCells.length > 0 || incorrectCells.length > 0) return; // lock selection during validation pop
    setSelecting(true);
    setStartCell([r, c]);
    setEndCell([r, c]);
  };

  const handleCellMouseEnter = (r, c) => {
    if (!selecting) return;
    setEndCell([r, c]);
  };

  const handleMouseUp = () => {
    if (!selecting || !startCell || !endCell) {
      setSelecting(false);
      return;
    }
    setSelecting(false);
    
    // Build word
    const word = selectedCells.map(([r, c]) => gridData.grid[r][c]).join('');
    const reversed = word.split('').reverse().join('');
    
    const matchTarget = gridData.placedWords.find(pw =>
      pw.isTarget && !foundWords.has(pw.word) &&
      (pw.word === word || pw.word === reversed) &&
      selectedCells.length === pw.word.length &&
      selectedCells.every(([r, c]) => pw.positions.some(([pr, pc]) => pr === r && pc === c))
    );
    
    const matchIntruder = gridData.placedWords.find(pw =>
      !pw.isTarget && (pw.word === word || pw.word === reversed) &&
      selectedCells.length === pw.word.length
    );

    const currentCellsCopy = [...selectedCells];

    if (matchTarget) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      playCorrectSound();;
      playCorrectSound();
      const newFound = new Set([...foundWords, matchTarget.word]);
      setFoundWords(newFound);
      setFeedback(`¡CORRECTO! "${matchTarget.word}" es ${round.category.slice(0, -1)} 🟢`);
      
      setCorrectCells(currentCellsCopy);
      setTimeout(() => setCorrectCells([]), 500);
      setTimeout(() => setFeedback(''), 1500);
      
      if (newFound.size === round.words.length) {
        setTimeout(() => {
          if (roundIndex < 2) {
            setRoundIndex(prev => prev + 1);
          } else {
            // Completed level
            if (currentLevel < 10) {
              const nextLvl = currentLevel + 1;
              setFeedback(`¡Nivel ${currentLevel} Completado! Siguiente nivel ${nextLvl}... 🚀`);
              setTimeout(() => setFeedback(''), 2000);
              setCurrentLevel(nextLvl);
              setRoundIndex(0);
              // Reset lives up to level 5
              if (nextLvl <= 5) {
                setLives(3);
              }
            } else {
              setGameState('won');
              finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, newCorrectCount * 250, 10);
            }
          }
        }, 800);
      }
    } else if (matchIntruder) {
      const newIncorrectCount = incorrectCount + 1;
      setIncorrectCount(newIncorrectCount);
      setFeedback(`¡INTRUSO! "${matchIntruder.word}" NO es ${round.category.slice(0, -1)} 🔴`);
      
      setIncorrectCells(currentCellsCopy);
      setTimeout(() => setIncorrectCells([]), 500);
      setTimeout(() => setFeedback(''), 1800);

      setLives(prev => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setGameState('lost');
        }
        return nextLives;
      });
    } else {
      const newIncorrectCount = incorrectCount + 1;
      setIncorrectCount(newIncorrectCount);
      setFeedback('No es una palabra válida 🔴');
      
      setIncorrectCells(currentCellsCopy);
      setTimeout(() => setIncorrectCells([]), 500);
      setTimeout(() => setFeedback(''), 1200);

      setLives(prev => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setGameState('lost');
        }
        return nextLives;
      });
    }
    setStartCell(null);
    setEndCell(null);
  };

  const restart = () => {
    setCurrentLevel(1);
    setRoundIndex(0);
    setFoundWords(new Set());
    setGameState('playing');
    setFeedback('');
    setCorrectCount(0);
    setIncorrectCount(0);
    setLives(3);
  };

  const isInSelection = (r, c) => selectedCells.some(([sr, sc]) => sr === r && sc === c);
  const isFoundCell = (r, c) => gridData.placedWords.some(pw => 
    pw.isTarget && foundWords.has(pw.word) && pw.positions.some(([pr, pc]) => pr === r && pc === c)
  );

  const isInCorrectCells = (r, c) => correctCells.some(([cr, cc]) => cr === r && cc === c);
  const isInIncorrectCells = (r, c) => incorrectCells.some(([ir, ic]) => ir === r && ic === c);

  return (
    <div className="relative w-full" style={{ height: '100%', width: '100%', background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }} onMouseUp={handleMouseUp}>
      {/* 3D Canvas in background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={55} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
            <WarehouseScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Main UI Overlay (z-10, flex container) */}
      <div className="absolute inset-x-0 bottom-0 top-[10px] z-10 flex flex-row items-stretch justify-between p-6 gap-6 pointer-events-none">
        
        {/* Left Column: HUD & Objective */}
        <div className="flex flex-col gap-4 w-[280px] justify-between pointer-events-auto h-full overflow-y-auto pr-1">
          {/* HUD Panel */}
          <div className="p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl flex flex-col gap-3">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Almacén de Palabras</div>
            <div className="text-base font-extrabold text-purple-300">Nivel: {currentLevel} / 10</div>
            <div className="text-xs font-semibold text-indigo-300">Mini-nivel: {roundIndex + 1} / 3</div>
            <div className="text-xs text-emerald-400">Encontradas: {foundWords.size} / {round.words.length}</div>
            
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-400 font-extrabold">
              <span>Vidas:</span>
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <Heart key={i} className={`w-4 h-4 ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Objective Panel */}
          <div className="p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl text-center flex flex-col gap-2">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Categoría Objetivo</div>
            <div className="text-xl font-black text-yellow-400">{round.category}</div>
            <div className="text-[11px] text-indigo-200 flex items-center justify-center gap-1 mt-1.5 font-medium leading-relaxed">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {round.instruction}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-start gap-3 mt-auto">
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-3 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-400/40 hover:bg-slate-800 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2"
              title="¿Cómo jugar?"
            >
              <HelpCircle className="w-5 h-5 text-indigo-300" />
              <span className="text-xs font-bold text-indigo-200">¿Cómo jugar?</span>
            </button>
          </div>
        </div>

        {/* Center Column: Grid (centered soup) */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto h-full">
          <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-5 select-none shadow-2xl max-h-full overflow-y-auto">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {gridData.grid.map((row, r) => row.map((letter, c) => {
                const found = isFoundCell(r, c);
                const inSel = isInSelection(r, c);
                const correctAnim = isInCorrectCells(r, c);
                const incorrectAnim = isInIncorrectCells(r, c);

                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => handleCellMouseDown(r, c)}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    className={`flex items-center justify-center cursor-pointer select-none rounded-lg text-lg font-black transition-all border w-[26px] h-[26px] sm:w-[32px] sm:h-[32px] md:w-[36px] md:h-[36px] lg:w-[38px] lg:h-[38px] ${
                      correctAnim
                        ? 'animate-pop-green text-white z-20'
                        : incorrectAnim
                          ? 'animate-pop-red text-white z-20'
                          : found
                            ? 'bg-emerald-500/80 border-emerald-400/50 text-white shadow-lg shadow-emerald-500/20'
                            : inSel
                              ? 'animate-wiggle-purple text-white z-20'
                              : 'bg-slate-800/40 border-slate-700/30 text-indigo-100 hover:bg-blue-600 hover:border-blue-400 hover:scale-115 hover:shadow-lg hover:shadow-blue-500/20 hover:text-white duration-150'
                    }`}
                  >
                    {letter}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* Right Column: Word List */}
        <div className="flex flex-col gap-4 w-[220px] pointer-events-auto h-full">
          <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl flex flex-col items-center h-full overflow-y-auto scrollbar-none">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-3 text-center">Buscar en la Sopa</div>
            <div className="flex flex-col gap-2.5 w-full">
              {round.words.map(w => {
                const found = foundWords.has(w);
                return (
                  <span
                    key={w}
                    className={`px-3 py-2.5 rounded-lg border text-center font-black text-xs transition-all duration-300 ${
                      found
                        ? 'line-through text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-indigo-200 bg-indigo-500/10 border-indigo-500/25'
                    }`}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Exit button in absolute header top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <button
          onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer text-sm"
        >
          SALIR
        </button>
      </div>

      {/* Action feedback popup */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl z-20 text-white font-sans text-lg font-bold shadow-2xl text-center select-none animate-pulse">
          {feedback}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'lost' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1c0d24] to-[#0a0512] border-2 border-red-500/40 rounded-3xl max-w-md w-full p-8 text-center text-white shadow-2xl relative font-sans">
            <Trophy className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-black text-rose-400 mb-2">¡JUEGO TERMINADO!</h2>
            <p className="text-sm text-gray-300 mb-6">Te has quedado sin vidas. ¡Buen intento!</p>
            
            <div className="bg-slate-900/60 border border-red-500/25 rounded-2xl p-4 mb-6 space-y-2.5 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Nivel alcanzado:</span>
                <span className="font-bold text-white">{currentLevel} / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ronda:</span>
                <span className="font-bold text-white">{roundIndex + 1} / 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Palabras correctas:</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Palabras incorrectas:</span>
                <span className="font-bold text-rose-400">{incorrectCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={restart}
                className="py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase shadow-lg shadow-red-500/20"
              >
                Volver a Intentar
              </button>
              <button
                onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-gray-200 font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Won Screen */}
      {gameState === 'won' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#0e2417] to-[#040f09] border-2 border-emerald-500/40 rounded-3xl max-w-md w-full p-8 text-center text-white shadow-2xl relative font-sans">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-emerald-400 mb-2">¡VICTORIA TOTAL!</h2>
            <p className="text-sm text-gray-300 mb-6">¡Has completado con éxito los 10 niveles!</p>
            
            <div className="bg-slate-900/60 border border-emerald-500/25 rounded-2xl p-4 mb-6 space-y-2.5 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Nivel final:</span>
                <span className="font-bold text-white">10 / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Palabras correctas:</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Intentos incorrectos:</span>
                <span className="font-bold text-rose-400">{incorrectCount}</span>
              </div>
            </div>

            <button
              onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 250, 10)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase shadow-lg shadow-emerald-500/20"
            >
              Ver mis Resultados
            </button>
          </div>
        </div>
      )}

      {/* Help Modal Overlay */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#131238] to-[#080a1c] border-2 border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative font-sans">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Almacén de Palabras?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Busca y selecciona las palabras ocultas en la sopa de letras correspondientes a la categoría objetivo (acción, objeto, cualidad) que ves a la derecha.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Lee la <b>categoría objetivo</b> activa en el panel de la izquierda (ej. <i>VERBOS</i>).</li>
                  <li>Busca palabras de esa categoría en la sopa de letras (se leen en horizontal o vertical). Las palabras válidas están a la derecha.</li>
                  <li>Haz <b>clic y arrastra</b> sobre las letras para pintar la selección de la palabra encontrada.</li>
                  <li>Tienes <b>3 vidas</b>. Los fallos te restarán vidas. Se recuperan hasta el Nivel 5.</li>
                  <li>Supera los 10 niveles, completando las 3 rondas (subniveles) de cada nivel, para ganar la partida. ¡Aumenta el tamaño de la rejilla y cantidad de palabras al subir!</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales y Animaciones</h4>
                
                {/* Visual indicator of hover */}
                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5">
                  <div className="w-8 h-8 bg-blue-600 border border-blue-400 rounded flex items-center justify-center text-xs font-black text-white shadow scale-110">A</div>
                  <div className="text-xs">
                    <strong className="text-blue-400 text-xs">HOVER 🔵</strong>
                    <p className="text-[10px] text-gray-300">Al pasar el cursor, la celda se agranda y brilla de color azul.</p>
                  </div>
                </div>

                {/* Visual indicator of selection */}
                <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-xl p-2.5">
                  <div className="w-8 h-8 bg-purple-600 border border-purple-400 rounded flex items-center justify-center text-xs font-black text-white shadow animate-pulse">S</div>
                  <div className="text-xs">
                    <strong className="text-purple-400 text-xs">SELECCIONAR 🟣</strong>
                    <p className="text-[10px] text-gray-300">Al hacer clic y arrastrar, las celdas se agitan y se vuelven moradas.</p>
                  </div>
                </div>

                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-7 bg-emerald-500 border border-emerald-400 rounded flex items-center justify-center text-[10px] font-black text-white shadow">CORRECTO</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡CORRECTO! 🟢</strong>
                    <p className="text-[10px] text-gray-300">La palabra correcta parpadea en verde grande por medio segundo.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-7 bg-rose-500 border border-rose-400 rounded flex items-center justify-center text-[10px] font-black text-white shadow">INTRUSO</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡ERROR / INTRUSO! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si fallas, las letras seleccionadas se agrandan en color rojo.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer text-sm"
            >
              ¡Entendido, a Jugar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game6Warehouse;
