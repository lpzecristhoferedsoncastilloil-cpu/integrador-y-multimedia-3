import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import api from '../../services/api';

const GRID_SIZE = 5;
const ROOM_SIZE = 4.5;
const START_POS = { x: 0, y: 0 };
const EXIT_POS = { x: 4, y: 4 };

const PLATFORM_COLORS = [
  '#0e7490', '#0284c7', '#0369a1', '#0f766e', '#115e59',
  '#0369a1', '#0e7490', '#115e59', '#0f766e', '#0891b2',
  '#0f766e', '#115e59', '#0e7490', '#0891b2', '#0369a1',
  '#115e59', '#0e7490', '#0891b2', '#0369a1', '#0f766e',
  '#0369a1', '#0891b2', '#0f766e', '#115e59', '#0e7490'
];

const QUESTIONS_BY_LEVEL = {
  1: [
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas para encenderla.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['SA', 'CA'],
      correctOrder: ['CA', 'SA'],
      emoji: '🏠',
      word: 'CASA'
    },
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas para encenderla.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['SA', 'ME'],
      correctOrder: ['ME', 'SA'],
      emoji: '🪑',
      word: 'MESA'
    },
    {
      type: 'espejo',
      hint: '¡Cuidado con las letras espejo trampa! Selecciona solo las sílabas correctas para armar el dibujo.',
      question: 'Construye la palabra BOTA (ignora las sílabas trampa):',
      syllables: ['DO', 'BO', 'TA', 'DA'],
      correctOrder: ['BO', 'TA'],
      emoji: '🥾',
      word: 'BOTA'
    },
    {
      type: 'sinfones',
      hint: '¿Cómo se llama este transporte? Elige la palabra bien pronunciada.',
      question: 'Selecciona la opción correcta:',
      syllables: ['TEN', 'TREN'],
      correctOrder: ['TREN'],
      emoji: '🚂',
      word: 'TREN'
    }
  ],
  2: [
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas para encenderla.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['TO', 'GA'],
      correctOrder: ['GA', 'TO'],
      emoji: '🐱',
      word: 'GATO'
    },
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas para encenderla.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['NA', 'LU'],
      correctOrder: ['LU', 'NA'],
      emoji: '🌙',
      word: 'LUNA'
    },
    {
      type: 'espejo',
      hint: '¡Cuidado con las letras espejo trampa! Selecciona solo las sílabas correctas.',
      question: 'Construye la palabra DADO (ignora las sílabas trampa):',
      syllables: ['BA', 'DA', 'DO', 'BO'],
      correctOrder: ['DA', 'DO'],
      emoji: '🎲',
      word: 'DADO'
    },
    {
      type: 'sinfones',
      hint: '¿En qué comemos la sopa? Elige la palabra bien articulada.',
      question: 'Selecciona la opción correcta:',
      syllables: ['PATO', 'PLATO'],
      correctOrder: ['PLATO'],
      emoji: '🍽️',
      word: 'PLATO'
    }
  ],
  3: [
    {
      type: 'secuenciacion',
      hint: '¡La máquina se detuvo! Ordena las sílabas en orden.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['TA', 'LO', 'PE'],
      correctOrder: ['PE', 'LO', 'TA'],
      emoji: '⚽',
      word: 'PELOTA'
    },
    {
      type: 'secuenciacion',
      hint: '¡La máquina se detuvo! Ordena las sílabas en orden.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['TO', 'ZA', 'PA'],
      correctOrder: ['ZA', 'PA', 'TO'],
      emoji: '👟',
      word: 'ZAPATO'
    },
    {
      type: 'espejo',
      hint: '¡Cuidado con las letras espejo trampa! Selecciona solo las sílabas correctas.',
      question: 'Construye la palabra PAYASO (ignora las sílabas trampa):',
      syllables: ['YA', 'PA', 'SO', 'QA'],
      correctOrder: ['PA', 'YA', 'SO'],
      emoji: '🤡',
      word: 'PAYASO'
    },
    {
      type: 'sinfones',
      hint: '¿Qué parte del cuerpo doblamos para hacer fuerza?',
      question: 'Selecciona la opción correcta:',
      syllables: ['BAZO', 'BRAZO'],
      correctOrder: ['BRAZO'],
      emoji: '💪',
      word: 'BRAZO'
    }
  ],
  4: [
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['TA', 'PLA', 'NO'],
      correctOrder: ['PLA', 'TA', 'NO'],
      emoji: '🍌',
      word: 'PLÁTANO'
    },
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['DA', 'MI', 'CO'],
      correctOrder: ['CO', 'MI', 'DA'],
      emoji: '🍎',
      word: 'COMIDA'
    },
    {
      type: 'espejo',
      hint: '¡Cuidado con las letras espejo trampa! Selecciona solo las sílabas correctas.',
      question: 'Construye la palabra QUESO (ignora las sílabas trampa):',
      syllables: ['SO', 'QUE', 'PE', 'ZO'],
      correctOrder: ['QUE', 'SO'],
      emoji: '🧀',
      word: 'QUESO'
    },
    {
      type: 'sinfones',
      hint: '¿Qué se infla con aire en los cumpleaños?',
      question: 'Selecciona la opción correcta:',
      syllables: ['GOBO', 'GLOBO'],
      correctOrder: ['GLOBO'],
      emoji: '🎈',
      word: 'GLOBO'
    }
  ],
  5: [
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas.',
      question: 'Ordena la palabra de 4 sílabas correspondiente a este dibujo:',
      syllables: ['PO', 'MA', 'SA', 'RI'],
      correctOrder: ['MA', 'RI', 'PO', 'SA'],
      emoji: '🦋',
      word: 'MARIPOSA'
    },
    {
      type: 'secuenciacion',
      hint: '¡La máquina de juguetes se detuvo! Ordena las sílabas.',
      question: 'Ordena la palabra correspondiente a este dibujo:',
      syllables: ['LLA', 'TRE', 'ES'],
      correctOrder: ['ES', 'TRE', 'LLA'],
      emoji: '⭐',
      word: 'ESTRELLA'
    },
    {
      type: 'espejo',
      hint: '¡Cuidado con las letras espejo trampa! Selecciona las correctas.',
      question: 'Construye la palabra DIBUJO (ignora las sílabas trampa):',
      syllables: ['BI', 'DI', 'JU', 'BU', 'BO'],
      correctOrder: ['DI', 'BU', 'JU', 'BU', 'BO'].filter(x => x === 'DI' || x === 'BU' || x === 'JU'), // Wait, let's keep it exact: 'DI', 'BU', 'JO'
      correctOrder: ['DI', 'BU', 'JO'],
      emoji: '🎨',
      word: 'DIBUJO'
    },
    {
      type: 'sinfones',
      hint: '¿Qué es una manzana o un plátano?',
      question: 'Selecciona la opción correcta:',
      syllables: ['FUTA', 'FRUTA'],
      correctOrder: ['FRUTA'],
      emoji: '🍎',
      word: 'FRUTA'
    },
    {
      type: 'sinfones',
      hint: '¿Con qué aseguramos las maderas martillando?',
      question: 'Selecciona la opción correcta:',
      syllables: ['CAVO', 'CLAVO'],
      correctOrder: ['CLAVO'],
      emoji: '🔨',
      word: 'CLAVO'
    }
  ]
};

const RobotCharacter = () => {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 16]} />
        <meshLambertMaterial color="#f97316" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshLambertMaterial color="#fb923c" />
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
        <meshLambertMaterial color="#fed7aa" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* Wheels/Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.15, 16]} />
        <meshLambertMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

const MagicRocketExit = ({ active }) => {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Launchpad base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.1, 16]} />
        <meshLambertMaterial color="#475569" />
      </mesh>
      {/* Rocket Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.0, 12]} />
        <meshLambertMaterial color={active ? '#06b6d4' : '#64748b'} />
      </mesh>
      {/* Rocket Nose */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.26, 0.4, 12]} />
        <meshLambertMaterial color={active ? '#f97316' : '#475569'} />
      </mesh>
      {/* Rocket Fins */}
      {[[0.25, 0], [-0.25, 0], [0, 0.25], [0, -0.25]].map((coord, idx) => (
        <mesh key={idx} position={[coord[0], 0.6, coord[1]]}>
          <boxGeometry args={[0.1, 0.4, 0.15]} />
          <meshLambertMaterial color={active ? '#f43f5e' : '#3f3f46'} />
        </mesh>
      ))}
      {active && <pointLight position={[0, 0.4, 0]} color="#06b6d4" intensity={2.0} distance={5} />}
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
      {/* Platform Border (Factory neon glow) */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[ROOM_SIZE - 0.2, 0.06, ROOM_SIZE - 0.2]} />
        <meshBasicMaterial color={visited ? '#06b6d4' : '#1e293b'} opacity={0.5} transparent />
      </mesh>
      {isExit && <MagicRocketExit active={exitUnlocked} />}
      {isPlayerHere && <RobotCharacter />}
    </group>
  );
};

const GearDoor = ({ position, rotation, isOpen }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Sliding metal door */}
      <mesh position={[0, isOpen ? -0.95 : 0.45, 0]} castShadow>
        <boxGeometry args={[1.5, 0.9, 0.25]} />
        <meshLambertMaterial 
          color={isOpen ? '#06b6d4' : '#64748b'} 
          emissive={isOpen ? '#0891b2' : '#000000'}
          emissiveIntensity={isOpen ? 0.5 : 0} 
        />
      </mesh>
      {/* Small top gear cylinders */}
      {!isOpen && (
        <>
          <mesh position={[-0.45, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
          <mesh position={[0.45, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
        </>
      )}
    </group>
  );
};

const SkyBackground = () => {
  return (
    <group>
      {/* Steel blue void ground plane */}
      <mesh position={[0, -2.5, 0]} receiveShadow>
        <boxGeometry args={[50, 0.1, 50]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      {/* Floating construction blocks */}
      {[[ -8, -0.5, -9 ], [ 10, -0.7, -4 ], [ -6, -0.3, 11 ], [ 9, -0.5, 8 ], [ 0, -1.2, -10 ]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshLambertMaterial color="#0891b2" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.5, 0.5, 0.5]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshLambertMaterial color="#f97316" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Game1_3Mixed = ({ player, onFinish }) => {

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

  // States for the syllable assembly mechanic
  const [assembledSyllables, setAssembledSyllables] = useState([]);
  const [availableSyllables, setAvailableSyllables] = useState([]);
  const [incorrectClicks, setIncorrectClicks] = useState(0);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'maze_mixed',
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

    const nextSublevel = Math.min(3, currentSublevel + 1);
    setCurrentSublevel(nextSublevel);

    if (newX === EXIT_POS.x && newY === EXIT_POS.y) {
      handleExitReached(nextSublevel);
    } else {
      if (nextSublevel === 3) {
        setFeedback('¡Máquina reparada! ¡El cohete de escape ya está listo para el despegue! Camina a la esquina (4,4) para despegar.');
      } else {
        setFeedback('¡Palabra armada con éxito! La compuerta se abrió.');
      }
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleExitReached = (subLvl) => {
    if (subLvl < 3) {
      setFeedback('¡El cohete de escape está bloqueado! Repara 3 maquinarias para encenderlo.');
      setTimeout(() => setFeedback(''), 2500);
      return;
    }

    if (currentLevel < 5) {
      setFeedback(`¡Nivel ${currentLevel} Completado! Avanzando al Nivel ${currentLevel + 1} con palabras más difíciles.`);
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
      setFeedback('¡Encendiste todos los Cohetes Mágicos! ¡Eres un Maestro Constructor de Palabras!');
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
        setFeedback('¡El cohete está apagado! Debes reparar 3 maquinarias en este laberinto para encenderlo.');
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

    const levelPool = QUESTIONS_BY_LEVEL[currentLevel] || QUESTIONS_BY_LEVEL[1];
    const randomIndex = Math.floor(Math.random() * levelPool.length);
    const chosen = levelPool[randomIndex];

    // Scramble syllables
    const scrambled = [...chosen.syllables].sort(() => Math.random() - 0.5);

    setCurrentRiddle(chosen);
    setAssembledSyllables([]);
    setAvailableSyllables(scrambled);
    setPendingMove({ newX, newY, doorKeys: [doorKey, reciprocalKey] });
  };

  const handleSyllableClick = (syllable, index) => {
    const updatedAssembled = [...assembledSyllables, syllable];
    setAssembledSyllables(updatedAssembled);

    const updatedAvailable = availableSyllables.filter((_, idx) => idx !== index);
    setAvailableSyllables(updatedAvailable);

    const targetLength = currentRiddle.correctOrder.length;
    if (updatedAssembled.length === targetLength) {
      const isCorrect = updatedAssembled.every((val, i) => val === currentRiddle.correctOrder[i]);
      if (isCorrect) {
        setCorrectCount(c => c + 1);
      playCorrectSound();
        const { newX, newY, doorKeys } = pendingMove;
        movePlayer(newX, newY, doorKeys);
        setCurrentRiddle(null);
        setPendingMove(null);
      } else {
        setIncorrectCount(i => i + 1);
        setIncorrectClicks(prev => prev + 1);
        setFeedback('¡Oh-oh! Las piezas saltaron. ¡Intenta en otro orden!');
        
        setTimeout(() => {
          setAssembledSyllables([]);
          const scrambled = [...currentRiddle.syllables].sort(() => Math.random() - 0.5);
          setAvailableSyllables(scrambled);
          setFeedback('');
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    if (!currentRiddle) return;
    setAssembledSyllables([]);
    const scrambled = [...currentRiddle.syllables].sort(() => Math.random() - 0.5);
    setAvailableSyllables(scrambled);
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
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #022c22 0%, #0f172a 50%, #030712 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 15, 13]} fov={50} />
          <OrbitControls enablePan={false} minDistance={10} maxDistance={22} maxPolarAngle={Math.PI / 2.3} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 14, 4]} intensity={1.1} castShadow />
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
              <GearDoor
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
      <div className="absolute top-4 left-4 p-5 bg-slate-950/80 backdrop-blur-md border border-cyan-500/25 rounded-2xl text-white shadow-xl z-10 font-sans">
        <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Explorador de Palabras</div>
        <div className="text-base font-extrabold text-cyan-400">Juego Mixto</div>
        
        {/* Level and Sublevel HUD */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs text-cyan-300 font-semibold">Nivel (Dificultad):</span>
            <span className="text-xs bg-cyan-500/30 px-2 py-0.5 rounded font-black text-white">{currentLevel} / 5</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs text-cyan-300 font-semibold">Máquinas Reparadas:</span>
            <span className="text-xs bg-teal-500/30 px-2 py-0.5 rounded font-black text-teal-300">{currentSublevel} / 3</span>
          </div>
        </div>

        <div className="text-[10px] mt-4 space-y-1 text-cyan-200 border-t border-white/10 pt-2">
          <div>Habitación: ({playerPos.x}, {playerPos.y})</div>
          <div>Maquinarias totales: {visitedRooms.size} / 25</div>
          <div>Errores cometidos: {incorrectCount}</div>
        </div>
      </div>

      <button
        onClick={() => setShowHelpModal(true)}
        className="absolute top-4 right-28 p-2.5 bg-slate-950/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 flex items-center justify-center"
        title="¿Cómo jugar?"
      >
        <HelpCircle className="w-5 h-5 text-cyan-300" />
      </button>

      <button
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100, currentLevel)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Controles Táctiles Simplificados */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 bg-slate-950/85 backdrop-blur-md p-4 rounded-3xl border border-cyan-500/20 shadow-2xl">
        <button 
          onClick={() => attemptMove('up')} 
          className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-10">
          <button 
            onClick={() => attemptMove('left')} 
            className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => attemptMove('right')} 
            className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        <button 
          onClick={() => attemptMove('down')} 
          className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>

      {/* Keyboard info indicator */}
      <div className="absolute bottom-4 right-4 text-[10px] text-cyan-300 font-semibold bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5">
        ⌨️ Puedes usar las flechas del teclado
      </div>

      {/* Feedback flotante */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-950/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl z-20 text-white font-sans text-base font-bold shadow-2xl text-center select-none max-w-sm">
          {feedback}
        </div>
      )}

      {/* Riddle modal (Constructor de Palabras pop-up) */}
      {currentRiddle && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-gradient-to-b from-[#062c35] to-[#040e17] border-2 border-cyan-500/40 rounded-3xl p-6 max-w-sm w-full mx-4 text-white shadow-2xl relative">
            
            {/* Clue drawing / Emoji display */}
            <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/25 rounded-full flex items-center justify-center mb-4 text-5xl mx-auto animate-bounce">
              {currentRiddle.emoji || '⚙️'}
            </div>

            <h3 className="text-base font-black text-center text-cyan-300 uppercase tracking-widest mb-1">Constructor de Palabras</h3>
            <p className="text-gray-300 text-[11px] text-center mb-4">{currentRiddle.hint}</p>
            <p className="text-gray-100 text-sm font-extrabold text-center mb-6">{currentRiddle.question}</p>
            
            {/* Word Slots (Assembled Syllables) */}
            <div className="flex justify-center gap-2 mb-6 min-h-[48px] p-2 bg-slate-900/60 rounded-2xl border border-white/5">
              {assembledSyllables.length === 0 ? (
                <span className="text-gray-500 text-xs self-center">Toca las piezas abajo...</span>
              ) : (
                assembledSyllables.map((syl, i) => (
                  <div 
                    key={i} 
                    className="px-4 py-2 bg-gradient-to-b from-cyan-400 to-teal-500 text-slate-950 font-black rounded-xl text-sm shadow-md animate-scaleUp"
                  >
                    {syl}
                  </div>
                ))
              )}
            </div>

            {/* Syllables buttons (Scrambled blocks) */}
            <div className="grid grid-cols-2 gap-3">
              {availableSyllables.map((syl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSyllableClick(syl, idx)}
                  className="py-4 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-extrabold rounded-2xl transition-all duration-200 active:scale-95 shadow cursor-pointer text-sm"
                >
                  {syl}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Borrar
              </button>
              <button
                onClick={() => { setCurrentRiddle(null); setPendingMove(null); }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                RODEAR LABERINTO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal Overlay */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#062c35] to-[#040e17] border-2 border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative font-sans">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-cyan-400" /> El Laberinto de la Fábrica de Palabras
            </h3>
            <div className="space-y-4 text-xs text-gray-200">
              <p>
                ¡Ayuda a encender la Fábrica de Juguetes Mágica! Guía a tu robot por el laberinto de 5x5 plataformas mecánicas. Cada puerta está bloqueada por una máquina apagada. Para encenderla y pasar, debes presionar las piezas de sílabas en el orden correcto para armar el nombre del dibujo.
              </p>
              <div className="space-y-2">
                <h4 className="font-bold text-cyan-200">Cómo se juega:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>Usa las flechas de dirección grandes en pantalla o las **flechas del teclado** para moverte.</li>
                  <li>Al chocar con una compuerta cerrada, verás un dibujo en la pantalla de la máquina y varios botones con sílabas.</li>
                  <li>Toca las sílabas una a una en el orden correcto para armar la palabra.</li>
                  <li>**Progreso de Niveles:** El juego tiene 5 niveles. Para activar el cohete de escape, debes reparar **al menos 3 maquinarias** correctamente.</li>
                  <li>Al reparar 3 maquinarias, el cohete de la esquina superior derecha (4,4) se encenderá. Camina hacia él para viajar al siguiente nivel, donde los retos serán más difíciles.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer text-sm"
            >
              ¡A Jugar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game1_3Mixed;
