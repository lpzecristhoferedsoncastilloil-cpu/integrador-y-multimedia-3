import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

const ROUNDS = [
  { keyword: 'GRANDE', rule: 'ANTONIMOS', mode: 'antonym', correct: ['PEQUENO', 'CHICO', 'DIMINUTO'], wrong: ['GIGANTE', 'ENORME', 'MAYOR'] },
  { keyword: 'FELIZ', rule: 'ANTONIMOS', mode: 'antonym', correct: ['TRISTE', 'INFELIZ', 'MELANCOLICO'], wrong: ['ALEGRE', 'CONTENTO', 'GOZOSO'] },
  { keyword: 'RAPIDO', rule: 'SINONIMOS', mode: 'synonym', correct: ['VELOZ', 'LIGERO', 'AGIL'], wrong: ['LENTO', 'PESADO', 'TARDIO'] },
  { keyword: 'BUENO', rule: 'ANTONIMOS', mode: 'antonym', correct: ['MALO', 'PERVERSO', 'TERRIBLE'], wrong: ['EXCELENTE', 'OPTIMO', 'GENIAL'] },
  { keyword: 'OSCURO', rule: 'SINONIMOS', mode: 'synonym', correct: ['NEGRO', 'SOMBRIO', 'TENEBROSO'], wrong: ['CLARO', 'BRILLANTE', 'LUMINOSO'] },
];

const LANE_X = [-3, 0, 3];
const WIN_STREAK = 8;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const River = (props) => {
  const { } = filterProps(props);
  const stripeRef = useRef();
  useFrame((state) => {
    if (stripeRef.current) {
      stripeRef.current.position.z = (state.clock.elapsedTime * 4) % 4 - 2;
    }
  });
  return (
    <group>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 40]} />
        <meshLambertMaterial color="#1E90FF" />
      </mesh>
      <mesh ref={stripeRef} position={[0, 0.01, 0]}>
        <boxGeometry args={[12, 0.01, 1]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>
      {/* Banks */}
      <mesh position={[-7, 0, 0]}>
        <boxGeometry args={[2, 0.5, 40]} />
        <meshLambertMaterial color="#7CB342" />
      </mesh>
      <mesh position={[7, 0, 0]}>
        <boxGeometry args={[2, 0.5, 40]} />
        <meshLambertMaterial color="#7CB342" />
      </mesh>
      {/* Trees on banks */}
      {[-15, -10, -5, 0, 5, 10, 15].map(z => (
        <group key={z}>
          <mesh position={[-7, 1, z]}>
            <cylinderGeometry args={[0.15, 0.15, 1.2, 6]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[-7, 2, z]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshLambertMaterial color="#2E7D32" />
          </mesh>
          <mesh position={[7, 1, z]}>
            <cylinderGeometry args={[0.15, 0.15, 1.2, 6]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[7, 2, z]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshLambertMaterial color="#2E7D32" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Raft = (props) => {
  const { laneX } = filterProps(props);
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      const target = LANE_X[laneX];
      groupRef.current.position.x += (target - groupRef.current.position.x) * 0.15;
      groupRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  return (
    <group ref={groupRef} position={[LANE_X[laneX], 0.3, 6]}>
      {/* Raft */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.2, 1.5]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Robot */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.1, 1.2, 0.25]}>
        <circleGeometry args={[0.07, 12]} />
        <meshBasicMaterial color="#FFCC00" />
      </mesh>
      <mesh position={[0.1, 1.2, 0.25]}>
        <circleGeometry args={[0.07, 12]} />
        <meshBasicMaterial color="#FFCC00" />
      </mesh>
    </group>
  );
};

const Log = (props) => {
  const { log } = filterProps(props);
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current && log) {
      groupRef.current.position.z = log.z;
      groupRef.current.rotation.x += 0.02;
    }
  });
  return (
    <group ref={groupRef} position={[LANE_X[log.lane], 0.3, log.z]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.45, 0.45, 1.8, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshLambertMaterial color="#6D4C2E" />
      </mesh>
      <Text position={[0, 0.55, 0]} fontSize={0.35} color="#FFFFFF" anchorX="center" anchorY="middle" fontWeight="bold" outlineColor="#000000" outlineWidth={0.04}>
        {log.word}
      </Text>
    </group>
  );
};

const Game5River = () => {
  const navigate = useNavigate();
  const [roundIndex, setRoundIndex] = useState(0);
  const [lane, setLane] = useState(1);
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing');
  const logIdRef = useRef(0);
  const round = ROUNDS[roundIndex];

  // Keyboard input
  useEffect(() => {
    const handler = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLane(l => Math.max(0, l - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setLane(l => Math.min(2, l + 1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState]);

  // Spawn logs in groups of 3 (one per lane)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawn = () => {
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
          z: -15,
          groupId: Date.now(),
        });
      }
      setLogs(prev => [...prev, ...newLogs]);
    };
    spawn();
    const interval = setInterval(spawn, 4500);
    return () => clearInterval(interval);
  }, [gameState, round]);

  // Move logs toward raft, check collisions
  useEffect(() => {
    if (gameState !== 'playing') return;
    const tick = setInterval(() => {
      setLogs(prev => {
        const updated = [];
        for (const log of prev) {
          const newZ = log.z + 0.18;
          if (newZ > 7) continue; // off screen
          // Collision when log is near raft position (z=6) and same lane
          if (newZ > 5.4 && newZ < 6.4 && !log.collided && log.lane === lane) {
            // Mark collided to avoid double-trigger
            log.collided = true;
            if (log.isCorrect) {
              setStreak(s => {
                const ns = s + 1;
                if (ns >= WIN_STREAK) setGameState('won');
                return ns;
              });
              setFeedback(`CORRECTO! "${log.word}" es ${round.mode === 'antonym' ? 'antonimo' : 'sinonimo'} de ${round.keyword}`);
              setTimeout(() => setFeedback(''), 1200);
            } else {
              setLives(l => {
                const nl = l - 1;
                if (nl <= 0) setGameState('lost');
                return nl;
              });
              setStreak(0);
              setFeedback(`FALLO! "${log.word}" no cumple la regla`);
              setTimeout(() => setFeedback(''), 1200);
            }
            continue; // remove log after collision
          }
          updated.push({ ...log, z: newZ });
        }
        return updated;
      });
    }, 50);
    return () => clearInterval(tick);
  }, [gameState, lane, round]);

  const restart = () => {
    setRoundIndex((roundIndex + 1) % ROUNDS.length);
    setLane(1);
    setLogs([]);
    setStreak(0);
    setLives(3);
    setGameState('playing');
    setFeedback('');
  };

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#87CEEB', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 8, 13]} fov={55} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 15, 5]} intensity={0.9} castShadow />
          <River />
          <Raft laneX={lane} />
          {logs.map(l => <Log key={l.id} log={l} />)}
        </Suspense>
      </Canvas>

      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="river-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '22px' }}>
            <div>RACHA: {streak} / {WIN_STREAK}</div>
            <div>VIDAS: {'★'.repeat(lives)}{'☆'.repeat(3 - lives)}</div>
          </div>
        </div>
        <div className="pointer-events-auto bg-yellow-400 border-4 border-black p-4 max-w-md" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div style={{ fontFamily: 'VT323, monospace' }}>
            <div className="text-lg">REGLA: {round.rule}</div>
            <div className="text-3xl">{round.keyword}</div>
            <div className="text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {round.mode === 'antonym' ? '←/→ Choca contra el ANTONIMO' : '←/→ Choca contra el SINONIMO'}
            </div>
          </div>
        </div>
        <button data-testid="river-exit-button" onClick={() => navigate('/')} className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>SALIR</button>
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10 flex gap-4">
        <button data-testid="river-left-button" onClick={() => setLane(l => Math.max(0, l - 1))} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '24px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>← IZQ</button>
        <button data-testid="river-right-button" onClick={() => setLane(l => Math.min(2, l + 1))} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '24px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>DER →</button>
      </div>

      {feedback && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-3 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '20px' }} data-testid="river-feedback">
          {feedback}
        </div>
      )}

      {gameState !== 'playing' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: gameState === 'won' ? '#4CD964' : '#FF3B30' }}>
              {gameState === 'won' ? 'VICTORIA!' : 'PERDISTE'}
            </h2>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {gameState === 'won' ? `Lograste ${WIN_STREAK} aciertos seguidos!` : `Racha: ${streak}`}
            </p>
            <div className="flex gap-3 justify-center">
              <button data-testid="river-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>REINTENTAR</button>
              <button data-testid="river-back-button" onClick={() => navigate('/')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game5River;
