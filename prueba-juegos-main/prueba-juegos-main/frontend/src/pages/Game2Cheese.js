import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Billboard } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

// Rounds: each has a keyword and a pool of correct and incorrect words
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
    correct: ['COL', 'GOL', 'FAROL', 'CARACOL', 'ESPANOL'],
    incorrect: ['LUNA', 'AGUA', 'TIERRA', 'CASA', 'PAN', 'MAR'],
  },
  {
    keyword: 'LUNA',
    rule: 'Palabras que RIMAN con LUNA',
    correct: ['CUNA', 'TUNA', 'UNA', 'FORTUNA', 'LAGUNA'],
    incorrect: ['SOL', 'CIELO', 'NUBE', 'MAR', 'CASA', 'GATO'],
  },
];

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const MAX_MICE = 6;
const MOUSE_SPEED = 0.04;
const TIMER_SECONDS = 45;
const WIN_SCORE = 6;
const MAX_LIVES = 3;

const CheeseBoard = (props) => {
  const { } = filterProps(props);
  return (
    <group>
      {/* Cheese base - a flat cylinder */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[5, 5, 0.4, 32]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      {/* Cheese holes */}
      {[[1.5, 1], [-2, -1], [0, 2.5], [-1, 2], [2.5, -1.5], [-2.5, 1], [1, -2]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.41, pos[1]]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
          <meshLambertMaterial color="#8B6F00" />
        </mesh>
      ))}
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 20]} />
        <meshLambertMaterial color="#D2B48C" />
      </mesh>
    </group>
  );
};

const Mouse = (props) => {
  const { mouseData, onMouseClick } = filterProps(props);
  const groupRef = useRef();
  const bodyRef = useRef();

  useFrame((state) => {
    if (!groupRef.current || !mouseData) return;
    // Move toward target
    const dx = mouseData.targetX - mouseData.x;
    const dz = mouseData.targetZ - mouseData.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 0.1) {
      mouseData.x += (dx / dist) * MOUSE_SPEED * (mouseData.speedBoost || 1);
      mouseData.z += (dz / dist) * MOUSE_SPEED * (mouseData.speedBoost || 1);
    }
    groupRef.current.position.x = mouseData.x;
    groupRef.current.position.z = mouseData.z;
    // Face direction
    groupRef.current.rotation.y = Math.atan2(dx, dz);
    // Hop animation
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.3 + Math.abs(Math.sin(state.clock.elapsedTime * 8 + mouseData.id)) * 0.15;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onMouseClick) onMouseClick(mouseData);
  };

  return (
    <group ref={groupRef} position={[mouseData.x, 0, mouseData.z]} onClick={handleClick}>
      <mesh ref={bodyRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshLambertMaterial color="#B0B0B0" />
      </mesh>
      <mesh position={[0, 0.55, 0.15]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshLambertMaterial color="#C8C8C8" />
      </mesh>
      <mesh position={[-0.1, 0.7, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshLambertMaterial color="#FFB6C1" />
      </mesh>
      <mesh position={[0.1, 0.7, 0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshLambertMaterial color="#FFB6C1" />
      </mesh>
      {/* Word sign */}
      <Billboard position={[0, 1.5, 0]}>
        <mesh>
          <planeGeometry args={[1.4, 0.5]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[1.3, 0.4]} />
          <meshBasicMaterial color="#FFCC00" />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.25} color="#111827" anchorX="center" anchorY="middle" fontWeight="bold">
          {mouseData.word}
        </Text>
      </Billboard>
    </group>
  );
};

const Game2Cheese = () => {
  const navigate = useNavigate();
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [mice, setMice] = useState([]);
  const [feedback, setFeedback] = useState('');
  const mouseIdRef = useRef(0);
  const round = ROUNDS[roundIndex];

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setGameState('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState]);

  // Spawn mice periodically
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
        if (edge === 0) { x = (Math.random() - 0.5) * 14; z = -8; }
        else if (edge === 1) { x = (Math.random() - 0.5) * 14; z = 8; }
        else if (edge === 2) { x = -8; z = (Math.random() - 0.5) * 14; }
        else { x = 8; z = (Math.random() - 0.5) * 14; }
        return [...prev, {
          id: mouseIdRef.current++,
          word,
          isCorrect,
          x, z,
          targetX: (Math.random() - 0.5) * 4,
          targetZ: (Math.random() - 0.5) * 4,
          speedBoost: 1,
        }];
      });
    };
    const interval = setInterval(spawn, 1200);
    return () => clearInterval(interval);
  }, [gameState, round]);

  // Remove mice that reach center
  useEffect(() => {
    if (gameState !== 'playing') return;
    const cleanup = setInterval(() => {
      setMice(prev => prev.filter(m => {
        const dx = m.targetX - m.x;
        const dz = m.targetZ - m.z;
        return Math.sqrt(dx * dx + dz * dz) > 0.3;
      }));
    }, 200);
    return () => clearInterval(cleanup);
  }, [gameState]);

  const handleMouseClick = (mouseData) => {
    if (gameState !== 'playing') return;
    setMice(prev => prev.filter(m => m.id !== mouseData.id));
    if (mouseData.isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setFeedback(`Correcto! "${mouseData.word}" rima con ${round.keyword}`);
      setTimeout(() => setFeedback(''), 1500);
      if (newScore >= WIN_SCORE) {
        setGameState('won');
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback(`Incorrecto! "${mouseData.word}" no rima.`);
      setTimeout(() => setFeedback(''), 1500);
      if (newLives <= 0) {
        setGameState('lost');
      }
    }
  };

  const restart = () => {
    setScore(0);
    setLives(MAX_LIVES);
    setTimer(TIMER_SECONDS);
    setGameState('playing');
    setMice([]);
    setRoundIndex((roundIndex + 1) % ROUNDS.length);
  };

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#FFE4B5', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 12, 10]} fov={55} />
          <OrbitControls enablePan={false} minDistance={8} maxDistance={20} maxPolarAngle={Math.PI / 2.3} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={0.9} castShadow />
          <CheeseBoard />
          {mice.map(m => (
            <Mouse key={m.id} mouseData={m} onMouseClick={handleMouseClick} />
          ))}
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="cheese-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '22px' }}>
            <div>ACIERTOS: {score} / {WIN_SCORE}</div>
            <div>VIDAS: {'★'.repeat(lives)}{'☆'.repeat(MAX_LIVES - lives)}</div>
            <div>TIEMPO: {timer}s</div>
          </div>
        </div>
        <div className="pointer-events-auto bg-yellow-400 border-4 border-black p-4 max-w-md" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}>
            <div>REGLA:</div>
            <div className="text-xl">{round.rule}</div>
            <div className="text-3xl mt-1">→ {round.keyword}</div>
          </div>
        </div>
        <button
          data-testid="cheese-exit-button"
          onClick={() => navigate('/minigames')}
          className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black"
          style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
        >
          SALIR
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-3 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '22px' }} data-testid="cheese-feedback">
          {feedback}
        </div>
      )}

      {/* Win modal */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="cheese-win-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#4CD964' }}>VICTORIA!</h2>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>Atrapaste {WIN_SCORE} ratones correctos!</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="cheese-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>SIGUIENTE RONDA</button>
              <button data-testid="cheese-back-hub-button" onClick={() => navigate('/minigames')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}

      {/* Lost modal */}
      {gameState === 'lost' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="cheese-lost-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#FF3B30' }}>PERDISTE</h2>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>Inténtalo de nuevo. Aciertos: {score}</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="cheese-restart-button-lost" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>REINTENTAR</button>
              <button data-testid="cheese-back-hub-button-lost" onClick={() => navigate('/minigames')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game2Cheese;
