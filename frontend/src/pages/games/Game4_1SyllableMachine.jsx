import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Settings, Play, Info, HelpCircle } from 'lucide-react';
import api from '../../services/api';

// SVG drawings for 7-year-olds
const DrawingSVG = ({ type }) => {
  const normType = type.toLowerCase()
    .replace('é', 'e')
    .replace('í', 'i')
    .replace('ó', 'o')
    .replace('á', 'a')
    .replace('ú', 'u');

  switch (normType) {
    case 'perro':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16">
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
    case 'mono':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="45" r="28" fill="#facc15" />
          <ellipse cx="42" cy="40" rx="3" ry="5" fill="#000" />
          <ellipse cx="58" cy="40" rx="3" ry="5" fill="#000" />
          <ellipse cx="50" cy="54" rx="14" ry="7" fill="#f97316" />
          <line x1="38" y1="54" x2="62" y2="54" stroke="#c2410c" strokeWidth="1.5" />
        </svg>
      );
    case 'vaca':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="45" r="28" fill="#22c55e" />
          <ellipse cx="40" cy="40" rx="3.5" ry="5.5" fill="#fff" />
          <ellipse cx="60" cy="40" rx="3.5" ry="5.5" fill="#fff" />
          <circle cx="40" cy="40" r="2" fill="#000" />
          <circle cx="60" cy="40" r="2" fill="#000" />
          <polygon points="46,48 54,48 50,65" fill="#f59e0b" />
          <path d="M 22 40 C 15 50 18 65 24 70" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 78 40 C 85 50 82 65 76 70" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'oso':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="25" cy="30" r="10" fill="#7c2d12" />
          <circle cx="75" cy="30" r="10" fill="#7c2d12" />
          <circle cx="25" cy="30" r="5" fill="#ffedd5" />
          <circle cx="75" cy="30" r="5" fill="#ffedd5" />
          <circle cx="50" cy="52" r="32" fill="#7c2d12" />
          <ellipse cx="50" cy="62" rx="14" ry="10" fill="#ffedd5" />
          <circle cx="38" cy="46" r="3.5" fill="#000" />
          <circle cx="62" cy="46" r="3.5" fill="#000" />
          <ellipse cx="50" cy="58" rx="3.5" ry="2.5" fill="#000" />
        </svg>
      );
    case 'sol':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="22" fill="#f59e0b" />
          <circle cx="50" cy="50" r="16" fill="#eab308" />
          <path d="M 50 10 L 50 22 M 50 78 L 50 90 M 10 50 L 22 50 M 78 50 L 90 50 M 22 22 L 31 31 M 69 69 L 78 78 M 22 69 L 31 60 M 69 22 L 60 31" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'pez':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <path d="M 15 50 Q 45 20 80 50 Q 45 80 15 50 Z" fill="#fb923c" />
          <polygon points="15,50 5,35 5,65" fill="#f97316" />
          <circle cx="68" cy="45" r="3" fill="#000" />
          <path d="M 72 52 Q 68 55 64 52" stroke="#fff" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'casa':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <polygon points="50,15 15,45 85,45" fill="#ef4444" />
          <rect x="25" y="45" width="50" height="40" fill="#fcd34d" />
          <rect x="42" y="58" width="16" height="27" fill="#b45309" />
          <rect x="30" y="50" width="12" height="12" fill="#38bdf8" />
          <rect x="58" y="50" width="12" height="12" fill="#38bdf8" />
        </svg>
      );
    case 'luna':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <path d="M 65 20 A 35 35 0 1 0 65 90 A 28 28 0 1 1 65 20" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
          <circle cx="42" cy="45" r="2.5" fill="#ca8a04" />
          <path d="M 38 56 Q 44 60 40 52" stroke="#ca8a04" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'flor':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="32" r="14" fill="#ec4899" />
          <circle cx="50" cy="68" r="14" fill="#ec4899" />
          <circle cx="32" cy="50" r="14" fill="#ec4899" />
          <circle cx="68" cy="50" r="14" fill="#ec4899" />
          <circle cx="37" cy="37" r="14" fill="#ec4899" />
          <circle cx="63" cy="63" r="14" fill="#ec4899" />
          <circle cx="37" cy="63" r="14" fill="#ec4899" />
          <circle cx="63" cy="37" r="14" fill="#ec4899" />
          <circle cx="50" cy="50" r="14" fill="#eab308" />
        </svg>
      );
    case 'coche':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <path d="M 15 65 L 15 50 Q 15 45 25 45 L 35 45 Q 40 30 50 30 L 75 30 Q 85 30 85 45 L 85 65 Z" fill="#3b82f6" />
          <rect x="25" y="48" width="55" height="17" fill="#2563eb" />
          <polygon points="38,45 42,34 52,34 52,45" fill="#cbd5e1" />
          <rect x="56" y="34" width="22" height="11" fill="#cbd5e1" />
          <circle cx="32" cy="70" r="12" fill="#1e293b" />
          <circle cx="32" cy="70" r="5" fill="#94a3b8" />
          <circle cx="68" cy="70" r="12" fill="#1e293b" />
          <circle cx="68" cy="70" r="5" fill="#94a3b8" />
        </svg>
      );
    default:
      return null;
  }
};

// Word recipes grouped by 6 levels (3 words per level) - Adapted for 7-year-olds
const LEVELS_RECIPES = [
  // Level 1: Very Easy (2 parts)
  [
    { parts: ['CA', 'SA'], full: 'CASA', meaning: '¿En dónde vives bonito con toda tu familia?' },
    { parts: ['MO', 'NO'], full: 'MONO', meaning: '¿Qué animal travieso come plátanos y salta en los árboles?' },
    { parts: ['PA', 'TO'], full: 'PATO', meaning: 'Ave con plumas que nada y hace cua-cua' },
  ],
  // Level 2: Easy (2 parts)
  [
    { parts: ['GA', 'TO'], full: 'GATO', meaning: 'Mascota muy suave que hace miau y ronronea' },
    { parts: ['LU', 'NA'], full: 'LUNA', meaning: '¿Qué brilla en el cielo oscuro cuando nos vamos a dormir?' },
    { parts: ['O', 'SO'], full: 'OSO', meaning: 'Animal grande y peludo que duerme en invierno' },
  ],
  // Level 3: Medium (2 parts)
  [
    { parts: ['RA', 'NA'], full: 'RANA', meaning: 'Animalito verde que salta y canta cruac-cruac' },
    { parts: ['LO', 'BO'], full: 'LOBO', meaning: 'Animal salvaje del bosque que aúlla a la luna' },
    { parts: ['LO', 'RO'], full: 'LORO', meaning: 'Ave de plumas verdes que repite tus palabras' },
  ],
  // Level 4: Medium-Hard (2 parts)
  [
    { parts: ['CO', 'CHE'], full: 'COCHE', meaning: 'Vehículo para pasear con ruedas y motor' },
    { parts: ['VA', 'CA'], full: 'VACA', meaning: 'Animal del campo que da leche y hace muuu' },
    { parts: ['PE', 'RRO'], full: 'PERRO', meaning: 'Tu fiel amigo peludo que ladra y hace guau' },
  ],
  // Level 5: Hard (3 parts, empty slots, simple 3-syllable words)
  [
    { parts: ['PE', 'LO', 'TA'], full: 'PELOTA', meaning: 'Juguete redondo que rueda y usamos para jugar al fútbol' },
    { parts: ['ZA', 'PA', 'TO'], full: 'ZAPATO', meaning: 'Prenda que nos ponemos en los pies para salir a correr' },
    { parts: ['TO', 'MA', 'TE'], full: 'TOMATE', meaning: 'Verdura roja, redonda y muy rica en las ensaladas' },
  ],
  // Level 6: Very Hard (3 parts, empty slots, simple 3-syllable words)
  [
    { parts: ['CA', 'MI', 'SA'], full: 'CAMISA', meaning: 'Prenda de vestir con botones y mangas largas' },
    { parts: ['PA', 'JA', 'RO'], full: 'PÁJARO', meaning: 'Animalito con plumas que canta por las mañanas' },
    { parts: ['CO', 'CI', 'NA'], full: 'COCINA', meaning: 'El lugar de la casa donde se prepara la comida deliciosa' },
  ],
];

const getWordForLevel = (level, recipeIdx) => {
  return LEVELS_RECIPES[level - 1][recipeIdx];
};

const getPrefixPool = (level) => {
  const current = LEVELS_RECIPES[level - 1].map(r => r.parts[0]);
  const others = LEVELS_RECIPES.filter((_, idx) => idx !== level - 1).flatMap(l => l.map(r => r.parts[0]));
  const uniqueOthers = [...new Set(others)].filter(p => !current.includes(p));
  const selectedOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...new Set([...current, ...selectedOthers])];
};

const getSuffixPool = (level) => {
  const lastIndex = LEVELS_RECIPES[level - 1][0].parts.length - 1;
  const current = LEVELS_RECIPES[level - 1].map(r => r.parts[lastIndex]);
  const others = LEVELS_RECIPES.filter((_, idx) => idx !== level - 1).flatMap(l => l.map(r => r.parts[r.parts.length - 1]));
  const uniqueOthers = [...new Set(others)].filter(s => !current.includes(s));
  const selectedOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...new Set([...current, ...selectedOthers])];
};

const isPartPink = (partsCount, partIndex) => {
  if (partsCount === 2) {
    return partIndex === 0;
  }
  return partIndex === 0 || partIndex === 1;
};

const LEVEL_WIN_SCORE = 3; // 3 matches per level
const MAX_FAILS = 10; // 10 failures max before Game Over

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const ConveyorBelt = () => {
  return (
    <group>
      {/* Belt 1 (Rear lane, Pink channel - Left to Right) */}
      <mesh position={[0, 0, -0.8]} receiveShadow>
        <boxGeometry args={[16, 0.2, 1.0]} />
        <meshLambertMaterial color="#312e81" />
      </mesh>
      {/* Rollers Belt 1 */}
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
        <mesh key={`r1-${i}`} position={[x, -0.1, -0.8]}>
          <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
          <meshLambertMaterial color="#4f46e5" />
        </mesh>
      ))}
      {/* Left Tube (shoots Prefix / Parts 1 & 2) */}
      <mesh position={[-8, 2.5, -0.8]}>
        <cylinderGeometry args={[0.7, 0.7, 2.0, 16]} />
        <meshLambertMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.2} />
      </mesh>

      {/* Belt 2 (Front lane, Cyan channel - Right to Left) */}
      <mesh position={[0, 0, 0.8]} receiveShadow>
        <boxGeometry args={[16, 0.2, 1.0]} />
        <meshLambertMaterial color="#1e1b4b" />
      </mesh>
      {/* Rollers Belt 2 */}
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
        <mesh key={`r2-${i}`} position={[x, -0.1, 0.8]}>
          <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
          <meshLambertMaterial color="#4f46e5" />
        </mesh>
      ))}
      {/* Right Tube (shoots Suffix / Part 3) */}
      <mesh position={[8, 2.5, 0.8]}>
        <cylinderGeometry args={[0.7, 0.7, 2.0, 16]} />
        <meshLambertMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.2} />
      </mesh>

      {/* Factory floor */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[24, 0.2, 10]} />
        <meshLambertMaterial color="#0b0f19" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 3, -5]}>
        <boxGeometry args={[24, 8, 0.4]} />
        <meshLambertMaterial color="#111827" />
      </mesh>
    </group>
  );
};

const SyllableBlock = (props) => {
  const { block, isSelected, onClick } = filterProps(props);
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current && block) {
      groupRef.current.position.x = block.x;
      groupRef.current.position.z = block.z;
      groupRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 4 + block.id) * 0.05;
    }
  });

  const color = isSelected ? '#10b981' : (block.colorType === 'pink' ? '#f43f5e' : '#06b6d4');

  return (
    <group ref={groupRef} position={[block.x, 0.6, block.z]} onClick={(e) => { e.stopPropagation(); onClick(block); }}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.8, 0.8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <Text position={[0, 0, 0.42]} fontSize={0.26} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
        {block.text}
      </Text>
    </group>
  );
};

const Game4_1SyllableMachine = ({ player, onFinish }) => {

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
  const [recipeIndex, setRecipeIndex] = useState(0); // Index of recipe in current level (0, 1, 2)
  const [levelScore, setLevelScore] = useState(0); // Scores in current level
  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]); // Tracks correctly selected blocks for current word
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [jamUntil, setJamUntil] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const blockIdRef = useRef(0);
  const recipe = useMemo(() => getWordForLevel(currentLevel, recipeIndex), [currentLevel, recipeIndex]);

  const selectedBlocksRef = useRef([]);
  useEffect(() => {
    selectedBlocksRef.current = selectedBlocks;
  }, [selectedBlocks]);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'machine',
          game_number: 6,
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

  // Spawn blocks on the two parallel conveyor belts
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawn = () => {
      if (Date.now() < jamUntil) return;
      setBlocks(prev => {
        if (prev.length >= 8) return prev;

        const isThreeParts = recipe.parts.length === 3;
        const spawnOnBelt1 = Math.random() < 0.5;

        const currentStep = selectedBlocksRef.current.length;
        const neededPart = currentStep < recipe.parts.length ? recipe.parts[currentStep] : null;

        if (spawnOnBelt1) {
          // Belt 1: Pink blocks (Prefix/Root) traveling Left to Right (x starts at -8)
          const isTooClose = prev.some(b => b.z === -0.8 && b.x < -5.0);
          if (isTooClose) return prev;

          const prefixPool = getPrefixPool(currentLevel);
          let pool = prefixPool;
          if (isThreeParts) {
            const rootPool = LEVELS_RECIPES[currentLevel - 1].map(r => r.parts[1]);
            pool = [...prefixPool, ...rootPool];
          }

          let text = "";
          const needsPink = neededPart ? isPartPink(recipe.parts.length, currentStep) : false;

          if (needsPink && neededPart && Math.random() < 0.65) {
            text = neededPart;
          } else {
            text = pool[Math.floor(Math.random() * pool.length)];
          }

          return [...prev, {
            id: blockIdRef.current++,
            text,
            z: -0.8,
            colorType: 'pink',
            x: -8,
            spawnTime: Date.now(),
          }];
        } else {
          // Belt 2: Cyan blocks (Suffix) traveling Right to Left (x starts at 8)
          const isTooClose = prev.some(b => b.z === 0.8 && b.x > 5.0);
          if (isTooClose) return prev;

          const suffixPool = getSuffixPool(currentLevel);

          let text = "";
          const needsCyan = neededPart ? !isPartPink(recipe.parts.length, currentStep) : false;

          if (needsCyan && neededPart && Math.random() < 0.65) {
            text = neededPart;
          } else {
            text = suffixPool[Math.floor(Math.random() * suffixPool.length)];
          }

          return [...prev, {
            id: blockIdRef.current++,
            text,
            z: 0.8,
            colorType: 'cyan',
            x: 8,
            spawnTime: Date.now(),
          }];
        }
      });
    };
    const interval = setInterval(spawn, 1200);
    return () => clearInterval(interval);
  }, [gameState, jamUntil, currentLevel, recipe]);

  // Move blocks along their respective lanes in opposite directions
  useEffect(() => {
    if (gameState !== 'playing') return;
    const tick = setInterval(() => {
      if (Date.now() < jamUntil) return;
      setBlocks(prev => prev
        .map(b => {
          if (b.z === -0.8) {
            return { ...b, x: b.x + 0.05 }; // Belt 1 moves Left -> Right
          } else {
            return { ...b, x: b.x - 0.05 }; // Belt 2 moves Right -> Left
          }
        })
        .filter(b => {
          if (b.z === -0.8) {
            return b.x < 8.2;
          } else {
            return b.x > -8.2;
          }
        })
      );
    }, 50);
    return () => clearInterval(tick);
  }, [gameState, jamUntil]);

  const handleBlockClick = (block) => {
    if (Date.now() < jamUntil) return;

    const recipeParts = recipe.parts;
    const currentStep = selectedBlocks.length; // 0, 1, or 2

    if (block.text === recipeParts[currentStep]) {
      const nextBlocks = [...selectedBlocks, block];
      setSelectedBlocks(nextBlocks);
      setBlocks(prev => prev.filter(b => b.id !== block.id));
      
      if (nextBlocks.length === recipeParts.length) {
        const newLevelScore = levelScore + 1;
        const newCorrectCount = correctCount + 1;
        setLevelScore(newLevelScore);
        setCorrectCount(newCorrectCount);
      playCorrectSound();;
      playCorrectSound();
        setFeedback(`¡EXCELENTE! ${recipeParts.join(' + ')} = ${recipe.full}`);
        
        setTimeout(() => {
          setSelectedBlocks([]);
          setFeedback('');
          
          if (newLevelScore >= LEVEL_WIN_SCORE) {
            if (currentLevel < 6) {
              const nextLvl = currentLevel + 1;
              setFeedback(`¡Nivel ${currentLevel} Completado! Siguiente nivel ${nextLvl}...`);
              setTimeout(() => setFeedback(''), 2000);
              setCurrentLevel(nextLvl);
              setLevelScore(0);
              setRecipeIndex(0);
              setBlocks([]);
            } else {
              setGameState('won');
              finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, newCorrectCount * 200, 6);
            }
          } else {
            setRecipeIndex(prev => prev + 1);
          }
        }, 2000);
      } else {
        setFeedback(`¡Muy bien! "${block.text}" colocado. Sigue con la siguiente sílaba.`);
        setTimeout(() => setFeedback(''), 1500);
      }
    } else {
      handleIncorrectClick();
    }
  };

  const handleIncorrectClick = () => {
    const newIncorrectCount = incorrectCount + 1;
    setIncorrectCount(newIncorrectCount);
    setFeedback('¡ERROR! Banda atascada por 3 segundos');
    setJamUntil(Date.now() + 3000);
    setSelectedBlocks([]); // Reset selection for this word attempt

    if (newIncorrectCount >= MAX_FAILS) {
      setGameState('lost');
      finishGame(correctCount, newIncorrectCount, correctCount + newIncorrectCount, correctCount * 100, currentLevel);
    }

    setTimeout(() => {
      setFeedback('');
    }, 2000);
  };

  const restart = () => {
    setCurrentLevel(1);
    setLevelScore(0);
    setRecipeIndex(0);
    setBlocks([]);
    setSelectedBlocks([]);
    setGameState('playing');
    setFeedback('');
    setJamUntil(0);
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 6.5, 9.5]} fov={55} />
          <OrbitControls enablePan={false} minDistance={6} maxDistance={15} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
          <ConveyorBelt />
          {blocks.map(b => (
            <SyllableBlock
              key={b.id}
              block={b}
              isSelected={selectedBlocks.some(sel => sel.id === b.id)}
              onClick={handleBlockClick}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* HUD (Glassmorphic) */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10 font-sans">
        <div className="text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Fábrica de Sílabas (7 años)</div>
          <div className="text-base font-extrabold text-cyan-300">Nivel: {currentLevel} / 6</div>
          <div className="text-sm font-semibold text-indigo-300">Progreso Nivel: {levelScore} / {LEVEL_WIN_SCORE}</div>
          <div className="text-xs text-emerald-400 font-medium">Puntaje Total: {correctCount * 200}</div>
          <div className="text-xs text-rose-400 font-bold">Errores: {incorrectCount} / {MAX_FAILS}</div>
          <div className="text-[11px] text-gray-300 mt-1">
            {selectedBlocks.length > 0 ? (
              <span>Armando: {selectedBlocks.map(b => b.text).join(' + ')}</span>
            ) : (
              <span>Elige una sílaba para armar la palabra</span>
            )}
          </div>
        </div>
      </div>

      {/* Hints HUD */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-sm text-center z-10">
        <div className="font-sans text-sm flex flex-col items-center">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> PALABRA A ARMAR
          </div>
          
          {/* Level 1-4 Drawing Help */}
          {recipe.parts.length === 2 && (
            <div className="my-2 bg-slate-950/60 p-3 rounded-2xl border border-indigo-500/20 flex items-center justify-center shadow-inner">
              <DrawingSVG type={recipe.full} />
            </div>
          )}

          <div className="text-indigo-200 font-bold mb-1 text-sm">
            {recipe.parts.length === 2 ? (
              <>
                Arma: <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 1 ? selectedBlocks[0].text : '¿?'}</span> + <span className="text-cyan-400 font-black">{selectedBlocks.length >= 2 ? selectedBlocks[1].text : '¿?'}</span>
              </>
            ) : (
              <>
                Arma: <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 1 ? selectedBlocks[0].text : '¿?'}</span> + <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 2 ? selectedBlocks[1].text : '¿?'}</span> + <span className="text-cyan-400 font-black">{selectedBlocks.length >= 3 ? selectedBlocks[2].text : '¿?'}</span>
              </>
            )}
          </div>
          
          <div className="text-[11px] text-yellow-300 font-bold leading-normal max-w-xs mt-1">
            Pista: "{recipe.meaning}"
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
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 200, currentLevel)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Feedback floating alert */}
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
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar a la Máquina de Sílabas?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Elige y combina las sílabas correctas para formar la palabra descrita en la pista central de la pantalla.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Mira el dibujo de ayuda y lee la pista (ej. El dibujo de una <b>CASA</b>).</li>
                  <li>Selecciona las dos sílabas correspondientes (ej: <b>CA</b> en la banda de atrás y luego <b>SA</b> en la banda de adelante).</li>
                  <li>Las sílabas de atrás <b>Rosas</b> van de izquierda a derecha.</li>
                  <li>Las sílabas de adelante <b>Azules</b> van de derecha a izquierda.</li>
                  <li>En los niveles 5 y 6, debes armar palabras de 3 sílabas en orden guiándote por la pista de texto.</li>
                  <li>¡No te equivoques más de 10 veces!</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-8 h-6 bg-emerald-500 rounded flex items-center justify-center text-[10px] font-black text-white">CA</div>
                    <div className="w-8 h-6 bg-emerald-500 rounded flex items-center justify-center text-[10px] font-black text-white">SA</div>
                  </div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs animate-pulse">¡CORRECTO! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Si lo haces bien, sumas progreso.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-8 h-6 bg-rose-500 rounded flex items-center justify-center text-[10px] font-black text-white">BO</div>
                    <div className="w-8 h-6 bg-cyan-500 rounded flex items-center justify-center text-[10px] font-black text-white">SA</div>
                  </div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs animate-pulse">¡INCORRECTO! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si te equivocas, la máquina se detiene 3 segundos.</p>
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

export default Game4_1SyllableMachine;
