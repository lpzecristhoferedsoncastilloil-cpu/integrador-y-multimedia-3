import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { ChevronLeft, ChevronRight, HelpCircle, Award } from 'lucide-react';
import api from '../../services/api';

// Words grouped by 6 levels (3 mini-levels/rounds per level)
const LEVELS_ROUNDS = [
  // Level 1: Very Easy
  [
    { keyword: 'GRANDE', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['PEQUEÑO', 'CHICO', 'DIMINUTO'], wrong: ['GIGANTE', 'ENORME', 'MAYOR'] },
    { keyword: 'FELIZ', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['TRISTE', 'INFELIZ', 'MELANCÓLICO'], wrong: ['ALEGRE', 'CONTENTO', 'GOZOSO'] },
    { keyword: 'RÁPIDO', rule: 'SINÓNIMOS', mode: 'synonym', correct: ['VELOZ', 'LIGERO', 'ÁGIL'], wrong: ['LENTO', 'PESADO', 'TARDÍO'] },
  ],
  // Level 2: Easy
  [
    { keyword: 'BUENO', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['MALO', 'PERVERSO', 'TERRIBLE'], wrong: ['EXCELENTE', 'ÓPTIMO', 'GENIAL'] },
    { keyword: 'FÁCIL', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['DIFÍCIL', 'COMPLEJO', 'DURO'], wrong: ['SENCILLO', 'SIMPLE', 'CÓMODO'] },
    { keyword: 'SUAVE', rule: 'SINÓNIMOS', mode: 'synonym', correct: ['BLANDO', 'SEDOSO', 'LISO'], wrong: ['ÁSPERO', 'RUGOSO', 'DURO'] },
  ],
  // Level 3: Medium
  [
    { keyword: 'OSCURO', rule: 'SINÓNIMOS', mode: 'synonym', correct: ['NEGRO', 'SOMBRÍO', 'TENEBROSO'], wrong: ['CLARO', 'BRILLANTE', 'LUMINOSO'] },
    { keyword: 'FRÍO', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['CALIENTE', 'CÁLIDO', 'ARDIENTE'], wrong: ['HELADO', 'CONGELADO', 'FRESCO'] },
    { keyword: 'AMIGO', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['ENEMIGO', 'RIVAL', 'ADVERSARIO'], wrong: ['COMPAÑERO', 'ALIADO', 'SOCIO'] },
  ],
  // Level 4: Medium-Hard
  [
    { keyword: 'BELLEZA', rule: 'SINÓNIMOS', mode: 'synonym', correct: ['HERMOSURA', 'ESTÉTICA', 'ATRACTIVO'], wrong: ['FEALDAD', 'HORROR', 'MONSTRUOSO'] },
    { keyword: 'VALIENTE', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['COBARDE', 'TEMEROSO', 'MIEDOSO'], wrong: ['OSADO', 'ATREVIDO', 'HEROICO'] },
    { keyword: 'ANCHO', rule: 'SINÓNIMOS', mode: 'synonym', correct: ['AMPLIO', 'ESPACIOSO', 'HOLGADO'], wrong: ['ESTRECHO', 'ANGOSTO', 'FINO'] },
  ],
  // Level 5: Hard
  [
    { keyword: 'CORTÉS', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['GROSERO', 'MALEDUCADO', 'INCORRECTO'], wrong: ['ATENTO', 'AMABLE', 'RESPETUOSO'] },
    { keyword: 'SABIDURÍA', rule: 'SINÓNIMOS', mode: 'synonym', correct: ['CONOCIMIENTO', 'ERUDICIÓN', 'SABER'], wrong: ['IGNORANCIA', 'TORPEZA', 'INEXPERIENCIA'] },
    { keyword: 'AUMENTAR', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['DISMINUIR', 'REDUCIR', 'BAJAR'], wrong: ['INCREMENTAR', 'CRECER', 'SUMAR'] },
  ],
  // Level 6: Very Hard
  [
    { keyword: 'EFÍMERO', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['DURADERO', 'ETERNO', 'PERMANENTE'], wrong: ['PASAJERO', 'BREVE', 'FUGAZ'] },
    { keyword: 'VIGILANTE', rule: 'SINÓNIMOS', mode: 'synonym', correct: ['ATENTO', 'ALERTA', 'GUARDIÁN'], wrong: ['DISTRAÍDO', 'DORMIDO', 'DESPREOCUPADO'] },
    { keyword: 'DILIGENTE', rule: 'ANTÓNIMOS', mode: 'antonym', correct: ['PEREZOSO', 'VAGO', 'LENTO'], wrong: ['TRABAJADOR', 'RÁPIDO', 'ACTIVO'] },
  ],
];

const LANE_X = [-3, 0, 3];
const ROUNDS_PER_LEVEL = 3;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
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

// Component to dynamically steer and tilt the camera, positioning the raft at 25% screen height
const CameraController = () => {
  useFrame((state) => {
    state.camera.position.set(0, 7.5, 14.5);
    state.camera.lookAt(0, 1.2, 4.0);
  });
  return null;
};

const Game5River = ({ player, onFinish }) => {

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
  const [roundIndex, setRoundIndex] = useState(0); // 0, 1, or 2 (rounds per level)
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

  const logsRef = useRef([]);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  // Spawn obstacles / logs
  useEffect(() => {
    if (gameState !== 'playing' || showHelpModal) return;

    let lastWordSpawn = Date.now();
    let lastHazardSpawn = Date.now();

    const spawnWordRow = () => {
      const correctLane = Math.floor(Math.random() * 3);
      const newLogs = [];
      for (let i = 0; i < 3; i++) {
        const isCorrect = i === correctLane;
        const pool = isCorrect ? round.correct : round.wrong;
        const word = pool[Math.floor(Math.random() * pool.length)];
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

    // Spawn first row immediately
    spawnWordRow();

    const tick = setInterval(() => {
      const now = Date.now();
      const hasWordLogs = logsRef.current.some(l => !l.isHazard);
      const timeSinceWord = now - lastWordSpawn;

      if (!hasWordLogs || timeSinceWord > 6500) {
        spawnWordRow();
      } else if (currentLevel >= 3) {
        const timeSinceHazard = now - lastHazardSpawn;
        const hazardInterval = currentLevel >= 5 ? 1600 : 2200;

        if (timeSinceWord > 1800 && timeSinceWord < 5000 && timeSinceHazard > hazardInterval) {
          const numHazards = (currentLevel >= 5 && Math.random() < 0.6) ? 2 : 1;
          const lanesToBlock = [];
          const availableLanes = [0, 1, 2];
          for (let k = 0; k < numHazards; k++) {
            const idx = Math.floor(Math.random() * availableLanes.length);
            lanesToBlock.push(availableLanes.splice(idx, 1)[0]);
          }

          const newHazards = lanesToBlock.map(laneIdx => ({
            id: logIdRef.current++,
            lane: laneIdx,
            word: '',
            isCorrect: false,
            isHazard: true,
            z: -15,
            collided: false,
          }));

          setLogs(prev => [...prev, ...newHazards]);
          lastHazardSpawn = now;
        }
      }
    }, 200);

    return () => {
      clearInterval(tick);
      setLogs([]); // clear logs on unmount to prevent double spawns in StrictMode
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
      playCorrectSound();;
      playCorrectSound();
              setFeedback(`¡CORRECTO! "${log.word}" es ${round.mode === 'antonym' ? 'antónimo' : 'sinónimo'} de ${round.keyword}`);
              setTimeout(() => setFeedback(''), 1200);

              // Go to next mini-level (round) or level
              setTimeout(() => {
                setLogs([]); // clear logs
                if (roundIndex < ROUNDS_PER_LEVEL - 1) {
                  setRoundIndex(prev => prev + 1);
                } else {
                  // Completed level
                  if (currentLevel < 6) {
                    const nextLvl = currentLevel + 1;
                    setFeedback(`¡Nivel ${currentLevel} Completado! Siguiente nivel ${nextLvl}...`);
                    setTimeout(() => setFeedback(''), 2000);
                    setCurrentLevel(nextLvl);
                    setRoundIndex(0);
                    setLives(3); // Refill lives for child-friendliness
                  } else {
                    setGameState('won');
                    finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, newCorrectCount * 150, 6);
                  }
                }
              }, 1200);
            } else {
              const newIncorrectCount = incorrectCount + 1;
              setIncorrectCount(newIncorrectCount);
              setFeedback(`¡ERROR! "${log.word}" no cumple la regla`);
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
  }, [gameState, lane, round, correctCount, incorrectCount, roundIndex, currentLevel, showHelpModal]);

  const restart = () => {
    setCurrentLevel(1);
    setRoundIndex(0);
    setLane(1);
    setLogs([]);
    setLives(3);
    setGameState('playing');
    setFeedback('');
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <CameraController />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 15, 5]} intensity={0.8} castShadow />
          {/* Scaled entire 3D content by 1.3 to make it 30% larger */}
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
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Río Cósmico</div>
          <div className="text-base font-extrabold text-purple-300">Nivel: {currentLevel} / 6</div>
          <div className="text-xs font-semibold text-indigo-300">Mini-nivel: {roundIndex + 1} / {ROUNDS_PER_LEVEL}</div>
          <div className="text-xs text-emerald-400 font-medium">Puntaje Total: {correctCount * 150}</div>
          <div className="flex items-center gap-1 mt-1 text-xs">
            Vidas:{' '}
            <span className="text-rose-400 font-mono">
              {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-sm text-center z-10 font-sans">
        <div className="text-sm flex flex-col items-center">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> REGLA ACTIVA
          </div>
          <div className="text-indigo-200 font-semibold mb-1">Buscar {round.rule} de:</div>
          <div className="text-2xl font-black text-cyan-400 tracking-wide">{round.keyword}</div>
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
                Esquiva los obstáculos del río espacial recolectando la palabra correcta según la regla activa mostrada.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Lee la <b>regla activa</b> arriba (ej. <i>Buscar SINÓNIMOS de: RÁPIDO</i>).</li>
                  <li>Usa las teclas de flecha <b>Izquierda/Derecha</b>, las letras <b>A/D</b> o los botones en pantalla para mover tu balsa de carril.</li>
                  <li>Choca contra los troncos flotantes que lleven la palabra correcta (ej. <i>VELOZ</i>).</li>
                  <li>Evita chocar contra los troncos con palabras incorrectas.</li>
                  <li><b>A partir del Nivel 3</b>, esquiva los obstáculos espaciales de color rojo brillante que bloquean el camino.</li>
                  <li>Completa los 3 mini-niveles de cada nivel para subir de rango. ¡Hay 6 niveles!</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-12 h-6 bg-indigo-600 border border-purple-400 rounded flex items-center justify-center text-[9px] font-black text-white shadow">VELOZ</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡CORRECTO! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Si la palabra cumple con la regla, sumas progreso al nivel.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-12 h-6 bg-indigo-600 border border-purple-400 rounded flex items-center justify-center text-[9px] font-black text-white shadow">LENTO</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡INCORRECTO! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si recoges una palabra incorrecta, perderás una vida de tus corazones.</p>
                  </div>
                </div>

                {/* Visual indicator of hazard */}
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5">
                  <div className="w-12 h-6 bg-red-600 rounded-xl border border-red-400 flex items-center justify-center text-[8px] font-black text-white shadow">PELIGRO</div>
                  <div className="text-xs">
                    <strong className="text-red-400 text-xs">¡ESQUIVAR! ⚠️</strong>
                    <p className="text-[10px] text-gray-300">A partir del Nivel 3 aparecerán barreras rojas. ¡Muévete de carril para esquivarlas!</p>
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

export default Game5River;
