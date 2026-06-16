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
  '#3b0764', '#581c87', '#4c1d95', '#6b21a8', '#2e1065',
  '#4c1d95', '#3b0764', '#6b21a8', '#581c87', '#701a75',
  '#581c87', '#2e1065', '#3b0764', '#701a75', '#4c1d95',
  '#6b21a8', '#4c1d95', '#701a75', '#3b0764', '#581c87',
  '#2e1065', '#701a75', '#581c87', '#6b21a8', '#3b0764'
];

const QUESTIONS_BY_LEVEL = {
  1: [
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE para abrir el camino.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['ZAPATO', 'SAPATO'],
      answer: 'ZAPATO',
      emoji: '👟'
    },
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE para abrir el camino.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['CASA', 'CAZA'],
      answer: 'CASA',
      emoji: '🏠'
    },
    {
      type: 'homofonas',
      hint: 'Mira este dibujo de una VACA (animal). ¡Elige la escritura correcta de la palabra!',
      question: '¿Qué cofre tiene el nombre del animal de la imagen?',
      options: ['BACA', 'VACA'],
      answer: 'VACA',
      emoji: '🐄'
    },
    {
      type: 'homofonas',
      hint: 'Mira este dibujo de una BOTA (calzado). ¡Elige la escritura correcta!',
      question: '¿Qué cofre tiene la palabra correspondiente al calzado?',
      options: ['BOTA', 'VOTA'],
      answer: 'BOTA',
      emoji: '🥾'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['SOL', 'LSO'],
      answer: 'SOL',
      emoji: '☀️'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['PERRO', 'PREOR'],
      answer: 'PERRO',
      emoji: '🐶'
    }
  ],
  2: [
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['UEVO', 'HUEVO'],
      answer: 'HUEVO',
      emoji: '🥚'
    },
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['BEBÉ', 'VEVÉ'],
      answer: 'BEBÉ',
      emoji: '👶'
    },
    {
      type: 'homofonas',
      hint: 'Mira esta ola de mar gigante. ¡Evita el cofre tramposo!',
      question: '¿Cuál es la escritura correcta para la ola de mar?',
      options: ['OLA', 'HOLA'],
      answer: 'OLA',
      emoji: '🌊'
    },
    {
      type: 'homofonas',
      hint: 'Mira este saludo de bienvenida. ¡Elige el cofre correcto!',
      question: '¿Cuál es la escritura correcta para decir HOLA?',
      options: ['OLA', 'HOLA'],
      answer: 'HOLA',
      emoji: '👋'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['GATO', 'TGAS'],
      answer: 'GATO',
      emoji: '🐱'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['MESA', 'SMAE'],
      answer: 'MESA',
      emoji: '🪑'
    }
  ],
  3: [
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['HABLAR', 'ABLAR'],
      answer: 'HABLAR',
      emoji: '🗣️'
    },
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['BASO', 'VASO'],
      answer: 'VASO',
      emoji: '🥛'
    },
    {
      type: 'homofonas',
      hint: 'Mira este tubo de metal cilíndrico. ¡Evita el cofre tramposo!',
      question: '¿Cuál es la escritura correcta para la tubería?',
      options: ['TUBO', 'TUVO'],
      answer: 'TUBO',
      emoji: '🧱'
    },
    {
      type: 'homofonas',
      hint: 'Mira este pasto/césped verde. ¡Elige el cofre correcto!',
      question: '¿Cuál es la escritura correcta para la planta?',
      options: ['HIERBA', 'YERBA'],
      answer: 'HIERBA',
      emoji: '🌿'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['LUNA', 'LNUA'],
      answer: 'LUNA',
      emoji: '🌙'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['FLORES', 'FRLOES'],
      answer: 'FLORES',
      emoji: '🌸'
    }
  ],
  4: [
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['CABALLO', 'CAVALLO'],
      answer: 'CABALLO',
      emoji: '🐴'
    },
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['BOTELLA', 'VOTELLA'],
      answer: 'BOTELLA',
      emoji: '🍾'
    },
    {
      type: 'homofonas',
      hint: 'Mira este pasto seco para alimentar caballos (heno). ¡Elige el correcto!',
      question: '¿Cuál es la escritura correcta para el HENO?',
      options: ['HENO', 'ENO'],
      answer: 'HENO',
      emoji: '🌾'
    },
    {
      type: 'homofonas',
      hint: 'Mira la aguja de este reloj. ¡Elige el cofre correcto!',
      question: '¿Cuál es la escritura correcta para la HORA?',
      options: ['HORA', 'ORA'],
      answer: 'HORA',
      emoji: '⏰'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['PLÁTANO', 'PLATINA'],
      answer: 'PLÁTANO',
      emoji: '🍌'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['ESTRELLA', 'ERTSELLA'],
      answer: 'ESTRELLA',
      emoji: '⭐'
    }
  ],
  5: [
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['ZANAHORIA', 'SANAHORIA'],
      answer: 'ZANAHORIA',
      emoji: '🥕'
    },
    {
      type: 'ortografia',
      hint: 'El Hechizo del cofre: Elige la palabra escrita CORRECTAMENTE.',
      question: '¿Cuál cofre tiene la palabra correcta?',
      options: ['LLAVE', 'YAVE'],
      answer: 'LLAVE',
      emoji: '🔑'
    },
    {
      type: 'homofonas',
      hint: 'Mira este búho que es un sabio consejero. ¡Elige el cofre correcto!',
      question: '¿Cuál es la escritura correcta para decir SABIO?',
      options: ['SABIO', 'SAVIO'],
      answer: 'SABIO',
      emoji: '🦉'
    },
    {
      type: 'homofonas',
      hint: 'Mira esta flor tan hermosa y bella. ¡Elige el cofre correcto!',
      question: '¿Cuál es la escritura correcta para decir BELLO (hermoso)?',
      options: ['BELLO', 'VELLO'],
      answer: 'BELLO',
      emoji: '🌺'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['MERMELADA', 'MERLEMANA'],
      answer: 'MERMELADA',
      emoji: '🍯'
    },
    {
      type: 'pseudopalabras',
      hint: '¡Alerta! Uno de los cofres tiene una palabra inventada.',
      question: '¡Encuentra el cofre con la palabra que SÍ existe en el mundo real!',
      options: ['TELEVISOR', 'TELEVISUR'],
      answer: 'TELEVISOR',
      emoji: '📺'
    }
  ]
};

const RobotCharacter = () => {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.8, 16]} />
        <meshLambertMaterial color="#e879f9" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshLambertMaterial color="#f472b6" />
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
        <meshLambertMaterial color="#fbcfe8" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#fb7185" />
      </mesh>
      {/* Wheels/Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.15, 16]} />
        <meshLambertMaterial color="#475569" />
      </mesh>
    </group>
  );
};

const PirateShipExit = ({ active }) => {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Golden Portal base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.1, 16]} />
        <meshLambertMaterial color={active ? '#fbbf24' : '#475569'} />
      </mesh>
      {/* Portal ring */}
      <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.8, 0.12, 12, 24]} />
        <meshLambertMaterial color={active ? '#fb7185' : '#334155'} emissive={active ? '#fb7185' : '#000000'} emissiveIntensity={active ? 0.6 : 0} />
      </mesh>
      {/* Golden escape light */}
      {active && <pointLight position={[0, 0.9, 0]} color="#fb7185" intensity={2.0} distance={6} />}
      {/* Escape ship representation */}
      <mesh position={[0, 0.9, -0.2]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.4]} />
        <meshLambertMaterial color={active ? '#f59e0b' : '#3f3f46'} />
      </mesh>
      <mesh position={[0, 1.4, -0.2]}>
        <coneGeometry args={[0.25, 0.6, 4]} />
        <meshLambertMaterial color={active ? '#ef4444' : '#52525b'} />
      </mesh>
    </group>
  );
};

const RoomPlatform = ({ position, color, isExit, isPlayerHere, visited, exitUnlocked }) => {
  return (
    <group position={position}>
      {/* Platform Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE - 0.4, 0.2, ROOM_SIZE - 0.4]} />
        <meshLambertMaterial color={visited ? color : '#1e1b4b'} opacity={visited ? 1.0 : 0.85} transparent />
      </mesh>
      {/* Platform Border (Castle neon glow) */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[ROOM_SIZE - 0.2, 0.06, ROOM_SIZE - 0.2]} />
        <meshBasicMaterial color={visited ? '#d946ef' : '#312e81'} opacity={0.5} transparent />
      </mesh>
      {isExit && <PirateShipExit active={exitUnlocked} />}
      {isPlayerHere && <RobotCharacter />}
    </group>
  );
};

const ChestDoor = ({ position, rotation, isOpen }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* The main energy barrier gate */}
      <mesh position={[0, isOpen ? -0.95 : 0.45, 0]} castShadow>
        <boxGeometry args={[1.5, 0.9, 0.25]} />
        <meshLambertMaterial 
          color={isOpen ? '#a855f7' : '#475569'} 
          emissive={isOpen ? '#d946ef' : '#000000'}
          emissiveIntensity={isOpen ? 0.5 : 0} 
        />
      </mesh>
      {/* Left Chest (Yellow/gold box) */}
      {!isOpen && (
        <mesh position={[-0.9, 0.2, 0]} castShadow>
          <boxGeometry args={[0.32, 0.25, 0.25]} />
          <meshLambertMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.2} />
        </mesh>
      )}
      {/* Right Chest (Yellow/gold box) */}
      {!isOpen && (
        <mesh position={[0.9, 0.2, 0]} castShadow>
          <boxGeometry args={[0.32, 0.25, 0.25]} />
          <meshLambertMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.2} />
        </mesh>
      )}
    </group>
  );
};

const SkyBackground = () => {
  return (
    <group>
      {/* Deep purple space/void ground plane */}
      <mesh position={[0, -2.5, 0]} receiveShadow>
        <boxGeometry args={[50, 0.1, 50]} />
        <meshLambertMaterial color="#1e1b4b" />
      </mesh>
      {/* floating crystal spheres */}
      {[[ -9, -1, -9 ], [ 11, -1.2, -5 ], [ -7, -0.8, 10 ], [ 10, -1, 9 ], [ 0, -1.5, -11 ]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow>
            <sphereGeometry args={[1.0, 12, 12]} />
            <meshLambertMaterial color="#d946ef" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.8, 0.5, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshLambertMaterial color="#c084fc" transparent opacity={0.5} />
          </mesh>
          <mesh position={[-0.8, -0.5, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshLambertMaterial color="#c084fc" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Game1_2Superficial = ({ player, onFinish }) => {

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
  const [shakeOption, setShakeOption] = useState(null); // Option that was wrong to animate shake

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'maze_superficial',
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
        setFeedback('¡Cofre correcto! ¡El portal de escape del castillo ya está activado! Camina a la esquina (4,4) para salir.');
      } else {
        setFeedback('¡Cofre correcto elegido! La puerta se abrió.');
      }
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleExitReached = (subLvl) => {
    if (subLvl < 3) {
      setFeedback('¡El portal de escape está bloqueado! Abre 3 cofres para activarlo.');
      setTimeout(() => setFeedback(''), 2500);
      return;
    }

    if (currentLevel < 5) {
      setFeedback(`¡Nivel ${currentLevel} Completado! Prepárate para el Nivel ${currentLevel + 1} con palabras más difíciles.`);
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
      setFeedback('¡Escapaste de todos los Castillos! ¡Eres un Maestro Explorador de Palabras!');
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
        setFeedback('¡El portal está bloqueado! Debes abrir 3 cofres del laberinto para activarlo.');
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

    // Filter questions by level
    const levelPool = QUESTIONS_BY_LEVEL[currentLevel] || QUESTIONS_BY_LEVEL[1];
    const randomIndex = Math.floor(Math.random() * levelPool.length);
    const chosen = levelPool[randomIndex];

    // Randomize option display order (Left vs Right chest)
    const shuffledOptions = [...chosen.options].sort(() => Math.random() - 0.5);

    setCurrentRiddle({
      ...chosen,
      shuffledOptions
    });
    setPendingMove({ newX, newY, doorKeys: [doorKey, reciprocalKey] });
  };

  const handleAnswerSubmit = (option) => {
    if (!currentRiddle || !pendingMove) return;

    if (option === currentRiddle.answer) {
      setCorrectCount(c => c + 1);
      playCorrectSound();
      const { newX, newY, doorKeys } = pendingMove;
      movePlayer(newX, newY, doorKeys);
      setCurrentRiddle(null);
      setPendingMove(null);
    } else {
      setIncorrectCount(i => i + 1);
      setShakeOption(option);
      setFeedback(`¡Oh-oh! Cofre Tramposo. Pista: La correcta es "${currentRiddle.answer}"`);
      
      // Stop shaking and let the user review
      setTimeout(() => {
        setShakeOption(null);
        setFeedback('');
      }, 3000);
    }
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
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #180828 0%, #2e1065 50%, #090214 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 15, 13]} fov={50} />
          <OrbitControls enablePan={false} minDistance={10} maxDistance={22} maxPolarAngle={Math.PI / 2.3} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[6, 12, 6]} intensity={1.2} castShadow />
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
              <ChestDoor
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
      <div className="absolute top-4 left-4 p-5 bg-slate-950/80 backdrop-blur-md border border-fuchsia-500/25 rounded-2xl text-white shadow-xl z-10 font-sans">
        <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Explorador de Palabras</div>
        <div className="text-base font-extrabold text-fuchsia-400">Juego Superficial</div>
        
        {/* Level and Sublevel HUD */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs text-fuchsia-300 font-semibold">Nivel (Dificultad):</span>
            <span className="text-xs bg-fuchsia-500/30 px-2 py-0.5 rounded font-black text-white">{currentLevel} / 5</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-xs text-fuchsia-300 font-semibold">Cofres Abiertos:</span>
            <span className="text-xs bg-pink-500/30 px-2 py-0.5 rounded font-black text-pink-300">{currentSublevel} / 3</span>
          </div>
        </div>

        <div className="text-[10px] mt-4 space-y-1 text-fuchsia-200 border-t border-white/10 pt-2">
          <div>Habitación: ({playerPos.x}, {playerPos.y})</div>
          <div>Cofres totales: {visitedRooms.size} / 25</div>
          <div>Errores cometidos: {incorrectCount}</div>
        </div>
      </div>

      <button
        onClick={() => setShowHelpModal(true)}
        className="absolute top-4 right-28 p-2.5 bg-slate-950/80 backdrop-blur-md border border-fuchsia-500/20 hover:border-fuchsia-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 flex items-center justify-center"
        title="¿Cómo jugar?"
      >
        <HelpCircle className="w-5 h-5 text-fuchsia-300" />
      </button>

      <button
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100, currentLevel)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Controles Táctiles Simplificados */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 bg-slate-950/85 backdrop-blur-md p-4 rounded-3xl border border-fuchsia-500/20 shadow-2xl">
        <button 
          onClick={() => attemptMove('up')} 
          className="w-14 h-14 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-10">
          <button 
            onClick={() => attemptMove('left')} 
            className="w-14 h-14 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => attemptMove('right')} 
            className="w-14 h-14 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        <button 
          onClick={() => attemptMove('down')} 
          className="w-14 h-14 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>

      {/* Keyboard info indicator */}
      <div className="absolute bottom-4 right-4 text-[10px] text-fuchsia-300 font-semibold bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5">
        ⌨️ Puedes usar las flechas del teclado
      </div>

      {/* Feedback flotante */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-950/95 backdrop-blur-md border border-fuchsia-500/30 rounded-2xl z-20 text-white font-sans text-base font-bold shadow-2xl text-center select-none max-w-sm">
          {feedback}
        </div>
      )}

      {/* Riddle modal (Cofres Tramposos pop-up) */}
      {currentRiddle && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-gradient-to-b from-[#220c35] to-[#0d0417] border-2 border-fuchsia-500/40 rounded-3xl p-6 max-w-sm w-full mx-4 text-white shadow-2xl relative">
            
            {/* Clue drawing / Emoji display */}
            <div className="w-20 h-20 bg-fuchsia-500/10 border border-fuchsia-500/25 rounded-full flex items-center justify-center mb-4 text-5xl mx-auto animate-bounce">
              {currentRiddle.emoji || '🎁'}
            </div>

            <h3 className="text-base font-black text-center text-fuchsia-300 uppercase tracking-widest mb-1">El Hechizo del Cofre</h3>
            <p className="text-gray-300 text-[11px] text-center mb-4">{currentRiddle.hint}</p>
            <p className="text-gray-100 text-sm font-extrabold text-center mb-6">{currentRiddle.question}</p>
            
            <div className="flex gap-4">
              {currentRiddle.shuffledOptions.map((opt, i) => {
                const isShaking = shakeOption === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSubmit(opt)}
                    className={`flex-1 py-6 bg-gradient-to-b from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 border-2 border-fuchsia-500/30 hover:border-fuchsia-400 text-white font-black rounded-2xl transition-all duration-200 shadow-lg active:scale-95 cursor-pointer text-center text-base flex flex-col items-center justify-center gap-2 ${
                      isShaking ? 'animate-shake border-red-500 bg-red-950/20' : ''
                    }`}
                  >
                    <span className="text-3xl">📦</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => { setCurrentRiddle(null); setPendingMove(null); }}
              className="w-full mt-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              RODEAR LABERINTO
            </button>
          </div>
        </div>
      )}

      {/* Help Modal Overlay */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#220c35] to-[#0d0417] border-2 border-fuchsia-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative font-sans">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-fuchsia-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-fuchsia-400" /> El Laberinto de los Cofres Tramposos
            </h3>
            <div className="space-y-4 text-xs text-gray-200">
              <p>
                ¡Bienvenido al Castillo de las Ilusiones! Guía a tu robot por el laberinto de 5x5 plataformas de castillo flotantes. Cada puerta está custodiada por dos cofres. Uno tiene un hechizo tramposo y el otro tiene la palabra escrita correctamente.
              </p>
              <div className="space-y-2">
                <h4 className="font-bold text-fuchsia-200">Cómo se juega:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>Usa las flechas de dirección grandes en pantalla o las **flechas del teclado** para moverte hacia una nueva habitación.</li>
                  <li>Al chocar con una puerta cerrada, verás una pista en pantalla y dos cofres.</li>
                  <li>Haz clic en el cofre que tenga la palabra escrita con la ortografía CORRECTA.</li>
                  <li>**Progreso de Niveles:** El juego tiene 5 niveles. Para activar el portal de escape del castillo, debes abrir **al menos 3 cofres** correctamente.</li>
                  <li>Al abrir 3 cofres, el portal de la esquina (4,4) se encenderá en rosa. Camina hacia él para viajar al siguiente nivel, donde los retos serán más difíciles.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer text-sm"
            >
              ¡A Jugar!
            </button>
          </div>
        </div>
      )}

      {/* Extra Shake CSS Animation injected */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Game1_2Superficial;
