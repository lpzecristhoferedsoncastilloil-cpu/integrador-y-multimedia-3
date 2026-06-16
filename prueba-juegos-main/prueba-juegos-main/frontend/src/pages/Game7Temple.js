import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

// Spanish words with their syllables and accentuation type
// tonicIndex: 0-based index of the stressed syllable
const WORD_BANK = [
  { word: 'MUSICA', syllables: ['MU', 'SI', 'CA'], tonicIndex: 0, type: 'esdrujula' },
  { word: 'CAFE', syllables: ['CA', 'FE'], tonicIndex: 1, type: 'aguda' },
  { word: 'CASA', syllables: ['CA', 'SA'], tonicIndex: 0, type: 'llana' },
  { word: 'PAJARO', syllables: ['PA', 'JA', 'RO'], tonicIndex: 0, type: 'esdrujula' },
  { word: 'SOFA', syllables: ['SO', 'FA'], tonicIndex: 1, type: 'aguda' },
  { word: 'MESA', syllables: ['ME', 'SA'], tonicIndex: 0, type: 'llana' },
  { word: 'CORAZON', syllables: ['CO', 'RA', 'ZON'], tonicIndex: 2, type: 'aguda' },
  { word: 'ARBOL', syllables: ['AR', 'BOL'], tonicIndex: 0, type: 'llana' },
  { word: 'BRUJULA', syllables: ['BRU', 'JU', 'LA'], tonicIndex: 0, type: 'esdrujula' },
  { word: 'CANCION', syllables: ['CAN', 'CION'], tonicIndex: 1, type: 'aguda' },
  { word: 'LAMPARA', syllables: ['LAM', 'PA', 'RA'], tonicIndex: 0, type: 'esdrujula' },
];

const SYLLABLE_BEAT_MS = 600;
const WIN_STREAK = 6;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const Statue = (props) => {
  const { position, label, color, isHighlighted, onClick } = filterProps(props);
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick && onClick(label); }}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.6, 1.6, 1]} />
        <meshLambertMaterial color={isHighlighted ? color : '#888888'} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshLambertMaterial color={isHighlighted ? color : '#999999'} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.2, 2.05, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={isHighlighted ? '#00BFFF' : '#222222'} />
      </mesh>
      <mesh position={[0.2, 2.05, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={isHighlighted ? '#00BFFF' : '#222222'} />
      </mesh>
      {/* Open mouth */}
      <mesh position={[0, 1.7, 0.55]}>
        <boxGeometry args={[0.4, 0.2, 0.05]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      <Text position={[0, -0.2, 0.55]} fontSize={0.3} color="#FFCC00" anchorX="center" anchorY="middle" fontWeight="bold" outlineColor="#000000" outlineWidth={0.04}>
        {label.toUpperCase()}
      </Text>
    </group>
  );
};

const Gong = (props) => {
  const { onClick, isPulsing } = filterProps(props);
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      const s = isPulsing ? 1 + Math.sin(state.clock.elapsedTime * 8) * 0.06 : 1;
      ringRef.current.scale.set(s, s, s);
    }
  });
  return (
    <group position={[0, 0.6, 2.5]} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.2, 0.15, 12, 32]} />
        <meshLambertMaterial color="#B8860B" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshLambertMaterial color="#DAA520" />
      </mesh>
      {/* Stand */}
      <mesh position={[-1.5, -0.3, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshLambertMaterial color="#3E2723" />
      </mesh>
      <mesh position={[1.5, -0.3, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshLambertMaterial color="#3E2723" />
      </mesh>
    </group>
  );
};

const TempleScene = (props) => {
  const { } = filterProps(props);
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 18]} />
        <meshLambertMaterial color="#5D5D5D" />
      </mesh>
      {/* Columns */}
      {[[-6, -6], [6, -6], [-6, 6], [6, 6]].map((p, i) => (
        <mesh key={i} position={[p[0], 2.5, p[1]]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 5, 12]} />
          <meshLambertMaterial color="#9E9E9E" />
        </mesh>
      ))}
      {/* Back wall */}
      <mesh position={[0, 3, -7]}>
        <boxGeometry args={[16, 6, 0.4]} />
        <meshLambertMaterial color="#7A7A7A" />
      </mesh>
      {/* Floor stones detail */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[8, 0.02, 8]} />
        <meshLambertMaterial color="#6D6D6D" />
      </mesh>
    </group>
  );
};

const Game7Temple = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * WORD_BANK.length));
  const [currentSyllable, setCurrentSyllable] = useState(0);
  const [phase, setPhase] = useState('listening'); // listening, captured, feeding, transition
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [gongPulse, setGongPulse] = useState(false);
  const word = WORD_BANK[wordIndex];

  // Rhythm cycle for listening phase
  useEffect(() => {
    if (gameState !== 'playing' || phase !== 'listening') return;
    const tick = setInterval(() => {
      setCurrentSyllable(prev => (prev + 1) % word.syllables.length);
    }, SYLLABLE_BEAT_MS);
    return () => clearInterval(tick);
  }, [gameState, phase, word]);

  const handleGongClick = () => {
    if (gameState !== 'playing' || phase !== 'listening') return;
    if (currentSyllable === word.tonicIndex) {
      setPhase('captured');
      setGongPulse(true);
      setTimeout(() => setGongPulse(false), 800);
      setFeedback(`Capturado! Elige la estatua correcta`);
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setStreak(0);
      setFeedback(`FALLO! La silaba tonica es ${word.syllables[word.tonicIndex]}`);
      setTimeout(() => setFeedback(''), 2000);
      setTimeout(() => loadNextWord(), 2200);
    }
  };

  const handleStatueClick = (statueType) => {
    if (gameState !== 'playing' || phase !== 'captured') return;
    if (statueType === word.type) {
      const ns = streak + 1;
      setStreak(ns);
      setFeedback(`CORRECTO! ${word.word} es ${word.type.toUpperCase()}`);
      setTimeout(() => setFeedback(''), 2000);
      if (ns >= WIN_STREAK) {
        setGameState('won');
      } else {
        setTimeout(() => loadNextWord(), 2200);
      }
    } else {
      setStreak(0);
      setFeedback(`FALLO! ${word.word} es ${word.type.toUpperCase()}, no ${statueType}`);
      setTimeout(() => setFeedback(''), 2200);
      setTimeout(() => loadNextWord(), 2400);
    }
  };

  const loadNextWord = () => {
    setWordIndex(Math.floor(Math.random() * WORD_BANK.length));
    setCurrentSyllable(0);
    setPhase('listening');
  };

  const restart = () => {
    setWordIndex(Math.floor(Math.random() * WORD_BANK.length));
    setCurrentSyllable(0);
    setPhase('listening');
    setStreak(0);
    setGameState('playing');
    setFeedback('');
  };

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#1A1A2E', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 11]} fov={55} />
          <OrbitControls enablePan={false} minDistance={7} maxDistance={18} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 6, 0]} intensity={1} color="#FFCC00" />
          <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow />
          <TempleScene />
          <Statue position={[-5, 0, -4]} label="Aguda" color="#FF3B30" isHighlighted={phase === 'captured'} onClick={handleStatueClick} />
          <Statue position={[0, 0, -4.5]} label="Llana" color="#FFCC00" isHighlighted={phase === 'captured'} onClick={handleStatueClick} />
          <Statue position={[5, 0, -4]} label="Esdrujula" color="#4CD964" isHighlighted={phase === 'captured'} onClick={handleStatueClick} />
          <Gong onClick={handleGongClick} isPulsing={gongPulse} />
          {/* Floating word above gong */}
          {phase === 'listening' && word.syllables.map((syl, i) => (
            <group key={i} position={[(i - (word.syllables.length - 1) / 2) * 1.2, 3.5, 2.5]}>
              <mesh>
                <boxGeometry args={[1, 0.7, 0.2]} />
                <meshLambertMaterial color={i === currentSyllable ? '#FFCC00' : '#FFFFFF'} />
              </mesh>
              <Text position={[0, 0, 0.12]} fontSize={0.4} color="#111827" anchorX="center" anchorY="middle" fontWeight="bold">
                {syl}
              </Text>
            </group>
          ))}
          {phase === 'captured' && (
            <group position={[0, 3.5, 2.5]}>
              <mesh>
                <boxGeometry args={[word.word.length * 0.4 + 0.6, 0.9, 0.3]} />
                <meshLambertMaterial color="#4CD964" />
              </mesh>
              <Text position={[0, 0, 0.16]} fontSize={0.5} color="#FFFFFF" anchorX="center" anchorY="middle" fontWeight="bold">
                {word.word}
              </Text>
            </group>
          )}
        </Suspense>
      </Canvas>

      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="temple-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '22px' }}>
            <div>RACHA: {streak} / {WIN_STREAK}</div>
            <div className="text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {phase === 'listening' ? 'Toca el gong en la silaba FUERTE' : phase === 'captured' ? 'Alimenta a la estatua correcta' : 'Esperando...'}
            </div>
          </div>
        </div>
        <div className="pointer-events-auto bg-yellow-400 border-4 border-black p-4 max-w-md" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div style={{ fontFamily: 'VT323, monospace' }}>
            <div className="text-lg">REGLAS DE ACENTO:</div>
            <div className="text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <div>• AGUDA: ultima silaba</div>
              <div>• LLANA: penultima silaba</div>
              <div>• ESDRUJULA: antepenultima</div>
            </div>
          </div>
        </div>
        <button data-testid="temple-exit-button" onClick={() => navigate('/')} className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>SALIR</button>
      </div>

      {phase === 'listening' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10">
          <button
            data-testid="temple-gong-button"
            onClick={handleGongClick}
            className="px-12 py-5 bg-yellow-400 border-4 border-black"
            style={{ fontFamily: 'VT323, monospace', fontSize: '32px', boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
          >
            ♪ GOLPEAR GONG ♪
          </button>
        </div>
      )}

      {phase === 'captured' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10 flex gap-4">
          <button data-testid="temple-aguda-button" onClick={() => handleStatueClick('aguda')} className="px-6 py-3 border-4 border-black" style={{ backgroundColor: '#FF3B30', fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', color: '#FFFFFF' }}>AGUDA</button>
          <button data-testid="temple-llana-button" onClick={() => handleStatueClick('llana')} className="px-6 py-3 border-4 border-black" style={{ backgroundColor: '#FFCC00', fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>LLANA</button>
          <button data-testid="temple-esdrujula-button" onClick={() => handleStatueClick('esdrujula')} className="px-6 py-3 border-4 border-black" style={{ backgroundColor: '#4CD964', fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>ESDRUJULA</button>
        </div>
      )}

      {feedback && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-3 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '22px' }} data-testid="temple-feedback">
          {feedback}
        </div>
      )}

      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="temple-win-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#4CD964' }}>EMBLEMA DEL TEMPLO!</h2>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>Alimentaste {WIN_STREAK} estatuas correctas!</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="temple-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>JUGAR DE NUEVO</button>
              <button data-testid="temple-back-button" onClick={() => navigate('/')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game7Temple;
