import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const GRID_SIZE = 5;
const ROOM_SIZE = 4.5;
const START_POS = { x: 0, y: 0 };
const EXIT_POS = { x: 4, y: 4 };

const PLATFORM_COLORS = [
  '#22c55e', '#15803d', '#16a34a', '#14532d', '#4ade80',
  '#15803d', '#22c55e', '#14532d', '#16a34a', '#86efac',
  '#16a34a', '#14532d', '#22c55e', '#86efac', '#22c55e',
  '#4ade80', '#16a34a', '#86efac', '#22c55e', '#15803d',
  '#14532d', '#86efac', '#15803d', '#4ade80', '#16a34a'
];

const QUESTIONS_BY_LEVEL = {
  1: [
    {
      type: 'omision',
      hint: 'El Duende se comió la primera letra de la palabra "CASA".',
      question: '¿Qué palabra quedó?',
      options: ['ASA', 'CASA'],
      answer: 'ASA'
    },
    {
      type: 'omision',
      hint: 'El Duende se comió la primera letra de la palabra "GATO".',
      question: '¿Qué palabra quedó?',
      options: ['ATO', 'BATO'],
      answer: 'ATO'
    },
    {
      type: 'rimas',
      hint: 'Busca una rima muy fácil.',
      question: '¿Cuál de estas palabras rima con SOL?',
      options: ['CARACOL', 'LUNA'],
      answer: 'CARACOL'
    },
    {
      type: 'rimas',
      hint: 'Busca una rima muy fácil.',
      question: '¿Cuál de estas palabras rima con CASA?',
      options: ['MASA', 'PERRO'],
      answer: 'MASA'
    },
    {
      type: 'intruso',
      hint: 'Tres juguetes empiezan con la letra "P", pero uno es un intruso.',
      question: '¿Cuál es el juguete intruso?',
      options: ['PATO', 'PERA', 'SOL'],
      answer: 'SOL'
    },
    {
      type: 'intruso',
      hint: 'Tres juguetes empiezan con la letra "M", pero uno es un intruso.',
      question: '¿Cuál es el juguete intruso?',
      options: ['MANO', 'MESA', 'GATO'],
      answer: 'GATO'
    }
  ],
  2: [
    {
      type: 'omision',
      hint: 'El Duende se comió la primera letra de la palabra "BOTA".',
      question: '¿Qué palabra quedó?',
      options: ['OTA', 'BOTA'],
      answer: 'OTA'
    },
    {
      type: 'omision',
      hint: 'El Duende se comió la primera letra de la palabra "LUNA".',
      question: '¿Qué palabra quedó?',
      options: ['UNA', 'CUNA'],
      answer: 'UNA'
    },
    {
      type: 'rimas',
      hint: 'Busca una rima sencilla.',
      question: '¿Cuál de estas palabras rima con PATO?',
      options: ['GATO', 'BOTA'],
      answer: 'GATO'
    },
    {
      type: 'rimas',
      hint: 'Busca una rima sencilla.',
      question: '¿Cuál de estas palabras rima con LUNA?',
      options: ['CUNA', 'PINO'],
      answer: 'CUNA'
    },
    {
      type: 'intruso',
      hint: 'Tres palabras empiezan con "L", pero una es un intruso.',
      question: '¿Cuál es la palabra intrusa?',
      options: ['LÁPIZ', 'LUNA', 'FLOR'],
      answer: 'FLOR'
    },
    {
      type: 'intruso',
      hint: 'Tres palabras empiezan con "S", pero una es un intruso.',
      question: '¿Cuál es la palabra intrusa?',
      options: ['SOL', 'SAPO', 'PIÑA'],
      answer: 'PIÑA'
    }
  ],
  3: [
    {
      type: 'omision',
      hint: 'El Duende se comió la primera sílaba de la palabra "ZAPATO".',
      question: '¿Qué palabra quedó?',
      options: ['PATO', 'ZAPA'],
      answer: 'PATO'
    },
    {
      type: 'omision',
      hint: 'El Duende se comió la primera letra de la palabra "PLÁTANO".',
      question: '¿Qué palabra quedó?',
      options: ['LÁTANO', 'PÁTANO'],
      answer: 'LÁTANO'
    },
    {
      type: 'rimas',
      hint: 'Busca la rima adecuada.',
      question: '¿Cuál de estas palabras rima con BOTÓN?',
      options: ['RATÓN', 'CASA'],
      answer: 'RATÓN'
    },
    {
      type: 'rimas',
      hint: 'Busca la rima adecuada.',
      question: '¿Cuál de estas palabras rima con ESTRELLA?',
      options: ['BOTELLA', 'BOCA'],
      answer: 'BOTELLA'
    },
    {
      type: 'intruso',
      hint: 'Tres animales empiezan con la letra "G", pero uno es un intruso.',
      question: '¿Cuál es el animal intruso?',
      options: ['GATO', 'GALLINA', 'PERRO'],
      answer: 'PERRO'
    },
    {
      type: 'intruso',
      hint: 'Tres palabras empiezan con la letra "B", pero una es un intruso.',
      question: '¿Cuál es el intruso?',
      options: ['BOCA', 'BOTA', 'DIENTE'],
      answer: 'DIENTE'
    }
  ],
  4: [
    {
      type: 'omision',
      hint: 'El Duende se comió la primera letra de la palabra "FLORES".',
      question: '¿Qué palabra quedó?',
      options: ['LORES', 'FORES'],
      answer: 'LORES'
    },
    {
      type: 'omision',
      hint: 'El Duende se comió la primera letra de la palabra "GLOBO".',
      question: '¿Qué palabra quedó?',
      options: ['LOBO', 'GOBO'],
      answer: 'LOBO'
    },
    {
      type: 'rimas',
      hint: 'Busca la rima.',
      question: '¿Cuál de estas palabras rima con CAMPANA?',
      options: ['MANZANA', 'BOTELLA'],
      answer: 'MANZANA'
    },
    {
      type: 'rimas',
      hint: 'Busca la rima.',
      question: '¿Cuál de estas palabras rima con CARRO?',
      options: ['JARRO', 'PERRO'],
      answer: 'JARRO'
    },
    {
      type: 'intruso',
      hint: 'Tres palabras empiezan con "T", pero una es un intruso.',
      question: '¿Cuál es el intruso?',
      options: ['TAZA', 'TREN', 'PELO'],
      answer: 'PELO'
    },
    {
      type: 'intruso',
      hint: 'Tres palabras empiezan con "D", pero una es un intruso.',
      question: '¿Cuál es el intruso?',
      options: ['DADO', 'DEDO', 'VASO'],
      answer: 'VASO'
    }
  ],
  5: [
    {
      type: 'omision',
      hint: 'El Duende se comió la primera sílaba de la palabra "MARIPOSA".',
      question: '¿Qué palabra quedó?',
      options: ['RIPOSA', 'MAPOSA'],
      answer: 'RIPOSA'
    },
    {
      type: 'omision',
      hint: 'El Duende se comió la primera sílaba de la palabra "CANGREJO".',
      question: '¿Qué palabra quedó?',
      options: ['GREJO', 'CANJO'],
      answer: 'GREJO'
    },
    {
      type: 'rimas',
      hint: 'Rima de nivel avanzado.',
      question: '¿Cuál de estas palabras rima con ESPEJO?',
      options: ['CONEJO', 'MESA'],
      answer: 'CONEJO'
    },
    {
      type: 'rimas',
      hint: 'Rima de nivel avanzado.',
      question: '¿Cuál de estas palabras rima con VENTANA?',
      options: ['RANA', 'BOTE'],
      answer: 'RANA'
    },
    {
      type: 'intruso',
      hint: 'Tres palabras empiezan con la letra "C", pero una es un intruso.',
      question: '¿Cuál es el intruso?',
      options: ['COCHE', 'CUNA', 'SAPO'],
      answer: 'SAPO'
    },
    {
      type: 'intruso',
      hint: 'Tres palabras empiezan con la letra "F", pero una es un intruso.',
      question: '¿Cuál es el intruso?',
      options: ['FLOR', 'FOCA', 'GATO'],
      answer: 'GATO'
    }
  ]
};

const RobotCharacter = () => {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 16]} />
        <meshLambertMaterial color="#9333ea" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshLambertMaterial color="#a855f7" />
      </mesh>
      {/* Big Eyes */}
      <mesh position={[-0.1, 0.7, 0.2]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.1, 0.7, 0.26]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 0.7, 0.2]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1, 0.7, 0.26]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Antennas */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshLambertMaterial color="#d8b4fe" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      {/* Wheels/Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.15, 16]} />
        <meshLambertMaterial color="#374151" />
      </mesh>
    </group>
  );
};

const BalloonExit = ({ active }) => {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Basket */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.7]} />
        <meshLambertMaterial color={active ? '#78350f' : '#475569'} />
      </mesh>
      {/* Strings */}
      {[[0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]].map((c, i) => (
        <mesh key={i} position={[c[0], 0.9, c[1]]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshBasicMaterial color={active ? '#cbd5e1' : '#64748b'} />
        </mesh>
      ))}
      {/* Balloon Envelope */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshLambertMaterial color={active ? '#ef4444' : '#334155'} />
      </mesh>
      {/* Envelope Stripes */}
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.91, 24, 24]} />
        <meshLambertMaterial color={active ? '#ffffff' : '#475569'} wireframe />
      </mesh>
      {/* Golden escape light */}
      {active && <pointLight position={[0, 1.9, 0]} color="#facc15" intensity={1.5} distance={5} />}
    </group>
  );
};

const RoomPlatform = ({ position, color, isExit, isPlayerHere, visited, exitUnlocked }) => {
  return (
    <group position={position}>
      {/* Platform Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE - 0.4, 0.2, ROOM_SIZE - 0.4]} />
        <meshLambertMaterial color={visited ? color : '#334155'} opacity={visited ? 1.0 : 0.85} transparent />
      </mesh>
      {/* Platform Border (Greenery glow) */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[ROOM_SIZE - 0.2, 0.06, ROOM_SIZE - 0.2]} />
        <meshBasicMaterial color={visited ? '#22c55e' : '#475569'} opacity={0.4} transparent />
      </mesh>
      {isExit && <BalloonExit active={exitUnlocked} />}
      {isPlayerHere && <RobotCharacter />}
    </group>
  );
};

const SlideDoor = ({ position, rotation, isOpen }) => {
  return (
    <mesh position={[position[0], isOpen ? -0.95 : 0.45, position[2]]} rotation={rotation} castShadow>
      <boxGeometry args={[1.5, 0.9, 0.25]} />
      {/* If open, it glows emerald. If locked, it looks like wood with a lock */}
      <meshLambertMaterial 
        color={isOpen ? '#10b981' : '#b45309'} 
        emissive={isOpen ? '#10b981' : '#000000'}
        emissiveIntensity={isOpen ? 0.4 : 0} 
      />
    </mesh>
  );
};

const SkyBackground = () => {
  return (
    <group>
      {/* Blue void ground plane */}
      <mesh position={[0, -2.5, 0]} receiveShadow>
        <boxGeometry args={[50, 0.1, 50]} />
        <meshLambertMaterial color="#0284c7" />
      </mesh>
      {/* White clouds scattered around */}
      {[[ -10, -2, -10 ], [ 12, -2, -6 ], [ -8, -2, 11 ], [ 9, -2, 10 ], [ 0, -2.1, -12 ]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[1.4, 0, 0.5]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-1.4, 0, -0.5]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Game1_1Phonological = ({ player, onFinish }) => {

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
  const [currentSublevel, setCurrentSublevel] = useState(0); // resolved doors in current level (0 to 3)

  const [playerPos, setPlayerPos] = useState(START_POS);
  const [visitedRooms, setVisitedRooms] = useState(new Set([`${START_POS.x},${START_POS.y}`]));
  const [openedDoors, setOpenedDoors] = useState(new Set()); // Strings format "x1,y1->x2,y2"
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'maze_phonological',
          game_number: 3,
          level: 1,
        });
        setSessionId(res.data.id);
      } catch (e) {
        console.error('Error al iniciar sesión de juego:', e);
      }
    };
    startSession();
  }, [player]);

  const finishGame = async (correct, incorrect, total, finalScore, finalLvl) => {
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
    onFinish({ score: finalScore, level: finalLvl, sessionId });
  };

  const roomGrid = useMemo(() => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        grid.push({
          x, y,
          color: PLATFORM_COLORS[y * GRID_SIZE + x],
          isExit: x === EXIT_POS.x && y === EXIT_POS.y,
        });
      }
    }
    return grid;
  }, []);

  const doorsList = useMemo(() => {
    const list = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (x < GRID_SIZE - 1) {
          const key1 = `${x},${y}->${x + 1},${y}`;
          const key2 = `${x + 1},${y}->${x},${y}`;
          const px = (x - 2 + 0.5) * ROOM_SIZE;
          const pz = (2 - y) * ROOM_SIZE;
          list.push({
            key: key1,
            position: [px, 0, pz],
            rotation: [0, 0, 0],
            keys: [key1, key2]
          });
        }
        if (y < GRID_SIZE - 1) {
          const key1 = `${x},${y}->${x},${y + 1}`;
          const key2 = `${x},${y + 1}->${x},${y}`;
          const px = (x - 2) * ROOM_SIZE;
          const pz = (1.5 - y) * ROOM_SIZE;
          list.push({
            key: key1,
            position: [px, 0, pz],
            rotation: [0, Math.PI / 2, 0],
            keys: [key1, key2]
          });
        }
      }
    }
    return list;
  }, []);

  const exitUnlocked = currentSublevel >= 3;

  const movePlayer = (newX, newY, doorKeys) => {
    setOpenedDoors(prev => {
      const updated = new Set(prev);
      doorKeys.forEach(k => updated.add(k));
      return updated;
    });
    setPlayerPos({ x: newX, y: newY });
    const key = `${newX},${newY}`;
    setVisitedRooms(prev => new Set([...prev, key]));

    // Unlock logic
    const nextSublevel = Math.min(3, currentSublevel + 1);
    setCurrentSublevel(nextSublevel);

    if (newX === EXIT_POS.x && newY === EXIT_POS.y) {
      handleExitReached(nextSublevel);
    } else {
      if (nextSublevel === 3) {
        setFeedback('¡Puerta abierta! ¡El globo aerostático de escape ya está encendido! Corre a la esquina (4,4) para despegar.');
      } else {
        setFeedback('¡Puerta abierta! Cruzaste.');
      }
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleExitReached = (subLvl) => {
    if (subLvl < 3) {
      setFeedback('¡El globo está apagado! Resuelve 3 puertas para encenderlo.');
      setTimeout(() => setFeedback(''), 2500);
      return;
    }

    if (currentLevel < 5) {
      setFeedback(`¡Nivel ${currentLevel} Completado! Prepárate para el Nivel ${currentLevel + 1} con preguntas más difíciles.`);
      setTimeout(() => {
        setCurrentLevel(l => l + 1);
        setCurrentSublevel(0);
        setPlayerPos(START_POS);
        setVisitedRooms(new Set([`${START_POS.x},${START_POS.y}`]));
        setOpenedDoors(new Set());
        setFeedback('');
      }, 3000);
    } else {
      setGameState('won');
      setFeedback('¡Llegaste a la Meta Final! ¡Eres un Maestro Explorador de Palabras!');
      const finalScore = (correctCount + 1) * 150;
      finishGame(correctCount + 1, incorrectCount, correctCount + 1 + incorrectCount, finalScore, 5);
    }
  };

  const attemptMove = (dir) => {
    if (gameState !== 'playing') return;
    let dx = 0, dy = 0;
    if (dir === 'up') dy = 1;
    else if (dir === 'down') dy = -1;
    else if (dir === 'left') dx = -1;
    else if (dir === 'right') dx = 1;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      setFeedback('¡No hay camino por ahí!');
      setTimeout(() => setFeedback(''), 1500);
      return;
    }

    // Block entry to exit position unless 3 doors are unlocked
    if (newX === EXIT_POS.x && newY === EXIT_POS.y) {
      if (currentSublevel < 3) {
        setFeedback('¡El globo está apagado! Debes abrir 3 puertas del laberinto para encenderlo.');
        setTimeout(() => setFeedback(''), 2500);
        return;
      }
    }

    const doorKey = `${playerPos.x},${playerPos.y}->${newX},${newY}`;
    const reciprocalKey = `${newX},${newY}->${playerPos.x},${playerPos.y}`;

    if (openedDoors.has(doorKey)) {
      setPlayerPos({ x: newX, y: newY });
      setVisitedRooms(prev => new Set([...prev, `${newX},${newY}`]));
      if (newX === EXIT_POS.x && newY === EXIT_POS.y) {
        handleExitReached(currentSublevel);
      }
      return;
    }

    // Get question list for current level
    const levelPool = QUESTIONS_BY_LEVEL[currentLevel] || QUESTIONS_BY_LEVEL[1];
    const randomIndex = Math.floor(Math.random() * levelPool.length);
    setCurrentRiddle(levelPool[randomIndex]);
    setPendingMove({ newX, newY, doorKeys: [doorKey, reciprocalKey] });
  };

  const handleAnswerSubmit = (option) => {
    if (!currentRiddle || !pendingMove) return;

    if (option === currentRiddle.answer) {
      setCorrectCount(c => c + 1);
      playCorrectSound();
      const { newX, newY, doorKeys } = pendingMove;
      movePlayer(newX, newY, doorKeys);
    } else {
      setIncorrectCount(i => i + 1);
      setFeedback(`¡Oh-oh! El Duende dice que esa no es. Pista: La correcta es "${currentRiddle.answer}"`);
      setTimeout(() => setFeedback(''), 3000);
    }

    setCurrentRiddle(null);
    setPendingMove(null);
  };

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (currentRiddle) return; // Do not move if riddle pop-up is active

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        attemptMove('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        attemptMove('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        attemptMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        attemptMove('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, currentRiddle, playerPos, openedDoors, currentSublevel, currentLevel]);

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 15, 13]} fov={50} />
          <OrbitControls enablePan={false} minDistance={10} maxDistance={22} maxPolarAngle={Math.PI / 2.3} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 15, 5]} intensity={1.0} castShadow />
          <SkyBackground />
          {roomGrid.map((room) => {
            const px = (room.x - 2) * ROOM_SIZE;
            const pz = (2 - room.y) * ROOM_SIZE;
            return (
              <RoomPlatform
                key={`${room.x},${room.y}`}
                position={[px, 0, pz]}
                color={room.color}
                isExit={room.isExit}
                isPlayerHere={playerPos.x === room.x && playerPos.y === room.y}
                visited={visitedRooms.has(`${room.x},${room.y}`)}
                exitUnlocked={exitUnlocked}
              />
            );
          })}
          {doorsList.map((door) => {
            const isOpen = door.keys.some(k => openedDoors.has(k));
            return (
              <SlideDoor
                key={door.key}
                position={door.position}
                rotation={door.rotation}
                isOpen={isOpen}
              />
            );
          })}
        </Suspense>
      </Canvas>

      {/* HUD (Glassmorphic) */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10 font-sans">
        <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Explorador de Palabras</div>
        <div className="text-base font-extrabold text-emerald-400">Juego Fonológico</div>
        
        {/* Level and Sublevel HUD */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs text-indigo-300 font-semibold">Nivel (Dificultad):</span>
            <span className="text-xs bg-indigo-500/30 px-2 py-0.5 rounded font-black text-white">{currentLevel} / 5</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs text-indigo-300 font-semibold">Puertas Abiertas:</span>
            <span className="text-xs bg-emerald-500/30 px-2 py-0.5 rounded font-black text-emerald-300">{currentSublevel} / 3</span>
          </div>
        </div>

        <div className="text-[10px] mt-4 space-y-1 text-indigo-200 border-t border-white/10 pt-2">
          <div>Habitación: ({playerPos.x}, {playerPos.y})</div>
          <div>Islas visitadas: {visitedRooms.size} / 25</div>
          <div>Errores cometidos: {incorrectCount}</div>
        </div>
      </div>

      <button
        onClick={() => setShowHelpModal(true)}
        className="absolute top-4 right-28 p-2.5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 flex items-center justify-center"
        title="¿Cómo jugar?"
      >
        <HelpCircle className="w-5 h-5 text-indigo-300" />
      </button>

      <button
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100, currentLevel)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Controles Táctiles Simplificados */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 bg-slate-900/85 backdrop-blur-md p-4 rounded-3xl border border-indigo-500/20 shadow-2xl">
        <button 
          onClick={() => attemptMove('up')} 
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-10">
          <button 
            onClick={() => attemptMove('left')} 
            className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => attemptMove('right')} 
            className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        <button 
          onClick={() => attemptMove('down')} 
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>

      {/* Keyboard info indicator */}
      <div className="absolute bottom-4 right-4 text-[10px] text-indigo-300 font-semibold bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
        ⌨️ Puedes usar las flechas del teclado
      </div>

      {/* Feedback flotante */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl z-20 text-white font-sans text-base font-bold shadow-2xl text-center select-none max-w-sm">
          {feedback}
        </div>
      )}

      {/* Riddle modal (Duende Pop-up) */}
      {currentRiddle && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-gradient-to-b from-[#131238] to-[#080a1c] border-2 border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full mx-4 text-white shadow-2xl relative animate-scaleUp">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-3xl mx-auto animate-bounce">
              🧝
            </div>
            <h3 className="text-lg font-black text-center text-emerald-300 uppercase tracking-widest mb-1">Cofre del Duende</h3>
            <p className="text-gray-300 text-xs text-center font-bold mb-4">{currentRiddle.hint}</p>
            <p className="text-gray-100 text-sm font-extrabold text-center mb-6">{currentRiddle.question}</p>
            <div className="flex flex-col gap-3">
              {currentRiddle.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit(opt)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-2xl transition-all duration-200 shadow-md hover:scale-102 cursor-pointer text-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setCurrentRiddle(null); setPendingMove(null); }}
              className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              RODEAR LABERINTO
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
            <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-400 animate-pulse" /> El Laberinto del Explorador
            </h3>
            <div className="space-y-4 text-xs text-gray-200">
              <p>
                Guía a tu amigable robot explorador por el laberinto de 5x5 plataformas de jardín. Resuelve las preguntas de sonido y rimas planteadas por los duendes para abrir los candados y desbloquear las puertas de piedra permanentemente.
              </p>
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-200">Cómo se juega:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>Usa las 4 flechas de dirección grandes en pantalla o las **flechas del teclado** para caminar a otra plataforma.</li>
                  <li>Si una puerta está bloqueada, el Duende te dará un acertijo sobre sílabas o sonidos.</li>
                  <li>Responde correctamente para que la puerta de piedra se abra y se quede abierta para siempre.</li>
                  <li>**Progreso de Niveles:** El juego tiene 5 niveles. Para activar el globo de escape de cada nivel, debes resolver **al menos 3 puertas** correctamente.</li>
                  <li>Al desbloquear 3 puertas, el globo se encenderá. Camina a la esquina superior derecha (4,4) para despegar al siguiente nivel, donde los retos serán más difíciles.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer text-sm"
            >
              ¡A Jugar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game1_1Phonological;
