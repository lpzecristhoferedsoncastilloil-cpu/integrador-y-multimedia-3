import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Info, RefreshCw, Trophy, HelpCircle, Heart, Check } from 'lucide-react';
import api from '../../services/api';

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
        <svg viewBox="0 0 100 100" className="w-14 h-14">
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
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="22" fill="#f59e0b" />
          <circle cx="50" cy="50" r="16" fill="#eab308" />
          <path d="M 50 10 L 50 22 M 50 78 L 50 90 M 10 50 L 22 50 M 78 50 L 90 50 M 22 22 L 31 31 M 69 69 L 78 78 M 22 69 L 31 60 M 69 22 L 60 31" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'pez':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <path d="M 15 50 Q 45 20 80 50 Q 45 80 15 50 Z" fill="#fb923c" />
          <polygon points="15,50 5,35 5,65" fill="#f97316" />
          <circle cx="68" cy="45" r="3" fill="#000" />
          <path d="M 72 52 Q 68 55 64 52" stroke="#fff" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'casa':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <polygon points="50,15 15,45 85,45" fill="#ef4444" />
          <rect x="25" y="45" width="50" height="40" fill="#fcd34d" />
          <rect x="42" y="58" width="16" height="27" fill="#b45309" />
          <rect x="30" y="50" width="12" height="12" fill="#38bdf8" />
          <rect x="58" y="50" width="12" height="12" fill="#38bdf8" />
        </svg>
      );
    case 'luna':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <path d="M 65 20 A 35 35 0 1 0 65 90 A 28 28 0 1 1 65 20" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
          <circle cx="42" cy="45" r="2.5" fill="#ca8a04" />
          <path d="M 38 56 Q 44 60 40 52" stroke="#ca8a04" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'flor':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
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
        <svg viewBox="0 0 100 100" className="w-14 h-14">
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

const LEVELS_ROUNDS = [
  // Level 1: 8x8 grid, 3 words
  [
    { words: ['PERRO', 'GATO', 'SOL'] },
    { words: ['PATO', 'RANA', 'LUNA'] },
    { words: ['OSO', 'LORO', 'CASA'] }
  ],
  // Level 2: 8x8 grid, 3 words
  [
    { words: ['MONO', 'VACA', 'FLOR'] },
    { words: ['PEZ', 'COCHE', 'LOBO'] },
    { words: ['LEÓN', 'SOL', 'PERRO'] }
  ],
  // Level 3: 9x9 grid, 3 words
  [
    { words: ['GATO', 'PATO', 'CASA'] },
    { words: ['RANA', 'OSO', 'LUNA'] },
    { words: ['LORO', 'MONO', 'FLOR'] }
  ],
  // Level 4: 9x9 grid, 3 words
  [
    { words: ['VACA', 'PEZ', 'COCHE'] },
    { words: ['LOBO', 'LEÓN', 'SOL'] },
    { words: ['PERRO', 'GATO', 'PATO'] }
  ],
  // Level 5: 10x10 grid, 4 words
  [
    { words: ['RANA', 'OSO', 'LORO', 'CASA'] },
    { words: ['MONO', 'VACA', 'FLOR', 'LUNA'] },
    { words: ['PEZ', 'COCHE', 'LOBO', 'SOL'] }
  ],
  // Level 6: 10x10 grid, 4 words
  [
    { words: ['LEÓN', 'PERRO', 'GATO', 'PATO'] },
    { words: ['RANA', 'OSO', 'LORO', 'CASA'] },
    { words: ['MONO', 'VACA', 'FLOR', 'LUNA'] }
  ],
  // Level 7: 11x11 grid, 4 words
  [
    { words: ['PEZ', 'COCHE', 'LOBO', 'SOL'] },
    { words: ['LEÓN', 'PERRO', 'GATO', 'PATO'] },
    { words: ['RANA', 'OSO', 'LORO', 'CASA'] }
  ],
  // Level 8: 11x11 grid, 4 words
  [
    { words: ['MONO', 'VACA', 'FLOR', 'LUNA'] },
    { words: ['PEZ', 'COCHE', 'LOBO', 'SOL'] },
    { words: ['LEÓN', 'PERRO', 'GATO', 'PATO'] }
  ],
  // Level 9: 12x12 grid, 5 words
  [
    { words: ['RANA', 'OSO', 'LORO', 'CASA', 'MONO'] },
    { words: ['VACA', 'FLOR', 'LUNA', 'PEZ', 'COCHE'] },
    { words: ['LOBO', 'SOL', 'LEÓN', 'PERRO', 'GATO'] }
  ],
  // Level 10: 12x12 grid, 5 words
  [
    { words: ['PATO', 'RANA', 'OSO', 'LORO', 'CASA'] },
    { words: ['MONO', 'VACA', 'FLOR', 'LUNA', 'PEZ'] },
    { words: ['COCHE', 'LOBO', 'SOL', 'LEÓN', 'PERRO'] }
  ]
];

const buildGrid = (words, gridSize) => {
  let attemptsOuter = 0;
  while (attemptsOuter < 10) {
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const placedWords = [];
    let allTargetsPlaced = true;

    for (const item of words) {
      let placed = false;
      for (let attempt = 0; attempt < 150 && !placed; attempt++) {
        const horizontal = Math.random() < 0.5;
        const len = item.length;
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
            grid[rr][cc] = item[i];
            positions.push([rr, cc]);
          }
          placedWords.push({ word: item, positions, direction: horizontal ? 'H' : 'V' });
          placed = true;
        }
      }
      if (!placed) {
        allTargetsPlaced = false;
        break; // retry grid building
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
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[30, 0.1, 20]} />
        <meshLambertMaterial color="#0b0f19" />
      </mesh>
      <mesh position={[0, 4, -8]}>
        <boxGeometry args={[30, 8, 0.4]} />
        <meshLambertMaterial color="#1e1b4b" />
      </mesh>
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

const Game6_1Warehouse = ({ player, onFinish }) => {

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
  const [lives, setLives] = useState(5);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const round = useMemo(() => LEVELS_ROUNDS[currentLevel - 1][roundIndex], [currentLevel, roundIndex]);
  
  const gridSize = useMemo(() => {
    if (currentLevel <= 2) return 8;
    if (currentLevel <= 4) return 9;
    if (currentLevel <= 6) return 10;
    if (currentLevel <= 8) return 11;
    return 12;
  }, [currentLevel]);

  const [gridData, setGridData] = useState(() => buildGrid(LEVELS_ROUNDS[0][0].words, 8));

  useEffect(() => {
    setGridData(buildGrid(round.words, gridSize));
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
      !foundWords.has(pw.word) &&
      (pw.word === word || pw.word === reversed) &&
      selectedCells.length === pw.word.length &&
      selectedCells.every(([r, c]) => pw.positions.some(([pr, pc]) => pr === r && pc === c))
    );

    const currentCellsCopy = [...selectedCells];

    if (matchTarget) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      playCorrectSound();;
      playCorrectSound();
      const newFound = new Set([...foundWords, matchTarget.word]);
      setFoundWords(newFound);
      setFeedback(`¡CORRECTO! Encontraste "${matchTarget.word}" 🟢`);
      
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
              setLives(5); // Reset lives on every level for 7yo version
            } else {
              setGameState('won');
              finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, newCorrectCount * 250, 10);
            }
          }
        }, 800);
      }
    } else {
      const newIncorrectCount = incorrectCount + 1;
      setIncorrectCount(newIncorrectCount);
      setFeedback('Intenta de nuevo 🔴');
      
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
    setLives(5);
  };

  const isInSelection = (r, c) => selectedCells.some(([sr, sc]) => sr === r && sc === c);
  const isFoundCell = (r, c) => gridData.placedWords.some(pw => 
    foundWords.has(pw.word) && pw.positions.some(([pr, pc]) => pr === r && pc === c)
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
            <div className="text-base font-extrabold text-cyan-300">Nivel: {currentLevel} / 10</div>
            <div className="text-xs font-semibold text-indigo-300">Mini-nivel: {roundIndex + 1} / 3</div>
            <div className="text-xs text-emerald-400">Encontradas: {foundWords.size} / {round.words.length}</div>
            
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-400 font-extrabold">
              <span>Vidas:</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Heart key={i} className={`w-4 h-4 ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Objective Panel */}
          <div className="p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl text-center flex flex-col gap-2">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Tu Objetivo</div>
            <div className="text-xl font-black text-yellow-400">BUSCA DIBUJOS</div>
            <div className="text-[11px] text-indigo-200 flex items-center justify-center gap-1 mt-1.5 font-medium leading-relaxed">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> ¡Busca los dibujos de la derecha!
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

        {/* Right Column: Drawings List */}
        <div className="flex flex-col gap-4 w-[220px] pointer-events-auto h-full">
          <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl flex flex-col items-center h-full overflow-y-auto scrollbar-none">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-3 text-center">Encuentra estos dibujos</div>
            <div className="flex flex-col gap-3.5 w-full items-center">
              {round.words.map(w => {
                const found = foundWords.has(w);
                return (
                  <div
                    key={w}
                    className={`flex flex-col items-center p-2.5 rounded-xl border transition-all duration-300 relative w-full ${
                      found
                        ? 'bg-emerald-500/10 border-emerald-500/40 opacity-70 scale-95'
                        : 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 scale-100'
                    }`}
                  >
                    <div className="w-14 h-14 flex items-center justify-center bg-slate-950/40 rounded-lg mb-1 relative overflow-hidden">
                      <DrawingSVG type={w} />
                      {found && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-8 h-8 text-emerald-400 drop-shadow" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-black tracking-wider ${found ? 'text-emerald-400 line-through' : 'text-indigo-200'}`}>
                      {w}
                    </span>
                  </div>
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
                <span className="text-gray-400">Dibujos encontrados:</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
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
                <span className="text-gray-400">Dibujos correctos:</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
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
                Busca y selecciona las palabras ocultas en la sopa de letras correspondientes a los dibujos que ves en la lista de la derecha.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Mira los <b>dibujos objetivos</b> que aparecen en las tarjetas de la derecha.</li>
                  <li>Busca el nombre de cada dibujo en la sopa de letras (pueden estar en horizontal o vertical).</li>
                  <li>Haz <b>clic y arrastra</b> sobre las letras para pintar la palabra.</li>
                  <li>Tienes <b>5 vidas</b> por nivel. Si fallas una palabra perderás una vida, pero ¡se recargan al pasar de nivel!</li>
                  <li>Supera los 10 niveles (con 3 rondas cada uno) para ganar el trofeo final.</li>
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

export default Game6_1Warehouse;
