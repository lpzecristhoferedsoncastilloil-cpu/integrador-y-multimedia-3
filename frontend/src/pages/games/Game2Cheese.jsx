import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Billboard } from '@react-three/drei';
import api from '../../services/api';
import { HelpCircle } from 'lucide-react';

const ROUNDS = [
  {
    keyword: 'CASA',
    rule: 'Palabras que RIMAN con CASA',
    correct: ['MASA', 'PASA', 'TASA', 'BRASA', 'GRASA'],
    incorrect: ['PERRO', 'GATO', 'SOL', 'LUNA', 'AGUA', 'CIELO'],
  },
  {
    keyword: 'GATO',
    rule: 'Palabras que RIMAN con GATO',
    correct: ['PATO', 'RATO', 'PLATO', 'ZAPATO', 'DATO'],
    incorrect: ['CASA', 'MESA', 'LIBRO', 'NUBE', 'FLOR', 'PERRO'],
  },
  {
    keyword: 'SOL',
    rule: 'Palabras que RIMAN con SOL',
    correct: ['COL', 'GOL', 'FAROL', 'CARACOL', 'ESPAÑOL'],
    incorrect: ['LUNA', 'AGUA', 'TIERRA', 'CASA', 'PAN', 'MAR'],
  },
  {
    keyword: 'LUNA',
    rule: 'Palabras que RIMAN con LUNA',
    correct: ['CUNA', 'TUNA', 'UNA', 'FORTUNA', 'LAGUNA'],
    incorrect: ['SOL', 'CIELO', 'NUBE', 'MAR', 'CASA', 'GATO'],
  },
];

const MAX_MICE = 6;
const TIMER_SECONDS = 45;
const LEVEL_WIN_SCORE = 3; // 3 correct answers required to pass level
const MAX_LIVES = 3;

const CheeseTable = () => {
  const tableclothTiles = useMemo(() => {
    const list = [];
    const size = 32;
    const grid = 12;
    const tileS = size / grid;
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const x = -size / 2 + (c + 0.5) * tileS;
        const z = -size / 2 + (r + 0.5) * tileS;
        const isRed = (r + c) % 2 === 0;
        const color = isRed ? '#ef4444' : '#f8fafc';
        list.push({ x, z, size: tileS, color });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {/* Table base wood slab */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[34, 0.3, 34]} />
        <meshLambertMaterial color="#78350f" />
      </mesh>
      
      {/* Tablecloth tiles */}
      {tableclothTiles.map((tile, i) => (
        <mesh key={i} position={[tile.x, -0.04, tile.z]} receiveShadow>
          <boxGeometry args={[tile.size, 0.02, tile.size]} />
          <meshLambertMaterial color={tile.color} />
        </mesh>
      ))}

      {/* Table border */}
      <mesh position={[0, -0.04, 16.5]} receiveShadow>
        <boxGeometry args={[34, 0.08, 1]} />
        <meshLambertMaterial color="#451a03" />
      </mesh>
      <mesh position={[0, -0.04, -16.5]} receiveShadow>
        <boxGeometry args={[34, 0.08, 1]} />
        <meshLambertMaterial color="#451a03" />
      </mesh>
      <mesh position={[16.5, -0.04, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[34, 0.08, 1]} />
        <meshLambertMaterial color="#451a03" />
      </mesh>
      <mesh position={[-16.5, -0.04, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[34, 0.08, 1]} />
        <meshLambertMaterial color="#451a03" />
      </mesh>

      {/* DECORATIONS */}
      {/* Grapes */}
      <group position={[-7.5, 0.1, -7.5]} scale={[1.2, 1.2, 1.2]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshLambertMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[0.2, 0, -0.1]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshLambertMaterial color="#6d28d9" />
        </mesh>
        <mesh position={[-0.1, 0, 0.15]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshLambertMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[0.1, 0.1, 0.1]} castShadow>
          <sphereGeometry args={[0.17, 8, 8]} />
          <meshLambertMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[0.22, 0.08, 0.18]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshLambertMaterial color="#6d28d9" />
        </mesh>
        <mesh position={[-0.05, 0.12, -0.12]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshLambertMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[0.05, 0.22, 0]} rotation={[0.2, 0, -0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
          <meshLambertMaterial color="#15803d" />
        </mesh>
      </group>

      {/* Milk bottle */}
      <group position={[7.5, 0, -7.5]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1, 12]} />
          <meshLambertMaterial color="#166534" />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.18, 0.35, 8]} />
          <meshLambertMaterial color="#166534" />
        </mesh>
        <mesh position={[0, 0.5, 0.352]}>
          <planeGeometry args={[0.42, 0.45]} />
          <meshLambertMaterial color="#fef08a" />
        </mesh>
      </group>

      {/* Extra cheese wedge */}
      <group position={[-8.5, 0.25, 8.5]} rotation={[0, 0.6, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.5, 3]} />
          <meshLambertMaterial color="#facc15" />
        </mesh>
        <mesh position={[0.1, 0.1, 0.41]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshLambertMaterial color="#ca8a04" />
        </mesh>
        <mesh position={[-0.3, -0.1, 0.35]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshLambertMaterial color="#ca8a04" />
        </mesh>
      </group>

      {/* Fruit plate */}
      <group position={[8.5, 0, 8.5]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.7, 0.06, 16]} />
          <meshLambertMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.2, 0.22, -0.1]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshLambertMaterial color="#dc2626" />
        </mesh>
        <mesh position={[-0.2, 0.42, -0.1]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
          <meshLambertMaterial color="#451a03" />
        </mesh>
        <mesh position={[0.2, 0.22, 0.1]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshLambertMaterial color="#f97316" />
        </mesh>
      </group>

      {/* Terracotta Flower pots in corners */}
      {[[-14, -14], [14, -14]].map((cPos, idx) => (
        <group key={idx} position={[cPos[0], 0, cPos[1]]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.3, 0.7, 12]} />
            <meshLambertMaterial color="#c2410c" />
          </mesh>
          <mesh position={[0, 0.71, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.02, 10]} />
            <meshLambertMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
            <meshLambertMaterial color="#16a34a" />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshLambertMaterial color="#facc15" />
          </mesh>
          {[0, 1, 2, 3, 4].map(p => {
            const angle = (p * Math.PI * 2) / 5;
            return (
              <mesh key={p} position={[Math.cos(angle) * 0.18, 1.25 + Math.sin(angle) * 0.18, 0]} castShadow>
                <sphereGeometry args={[0.09, 8, 8]} />
                <meshLambertMaterial color={idx === 0 ? '#ec4899' : '#3b82f6'} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

const CheeseBoard = () => {
  return (
    <group>
      {/* Cheese base and holes scaled by 1.5 */}
      <group scale={1.5}>
        {/* Cheese base */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[5, 5, 0.4, 32]} />
          <meshLambertMaterial color="#facc15" />
        </mesh>
        {/* Cheese holes */}
        {[[1.5, 1], [-2, -1], [0, 2.5], [-1, 2], [2.5, -1.5], [-2.5, 1], [1, -2]].map((pos, i) => (
          <mesh key={i} position={[pos[0], 0.41, pos[1]]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
            <meshLambertMaterial color="#ca8a04" />
          </mesh>
        ))}
      </group>
      {/* Table top with beautiful decorations */}
      <CheeseTable />
    </group>
  );
};

const Mouse = ({ mouseData, onMouseClick, mouseSpeed }) => {
  const groupRef = useRef();
  const bodyRef = useRef();

  useFrame((state) => {
    if (!groupRef.current || !mouseData) return;
    const dx = mouseData.targetX - mouseData.x;
    const dz = mouseData.targetZ - mouseData.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 0.1) {
      mouseData.x += (dx / dist) * mouseSpeed * (mouseData.speedBoost || 1);
      mouseData.z += (dz / dist) * mouseSpeed * (mouseData.speedBoost || 1);
    }
    groupRef.current.position.x = mouseData.x;
    groupRef.current.position.z = mouseData.z;
    groupRef.current.rotation.y = Math.atan2(dx, dz);
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.3 + Math.abs(Math.sin(state.clock.elapsedTime * 8 + mouseData.id)) * 0.15;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onMouseClick) {
      onMouseClick(mouseData);
      document.body.style.cursor = 'default';
    }
  };

  // Scaled entire mouse model and Billboard text by 1.8 to make it 20% larger than 1.5x
  return (
    <group 
      ref={groupRef} 
      position={[mouseData.x, 0, mouseData.z]} 
      onClick={handleClick} 
      scale={1.8}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
      }}
    >
      <mesh ref={bodyRef} position={[0, 0.3, 0]} onClick={handleClick}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshLambertMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.55, 0.15]} onClick={handleClick}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshLambertMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[-0.1, 0.7, 0.1]} onClick={handleClick}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshLambertMaterial color="#fda4af" />
      </mesh>
      <mesh position={[0.1, 0.7, 0.1]} onClick={handleClick}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshLambertMaterial color="#fda4af" />
      </mesh>
      <Billboard position={[0, 1.5, 0]} onClick={handleClick}>
        <mesh onClick={handleClick}>
          <planeGeometry args={[1.5, 0.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.001]} onClick={handleClick}>
          <planeGeometry args={[1.4, 0.4]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <Text 
          position={[0, 0, 0.01]} 
          fontSize={0.25} 
          color="#ffffff" 
          anchorX="center" 
          anchorY="middle" 
          fontWeight="bold"
          onClick={handleClick}
        >
          {mouseData.word}
        </Text>
      </Billboard>
    </group>
  );
};

const Game2Cheese = ({ player, onFinish, speedLevel = 6 }) => {

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
  const [roundIndex, setRoundIndex] = useState(0);
  const MOUSE_SPEED = speedLevel * 0.01;

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);
  const [levelScore, setLevelScore] = useState(0); // Score in the current active level (0 to 3)
  const [lives, setLives] = useState(MAX_LIVES);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [mice, setMice] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const mouseIdRef = useRef(0);
  const round = ROUNDS[roundIndex];

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id,
          game_type: 'cheese',
          game_number: 4,
          level: 1,
        });
        setSessionId(res.data.id);
      } catch (e) {
        console.error('Error al iniciar sesión de juego:', e);
      }
    };
    startSession();
  }, [player]);

  const finishGame = async (correct, incorrect, total, finalScore, currentLevel = roundIndex + 1) => {
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
        console.error('Error al guardar progreso en base de datos:', e);
      }
    }
    onFinish({ score: finalScore, level: currentLevel, sessionId });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setGameState('lost');
          finishGame(correctCount, incorrectCount + 1, correctCount + incorrectCount + 1, correctCount * 100, roundIndex + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState, correctCount, incorrectCount, roundIndex, sessionId, sessionStartTime]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawn = () => {
      setMice(prev => {
        if (prev.length >= MAX_MICE) return prev;
        const isCorrect = Math.random() < 0.5;
        const wordPool = isCorrect ? round.correct : round.incorrect;
        const word = wordPool[Math.floor(Math.random() * wordPool.length)];
        const edge = Math.floor(Math.random() * 4);
        let x, z;
        // Spawning coordinates and speed ranges scaled 1.5x to match board scale
        if (edge === 0) { x = (Math.random() - 0.5) * 21; z = -12; }
        else if (edge === 1) { x = (Math.random() - 0.5) * 21; z = 12; }
        else if (edge === 2) { x = -12; z = (Math.random() - 0.5) * 21; }
        else { x = 12; z = (Math.random() - 0.5) * 21; }
        return [...prev, {
          id: mouseIdRef.current++,
          word,
          isCorrect,
          x, z,
          targetX: (Math.random() - 0.5) * 6,
          targetZ: (Math.random() - 0.5) * 6,
          speedBoost: 1,
        }];
      });
    };
    const interval = setInterval(spawn, 1200);
    return () => clearInterval(interval);
  }, [gameState, round]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const cleanup = setInterval(() => {
      setMice(prev => prev.filter(m => {
        const dx = m.targetX - m.x;
        const dz = m.targetZ - m.z;
        return Math.sqrt(dx * dx + dz * dz) > 0.42; // slightly increased path margin for scaled sizes
      }));
    }, 200);
    return () => clearInterval(cleanup);
  }, [gameState]);

  const handleMouseClick = (mouseData) => {
    if (gameState !== 'playing') return;
    setMice(prev => prev.filter(m => m.id !== mouseData.id));
    if (mouseData.isCorrect) {
      const newLevelScore = levelScore + 1;
      const newCorrectCount = correctCount + 1;
      setLevelScore(newLevelScore);
      setCorrectCount(newCorrectCount);
      playCorrectSound();;
      playCorrectSound();
      setFeedback(`¡Correcto! "${mouseData.word}" rima con ${round.keyword}`);
      setTimeout(() => setFeedback(''), 1500);
      
      if (newLevelScore >= LEVEL_WIN_SCORE) {
        if (roundIndex < ROUNDS.length - 1) {
          // Pass to next level
          const nextLvl = roundIndex + 1;
          setFeedback(`¡Nivel ${nextLvl} Completado! Pasando al nivel ${nextLvl + 1}...`);
          setTimeout(() => setFeedback(''), 2000);
          setRoundIndex(nextLvl);
          setLevelScore(0);
          setTimer(TIMER_SECONDS);
          setMice([]); // Clear mice from previous round
        } else {
          // Completed the final level
          setGameState('won');
          finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, newCorrectCount * 100, ROUNDS.length);
        }
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setIncorrectCount(i => i + 1);
      setFeedback(`¡Incorrecto! "${mouseData.word}" no rima.`);
      setTimeout(() => setFeedback(''), 1500);
      if (newLives <= 0) {
        setGameState('lost');
        finishGame(correctCount, incorrectCount + 1, correctCount + 1 + incorrectCount, correctCount * 100, roundIndex + 1);
      }
    }
  };

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 14, 11]} fov={55} />
          <OrbitControls enablePan={false} minDistance={10} maxDistance={22} maxPolarAngle={Math.PI / 2.3} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={0.9} castShadow />
          <CheeseBoard />
          {mice.map(m => (
            <Mouse key={m.id} mouseData={m} onMouseClick={handleMouseClick} mouseSpeed={MOUSE_SPEED} />
          ))}
        </Suspense>
      </Canvas>

      {/* HUD (Glassmorphic) */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10">
        <div className="font-sans text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Marcador de Quesos</div>
          <div className="text-base font-extrabold text-purple-300">Nivel: {roundIndex + 1} / {ROUNDS.length}</div>
          <div className="text-sm font-semibold text-indigo-300">Progreso Nivel: {levelScore} / {LEVEL_WIN_SCORE}</div>
          <div className="text-sm text-emerald-400">Puntaje Total: {correctCount * 100}</div>
          <div>Vidas: <span className="text-rose-400 font-mono">{'❤️'.repeat(lives)}{'🖤'.repeat(MAX_LIVES - lives)}</span></div>
          <div>Tiempo: <strong className="text-white">{timer}s</strong></div>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-xs text-center z-10">
        <div className="font-sans text-sm">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Regla Activa</div>
          <div className="text-indigo-200 font-semibold">{round.rule}</div>
          <div className="text-2xl font-black text-yellow-400 mt-1">→ {round.keyword}</div>
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
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Feedback de la acción */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl z-20 text-white font-sans text-lg font-bold shadow-2xl text-center select-none animate-pulse">
          {feedback}
        </div>
      )}

      {/* Help Modal Overlay */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#131238] to-[#080a1c] border-2 border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Reto del Queso?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Ayuda a los ratones a conseguir su queso seleccionando las palabras que riman con la palabra activa.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Observa la <b>regla activa</b> arriba al centro (ej. <i>Palabras que RIMAN con CASA</i>).</li>
                  <li>Los ratones avanzan llevando letreros con palabras.</li>
                  <li>Haz clic sobre el ratón que lleve una palabra que <b>rima correctamente</b> (ej. <i>MASA</i>).</li>
                  <li>Si consigues 3 correctas, avanzas al siguiente nivel con una nueva palabra.</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-7 bg-purple-600 border border-white rounded flex items-center justify-center text-[10px] font-black text-white shadow">MASA</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡CORRECTO! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Si la palabra rima, el ratón se va feliz y sumas progreso.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-7 bg-purple-600 border border-white rounded flex items-center justify-center text-[10px] font-black text-white shadow">PERRO</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡INCORRECTO! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si la palabra no rima, se descontará un corazón de tus vidas.</p>
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

export default Game2Cheese;
