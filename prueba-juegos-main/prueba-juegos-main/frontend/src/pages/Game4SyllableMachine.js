import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

// Word combinations: prefix + root/suffix = full word with meaning
const WORD_RECIPES = [
  { prefix: 'IN', suffix: 'ROMPIBLE', full: 'INROMPIBLE', meaning: 'Algo que no se puede romper' },
  { prefix: 'DES', suffix: 'HACER', full: 'DESHACER', meaning: 'Quitar lo que se ha hecho' },
  { prefix: 'SUB', suffix: 'MARINO', full: 'SUBMARINO', meaning: 'Barco que viaja bajo el mar' },
  { prefix: 'IN', suffix: 'FELIZ', full: 'INFELIZ', meaning: 'Que no es feliz' },
  { prefix: 'RE', suffix: 'HACER', full: 'REHACER', meaning: 'Hacer algo de nuevo' },
  { prefix: 'ANTI', suffix: 'VIRUS', full: 'ANTIVIRUS', meaning: 'Lo que combate los virus' },
  { prefix: 'PRE', suffix: 'HISTORIA', full: 'PREHISTORIA', meaning: 'Tiempo antes de la historia escrita' },
  { prefix: 'SUPER', suffix: 'MERCADO', full: 'SUPERMERCADO', meaning: 'Tienda grande de comida' },
];

const PREFIXES = ['IN', 'DES', 'SUB', 'RE', 'ANTI', 'PRE', 'SUPER'];
const SUFFIXES = ['ROMPIBLE', 'HACER', 'MARINO', 'FELIZ', 'VIRUS', 'HISTORIA', 'MERCADO'];
const WIN_COUNT = 5;
const BLOCK_LIFETIME = 8000; // ms

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const ConveyorBelt = (props) => {
  const { } = filterProps(props);
  const beltRef = useRef();
  useFrame((state) => {
    if (beltRef.current) {
      beltRef.current.material.map = null;
    }
  });
  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[16, 0.2, 2.5]} />
        <meshLambertMaterial color="#444444" />
      </mesh>
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
        <mesh key={i} position={[x, -0.1, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 2.5, 16]} />
          <meshLambertMaterial color="#888888" />
        </mesh>
      ))}
      {/* Left tube (prefixes) */}
      <mesh position={[-8, 3, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 16]} />
        <meshLambertMaterial color="#FF3B30" />
      </mesh>
      {/* Right tube (suffixes) */}
      <mesh position={[8, 3, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 16]} />
        <meshLambertMaterial color="#007AFF" />
      </mesh>
      {/* Factory floor */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[24, 0.2, 10]} />
        <meshLambertMaterial color="#7A6A5A" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 3, -5]}>
        <boxGeometry args={[24, 8, 0.4]} />
        <meshLambertMaterial color="#9A8A7A" />
      </mesh>
    </group>
  );
};

const SyllableBlock = (props) => {
  const { block, isSelected, onClick } = filterProps(props);
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current && block) {
      // Move along belt
      groupRef.current.position.x = block.x;
      groupRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 4 + block.id) * 0.05;
    }
  });
  const color = isSelected ? '#4CD964' : (block.type === 'prefix' ? '#FF6B6B' : '#5B9BFF');
  return (
    <group ref={groupRef} position={[block.x, 0.6, 0]} onClick={(e) => { e.stopPropagation(); onClick(block); }}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.8, 0.8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <Text position={[0, 0, 0.42]} fontSize={0.3} color="#111827" anchorX="center" anchorY="middle" fontWeight="bold">
        {block.text}
      </Text>
    </group>
  );
};

const Game4SyllableMachine = () => {
  const navigate = useNavigate();
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [selectedSuffix, setSelectedSuffix] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [jamUntil, setJamUntil] = useState(0);
  const blockIdRef = useRef(0);
  const recipe = WORD_RECIPES[recipeIndex];

  // Spawn blocks
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawn = () => {
      if (Date.now() < jamUntil) return;
      setBlocks(prev => {
        if (prev.length >= 8) return prev;
        const isPrefix = Math.random() < 0.5;
        const pool = isPrefix ? PREFIXES : SUFFIXES;
        const text = pool[Math.floor(Math.random() * pool.length)];
        return [...prev, {
          id: blockIdRef.current++,
          text,
          type: isPrefix ? 'prefix' : 'suffix',
          x: -8 + Math.random() * 1,
          spawnTime: Date.now(),
        }];
      });
    };
    const interval = setInterval(spawn, 1500);
    return () => clearInterval(interval);
  }, [gameState, jamUntil]);

  // Move blocks along belt
  useEffect(() => {
    if (gameState !== 'playing') return;
    const tick = setInterval(() => {
      if (Date.now() < jamUntil) return;
      setBlocks(prev => prev
        .map(b => ({ ...b, x: b.x + 0.05 }))
        .filter(b => b.x < 9 && Date.now() - b.spawnTime < BLOCK_LIFETIME)
      );
    }, 50);
    return () => clearInterval(tick);
  }, [gameState, jamUntil]);

  const handleBlockClick = (block) => {
    if (Date.now() < jamUntil) return;
    if (block.type === 'prefix') {
      setSelectedPrefix(block);
    } else {
      if (!selectedPrefix) {
        setFeedback('Primero elige un PREFIJO (rojo)!');
        setTimeout(() => setFeedback(''), 1500);
        return;
      }
      setSelectedSuffix(block);
      // Validate combo
      if (selectedPrefix.text === recipe.prefix && block.text === recipe.suffix) {
        const newScore = score + 1;
        setScore(newScore);
        setFeedback(`CORRECTO! ${selectedPrefix.text}+${block.text} = ${recipe.full}`);
        setBlocks(prev => prev.filter(b => b.id !== selectedPrefix.id && b.id !== block.id));
        setTimeout(() => {
          setSelectedPrefix(null);
          setSelectedSuffix(null);
          setFeedback('');
          if (newScore >= WIN_COUNT) {
            setGameState('won');
          } else {
            setRecipeIndex((recipeIndex + 1) % WORD_RECIPES.length);
          }
        }, 2000);
      } else {
        setFeedback('ERROR! Cortocircuito - banda atascada 3 segundos');
        setJamUntil(Date.now() + 3000);
        setTimeout(() => {
          setSelectedPrefix(null);
          setSelectedSuffix(null);
          setFeedback('');
        }, 2000);
      }
    }
  };

  const restart = () => {
    setRecipeIndex(0);
    setScore(0);
    setBlocks([]);
    setSelectedPrefix(null);
    setSelectedSuffix(null);
    setGameState('playing');
    setFeedback('');
    setJamUntil(0);
  };

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#9A8A7A', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 6, 9]} fov={55} />
          <OrbitControls enablePan={false} minDistance={6} maxDistance={15} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
          <ConveyorBelt />
          {blocks.map(b => (
            <SyllableBlock
              key={b.id}
              block={b}
              isSelected={selectedPrefix?.id === b.id || selectedSuffix?.id === b.id}
              onClick={handleBlockClick}
            />
          ))}
        </Suspense>
      </Canvas>

      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="machine-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '22px' }}>
            <div>OBJETOS: {score} / {WIN_COUNT}</div>
            <div className="text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {selectedPrefix ? `Prefijo: ${selectedPrefix.text}` : 'Elige un PREFIJO'}
            </div>
          </div>
        </div>
        <div className="pointer-events-auto bg-yellow-400 border-4 border-black p-4 max-w-md" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div style={{ fontFamily: 'VT323, monospace' }}>
            <div className="text-lg">CONSTRUYE:</div>
            <div className="text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>{recipe.meaning}</div>
          </div>
        </div>
        <button data-testid="machine-exit-button" onClick={() => navigate('/')} className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>SALIR</button>
      </div>

      {feedback && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-4 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '20px' }} data-testid="machine-feedback">
          {feedback}
        </div>
      )}

      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="machine-win-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#4CD964' }}>VICTORIA!</h2>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>Construiste {WIN_COUNT} palabras!</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="machine-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>JUGAR DE NUEVO</button>
              <button data-testid="machine-back-button" onClick={() => navigate('/')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game4SyllableMachine;
