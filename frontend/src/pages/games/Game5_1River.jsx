import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { ChevronLeft, ChevronRight, HelpCircle, Award } from 'lucide-react';
import api from '../../services/api';

// Words grouped by 10 levels (1 mini-level/round per level)
const LEVELS_ROUNDS = [
  // Level 1: Perro
  [
    { 
      keyword: 'PERRO', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es el mejor amigo del hombre, ladra y mueve la cola alegremente.', 
      animalType: 'perro', 
      correct: ['PERRO'], 
      wrong: ['BERRO', 'CERRO'] 
    }
  ],
  // Level 2: Gato
  [
    { 
      keyword: 'GATO', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es un felino doméstico pequeño, ronronea y maúlla. ¡Le gusta cazar ratones!', 
      animalType: 'gato', 
      correct: ['GATO'], 
      wrong: ['PATO', 'RATO'] 
    }
  ],
  // Level 3: León
  [
    { 
      keyword: 'LEÓN', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es el rey de la selva, tiene una gran melena y ruge con mucha fuerza.', 
      animalType: 'leon', 
      correct: ['LEÓN'], 
      wrong: ['PEÓN', 'LIMÓN'] 
    }
  ],
  // Level 4: Mono
  [
    { 
      keyword: 'MONO', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Le encanta trepar los árboles, colgarse de su cola y comer plátanos.', 
      animalType: 'mono', 
      correct: ['MONO'], 
      wrong: ['CONO', 'TONO'] 
    }
  ],
  // Level 5: Rana
  [
    { 
      keyword: 'RANA', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es pequeña y verde, vive cerca del agua, da grandes saltos y hace "croac".', 
      animalType: 'rana', 
      correct: ['RANA'], 
      wrong: ['LANA', 'CANA'] 
    }
  ],
  // Level 6: Lobo
  [
    { 
      keyword: 'LOBO', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es un animal salvaje parecido al perro, le aúlla a la luna llena en manada.', 
      animalType: 'lobo', 
      correct: ['LOBO'], 
      wrong: ['GLOBO', 'ROBO'] 
    }
  ],
  // Level 7: Pato
  [
    { 
      keyword: 'PATO', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Tiene plumas, camina de forma graciosa, nada en el estanque y hace "cuac".', 
      animalType: 'pato', 
      correct: ['PATO'], 
      wrong: ['GATO', 'PLATO'] 
    }
  ],
  // Level 8: Vaca
  [
    { 
      keyword: 'VACA', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es un animal grande del campo, come pasto, hace "muu" y nos da leche.', 
      animalType: 'vaca', 
      correct: ['VACA'], 
      wrong: ['MACA', 'PACA'] 
    }
  ],
  // Level 9: Loro
  [
    { 
      keyword: 'LORO', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es un ave de plumas verdes muy coloridas que puede imitar las palabras humanas.', 
      animalType: 'loro', 
      correct: ['LORO'], 
      wrong: ['CORO', 'TORO'] 
    }
  ],
  // Level 10: Oso
  [
    { 
      keyword: 'OSO', 
      rule: '¿QUÉ ANIMAL ES?', 
      desc: 'Es un animal peludo y grande, le gusta comer miel y duerme todo el invierno.', 
      animalType: 'oso', 
      correct: ['OSO'], 
      wrong: ['FOSO', 'COSO'] 
    }
  ]
];

const LANE_X = [-3, 0, 3];
const ROUNDS_PER_LEVEL = 1;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

// Cute cartoon SVG representations for animals
const AnimalSVG = ({ type }) => {
  switch (type) {
    case 'perro':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#d97706" />
          <ellipse cx="30" cy="50" rx="6" ry="10" fill="#fef08a" />
          <ellipse cx="70" cy="50" rx="6" ry="10" fill="#fef08a" />
          <path d="M 20 20 Q 10 40 25 50" stroke="#d97706" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 80 20 Q 90 40 75 50" stroke="#d97706" strokeWidth="8" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="45" r="5" fill="#000" />
          <circle cx="60" cy="45" r="5" fill="#000" />
          <polygon points="45,55 55,55 50,62" fill="#000" />
          <path d="M 45 68 Q 50 72 55 68" stroke="#000" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'gato':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="55" r="35" fill="#94a3b8" />
          <polygon points="20,35 30,10 45,30" fill="#94a3b8" />
          <polygon points="80,35 70,10 55,30" fill="#94a3b8" />
          <polygon points="23,32 30,15 40,28" fill="#fda4af" />
          <polygon points="77,32 70,15 60,28" fill="#fda4af" />
          <ellipse cx="40" cy="50" rx="4" ry="6" fill="#22c55e" />
          <ellipse cx="60" cy="50" rx="4" ry="6" fill="#22c55e" />
          <circle cx="40" cy="50" r="2" fill="#000" />
          <circle cx="60" cy="50" r="2" fill="#000" />
          <polygon points="47,60 53,60 50,64" fill="#fda4af" />
          <line x1="25" y1="58" x2="10" y2="56" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="25" y1="62" x2="8" y2="64" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="75" y1="58" x2="90" y2="56" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="75" y1="62" x2="92" y2="64" stroke="#e2e8f0" strokeWidth="2" />
        </svg>
      );
    case 'leon':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="42" fill="#ea580c" />
          <circle cx="50" cy="50" r="30" fill="#f59e0b" />
          <circle cx="40" cy="45" r="4" fill="#000" />
          <circle cx="60" cy="45" r="4" fill="#000" />
          <circle cx="46" cy="58" r="6" fill="#fef08a" />
          <circle cx="54" cy="58" r="6" fill="#fef08a" />
          <polygon points="46,53 54,53 50,58" fill="#000" />
        </svg>
      );
    case 'mono':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="20" cy="45" r="12" fill="#78350f" />
          <circle cx="80" cy="45" r="12" fill="#78350f" />
          <circle cx="20" cy="45" r="7" fill="#fbcfe8" />
          <circle cx="80" cy="45" r="7" fill="#fbcfe8" />
          <circle cx="50" cy="50" r="35" fill="#78350f" />
          <ellipse cx="40" cy="52" rx="15" ry="18" fill="#fbcfe8" />
          <ellipse cx="60" cy="52" rx="15" ry="18" fill="#fbcfe8" />
          <ellipse cx="50" cy="62" rx="20" ry="15" fill="#fbcfe8" />
          <circle cx="42" cy="45" r="3" fill="#000" />
          <circle cx="58" cy="45" r="3" fill="#000" />
          <ellipse cx="50" cy="54" rx="3" ry="2" fill="#000" />
          <path d="M 42 63 Q 50 69 58 63" stroke="#000" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'rana':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="35" cy="30" r="12" fill="#22c55e" />
          <circle cx="65" cy="30" r="12" fill="#22c55e" />
          <circle cx="35" cy="30" r="8" fill="#fff" />
          <circle cx="65" cy="30" r="8" fill="#fff" />
          <circle cx="35" cy="30" r="4" fill="#000" />
          <circle cx="65" cy="30" r="4" fill="#000" />
          <ellipse cx="50" cy="55" rx="38" ry="28" fill="#22c55e" />
          <circle cx="24" cy="58" r="6" fill="#fda4af" />
          <circle cx="76" cy="58" r="6" fill="#fda4af" />
          <path d="M 36 62 Q 50 72 64 62" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'lobo':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <polygon points="25,35 20,10 40,30" fill="#64748b" />
          <polygon points="75,35 80,10 60,30" fill="#64748b" />
          <circle cx="50" cy="55" r="32" fill="#64748b" />
          <polygon points="20,55 10,65 30,65" fill="#475569" />
          <polygon points="80,55 90,65 70,65" fill="#475569" />
          <polygon points="45,55 55,55 50,78" fill="#475569" />
          <polygon points="34,46 44,48 40,42" fill="#eab308" />
          <polygon points="66,46 56,48 60,42" fill="#eab308" />
          <circle cx="39" cy="45" r="1.5" fill="#000" />
          <circle cx="61" cy="45" r="1.5" fill="#000" />
          <ellipse cx="50" cy="74" rx="4" ry="3" fill="#000" />
        </svg>
      );
    case 'pato':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="45" r="28" fill="#facc15" />
          <ellipse cx="42" cy="40" rx="3" ry="5" fill="#000" />
          <ellipse cx="58" cy="40" rx="3" ry="5" fill="#000" />
          <ellipse cx="50" cy="54" rx="14" ry="7" fill="#f97316" />
          <line x1="38" y1="54" x2="62" y2="54" stroke="#c2410c" strokeWidth="1.5" />
        </svg>
      );
    case 'vaca':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="45" r="30" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M 24 30 Q 30 25 35 32 Z" fill="#000" />
          <path d="M 70 30 Q 75 40 65 45 Z" fill="#000" />
          <ellipse cx="50" cy="60" rx="22" ry="12" fill="#fda4af" />
          <circle cx="43" cy="60" r="2.5" fill="#e11d48" />
          <circle cx="57" cy="60" r="2.5" fill="#e11d48" />
          <circle cx="38" cy="40" r="3.5" fill="#000" />
          <circle cx="62" cy="40" r="3.5" fill="#000" />
          <ellipse cx="16" cy="35" rx="8" ry="14" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(-30 16 35)" />
          <ellipse cx="84" cy="35" rx="8" ry="14" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(30 84 35)" />
        </svg>
      );
    case 'loro':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="45" r="28" fill="#22c55e" />
          <circle cx="40" cy="40" r="8" fill="#fff" />
          <circle cx="60" cy="40" r="8" fill="#fff" />
          <circle cx="40" cy="40" r="3.5" fill="#000" />
          <circle cx="60" cy="40" r="3.5" fill="#000" />
          <path d="M 45 48 Q 50 42 55 48 Q 50 68 45 48 Z" fill="#fb923c" />
          <path d="M 45 18 Q 50 5 55 18 Z" fill="#ef4444" />
        </svg>
      );
    case 'oso':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="24" cy="30" r="10" fill="#7c2d12" />
          <circle cx="76" cy="30" r="10" fill="#7c2d12" />
          <circle cx="24" cy="30" r="5" fill="#ffedd5" />
          <circle cx="76" cy="30" r="5" fill="#ffedd5" />
          <circle cx="50" cy="50" r="32" fill="#7c2d12" />
          <circle cx="38" cy="44" r="3" fill="#000" />
          <circle cx="62" cy="44" r="3" fill="#000" />
          <ellipse cx="50" cy="58" rx="14" ry="10" fill="#ffedd5" />
          <polygon points="46,54 54,54 50,59" fill="#000" />
          <path d="M 46 62 Q 50 65 54 62" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      );
    default:
      return null;
  }
};

const River = () => {
  return (
    <group>
      {/* Cosmic River */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 40]} />
        <meshLambertMaterial color="#1e1b4b" />
      </mesh>
      {/* Space docks / banks */}
      <mesh position={[-7, 0, 0]}>
        <boxGeometry args={[2, 0.5, 40]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      <mesh position={[7, 0, 0]}>
        <boxGeometry args={[2, 0.5, 40]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      {/* Cosmic beacons on banks */}
      {[-15, -10, -5, 0, 5, 10, 15].map(z => (
        <group key={z}>
          <mesh position={[-7, 0.8, z]}>
            <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
            <meshLambertMaterial color="#4f46e5" />
          </mesh>
          <mesh position={[-7, 1.5, z]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#d946ef" />
          </mesh>
          <mesh position={[7, 0.8, z]}>
            <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
            <meshLambertMaterial color="#4f46e5" />
          </mesh>
          <mesh position={[7, 1.5, z]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#d946ef" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Raft = (props) => {
  const { laneX } = filterProps(props);
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      const target = LANE_X[laneX];
      groupRef.current.position.x += (target - groupRef.current.position.x) * 0.15;
      groupRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  return (
    <group ref={groupRef} position={[LANE_X[laneX], 0.3, 6]}>
      {/* Raft Hoverboard */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.15, 1.5]} />
        <meshLambertMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.6, 0.1, 1.3]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* Space traveler */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshLambertMaterial color="#a855f7" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.1, 1.1, 0.22]}>
        <circleGeometry args={[0.06, 12]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
      <mesh position={[0.1, 1.1, 0.22]}>
        <circleGeometry args={[0.06, 12]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
    </group>
  );
};

const Log = (props) => {
  const { log } = filterProps(props);
  const groupRef = useRef();
  const meshGroupRef = useRef();
  useFrame((state) => {
    if (groupRef.current && log) {
      groupRef.current.position.z = log.z;
    }
    if (meshGroupRef.current && log) {
      meshGroupRef.current.rotation.x += log.isHazard ? 0.05 : 0.02;
    }
  });
  return (
    <group ref={groupRef} position={[LANE_X[log.lane], 0.3, log.z]}>
      {log.isHazard ? (
        <group ref={meshGroupRef}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshLambertMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color="#f43f5e" wireframe />
          </mesh>
        </group>
      ) : (
        <>
          <group ref={meshGroupRef}>
            {/* Space cylinder capsule */}
            <mesh castShadow>
              <cylinderGeometry args={[0.4, 0.4, 1.8, 12]} rotation={[0, 0, Math.PI / 2]} />
              <meshLambertMaterial color="#6366f1" />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.41, 0.41, 0.4, 12]} rotation={[0, 0, Math.PI / 2]} />
              <meshBasicMaterial color="#a855f7" />
            </mesh>
          </group>
          <Text position={[0, 1.0, 0]} fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {log.word}
          </Text>
        </>
      )}
    </group>
  );
};

const CameraController = () => {
  useFrame((state) => {
    state.camera.position.set(0, 7.5, 14.5);
    state.camera.lookAt(0, 1.2, 4.0);
  });
  return null;
};

const Game5_1River = ({ player, onFinish }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [roundIndex, setRoundIndex] = useState(0); // always 0 for 1 round per level
  const [lane, setLane] = useState(1);
  const [logs, setLogs] = useState([]);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [showHelpModal, setShowHelpModal] = useState(false);
  const logIdRef = useRef(0);
  const round = useMemo(() => LEVELS_ROUNDS[currentLevel - 1][roundIndex], [currentLevel, roundIndex]);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const logsRef = useRef([]);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'river',
          game_number: 7,
          level: 1,
        });
        setSessionId(res.data.id);
      } catch (e) {
        console.error('Error al iniciar sesión de juego:', e);
      }
    };
    startSession();
  }, [player]);

  const finishGame = async (correct, incorrect, total, finalScore, level = currentLevel) => {
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
    onFinish({ score: finalScore, level: level, sessionId });
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      if (gameState !== 'playing' || showHelpModal) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLane(l => Math.max(0, l - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setLane(l => Math.min(2, l + 1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, showHelpModal]);

  // Spawn obstacles / logs
  useEffect(() => {
    if (gameState !== 'playing' || showHelpModal) return;

    let lastWordSpawn = Date.now();
    let lastHazardSpawn = Date.now();

    const spawnWordRow = () => {
      const correctLane = Math.floor(Math.random() * 3);
      const newLogs = [];
      const shuffledOptions = [...round.correct, ...round.wrong];
      // We want to map correct and wrong words to lanes
      // correct is at correctLane
      // others are at wrong lanes
      let wrongIdx = 0;
      for (let i = 0; i < 3; i++) {
        const isCorrect = i === correctLane;
        const word = isCorrect ? round.correct[0] : round.wrong[wrongIdx++];
        newLogs.push({
          id: logIdRef.current++,
          lane: i,
          word,
          isCorrect,
          isHazard: false,
          z: -15,
          collided: false,
        });
      }
      setLogs(prev => [...prev, ...newLogs]);
      lastWordSpawn = Date.now();
      lastHazardSpawn = Date.now();
    };

    spawnWordRow();

    const tick = setInterval(() => {
      const now = Date.now();
      const hasWordLogs = logsRef.current.some(l => !l.isHazard);
      const timeSinceWord = now - lastWordSpawn;

      if (!hasWordLogs || timeSinceWord > 6500) {
        spawnWordRow();
      } else if (currentLevel >= 6) {
        const timeSinceHazard = now - lastHazardSpawn;
        const hazardInterval = 2500;

        if (timeSinceWord > 1800 && timeSinceWord < 5000 && timeSinceHazard > hazardInterval) {
          // Spawn exactly 1 red obstacle for 7yo difficulty
          const laneIdx = Math.floor(Math.random() * 3);
          const newHazard = {
            id: logIdRef.current++,
            lane: laneIdx,
            word: '',
            isCorrect: false,
            isHazard: true,
            z: -15,
            collided: false,
          };
          setLogs(prev => [...prev, newHazard]);
          lastHazardSpawn = now;
        }
      }
    }, 200);

    return () => {
      clearInterval(tick);
      setLogs([]);
    };
  }, [gameState, round, currentLevel, showHelpModal]);

  // Move logs and detect collision
  useEffect(() => {
    if (gameState !== 'playing' || showHelpModal) return;
    const tick = setInterval(() => {
      setLogs(prev => {
        const updated = [];
        for (const log of prev) {
          const newZ = log.z + 0.18;
          if (newZ > 7) continue; 
          
          if (newZ > 5.4 && newZ < 6.4 && !log.collided && log.lane === lane) {
            log.collided = true;
            
            if (log.isHazard) {
              const newIncorrectCount = incorrectCount + 1;
              setIncorrectCount(newIncorrectCount);
              setFeedback(`¡CUIDADO! Chocaste con un obstáculo espacial 🔴`);
              setTimeout(() => setFeedback(''), 1200);
              
              setLives(l => {
                const nl = l - 1;
                if (nl <= 0) {
                  setGameState('lost');
                  finishGame(correctCount, newIncorrectCount, correctCount + newIncorrectCount, correctCount * 100, currentLevel);
                }
                return nl;
              });
            } else if (log.isCorrect) {
              const newCorrectCount = correctCount + 1;
              setCorrectCount(newCorrectCount);
              setFeedback(`¡CORRECTO! Encontraste el animal: ${log.word} 🟢`);
              setTimeout(() => setFeedback(''), 1200);

              // Go to next level
              setTimeout(() => {
                setLogs([]); // clear logs
                if (currentLevel < 10) {
                  const nextLvl = currentLevel + 1;
                  setFeedback(`¡Nivel ${currentLevel} Completado! Siguiente nivel ${nextLvl}...`);
                  setTimeout(() => setFeedback(''), 2000);
                  setCurrentLevel(nextLvl);
                  setLives(3); // Refill lives
                } else {
                  setGameState('won');
                  finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, newCorrectCount * 150, 10);
                }
              }, 1200);
            } else {
              const newIncorrectCount = incorrectCount + 1;
              setIncorrectCount(newIncorrectCount);
              setFeedback(`¡ERROR! "${log.word}" no es correcto`);
              setTimeout(() => setFeedback(''), 1200);
              
              setLives(l => {
                const nl = l - 1;
                if (nl <= 0) {
                  setGameState('lost');
                  finishGame(correctCount, newIncorrectCount, correctCount + newIncorrectCount, correctCount * 100, currentLevel);
                }
                return nl;
              });
            }
            continue;
          }
          updated.push({ ...log, z: newZ });
        }
        return updated;
      });
    }, 50);
    return () => clearInterval(tick);
  }, [gameState, lane, round, correctCount, incorrectCount, currentLevel, showHelpModal]);

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <CameraController />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 15, 5]} intensity={0.8} castShadow />
          {/* Scaled 3D content by 1.3 */}
          <group scale={1.3}>
            <River />
            <Raft laneX={lane} />
            {logs.map(l => <Log key={l.id} log={l} />)}
          </group>
        </Suspense>
      </Canvas>

      {/* HUD (Glassmorphic) */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10 font-sans">
        <div className="text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Río Cósmico (7 Años)</div>
          <div className="text-base font-extrabold text-purple-300">Nivel: {currentLevel} / 10</div>
          <div className="text-xs text-emerald-400 font-medium">Puntaje Total: {correctCount * 150}</div>
          <div className="flex items-center gap-1 mt-1 text-xs">
            Vidas:{' '}
            <span className="text-rose-400 font-mono">
              {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
            </span>
          </div>
        </div>
      </div>

      {/* Animal Question panel */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-4 bg-slate-900/85 backdrop-blur-md border border-indigo-500/30 rounded-3xl text-white shadow-xl max-w-md w-[380px] text-center z-10 font-sans flex flex-col items-center gap-2">
        <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> {round.rule}
        </div>
        <div className="flex items-center gap-4 text-left w-full px-1">
          <div className="bg-slate-950/40 p-2.5 rounded-2xl border border-indigo-500/20 shadow-inner flex items-center justify-center min-w-[70px] min-h-[70px]">
            <AnimalSVG type={round.animalType} />
          </div>
          <div className="flex-1 text-xs text-indigo-100 font-medium leading-relaxed">
            {round.desc}
          </div>
        </div>
      </div>

      {/* Help Button */}
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

      {/* Touch controls / Arrows */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-4 pointer-events-auto font-sans">
        <button
          onClick={() => setLane(l => Math.max(0, l - 1))}
          className="p-4 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 text-white font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl active:bg-indigo-600/35 cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft className="w-6 h-6 text-purple-300" /> Izquierda
        </button>
        <button
          onClick={() => setLane(l => Math.min(2, l + 1))}
          className="p-4 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 text-white font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl active:bg-indigo-600/35 cursor-pointer flex items-center gap-1"
        >
          Derecha <ChevronRight className="w-6 h-6 text-purple-300" />
        </button>
      </div>

      {/* Action feedback popup */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl z-20 text-white font-sans text-lg font-bold shadow-2xl text-center select-none animate-pulse">
          {feedback}
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
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Río Cósmico?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Esquiva los obstáculos del río espacial y atrapa el nombre del animal que corresponde a la adivinanza y el dibujo de arriba.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Lee la <b>adivinanza</b> y observa el <b>dibujo</b> del animal arriba.</li>
                  <li>Usa las teclas de flecha <b>Izquierda/Derecha</b>, las letras <b>A/D</b> o los botones abajo para mover tu balsa.</li>
                  <li>Choca contra el tronco flotante que tenga el nombre correcto del animal (ej. si sale el dibujo de un perro, atrapa <i>PERRO</i>).</li>
                  <li>Evita chocar contra los nombres parecidos incorrectos (ej. <i>BERRO</i>).</li>
                  <li><b>A partir del Nivel 6</b>, esquiva los obstáculos rojos de peligro.</li>
                  <li>Supera los 10 niveles de animales para ganar.</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-12 h-6 bg-indigo-600 border border-purple-400 rounded flex items-center justify-center text-[9px] font-black text-white shadow">PERRO</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡CORRECTO! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Si recoges el nombre correcto, pasas al siguiente nivel.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-12 h-6 bg-indigo-600 border border-purple-400 rounded flex items-center justify-center text-[9px] font-black text-white shadow">BERRO</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡INCORRECTO! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si recoges un nombre incorrecto, perderás una de tus vidas.</p>
                  </div>
                </div>

                {/* Visual indicator of hazard */}
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5">
                  <div className="w-12 h-6 bg-red-600 rounded-xl border border-red-400 flex items-center justify-center text-[8px] font-black text-white shadow">PELIGRO</div>
                  <div className="text-xs">
                    <strong className="text-red-400 text-xs">¡ESQUIVAR! ⚠️</strong>
                    <p className="text-[10px] text-gray-300">A partir del Nivel 6 aparecerán obstáculos rojos que debes esquivar.</p>
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

export default Game5_1River;
