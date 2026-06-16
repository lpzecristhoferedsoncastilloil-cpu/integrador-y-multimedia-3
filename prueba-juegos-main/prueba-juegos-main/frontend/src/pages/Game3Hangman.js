import React, { useState, useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Billboard } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

const WORDS = [
  { word: 'MANZANA', hint: 'Fruta roja que cae de un arbol' },
  { word: 'ELEFANTE', hint: 'Animal gigante con trompa' },
  { word: 'BICICLETA', hint: 'Vehiculo de dos ruedas' },
  { word: 'MARIPOSA', hint: 'Insecto con alas de colores' },
  { word: 'CASTILLO', hint: 'Donde viven los reyes' },
  { word: 'ESCUELA', hint: 'Lugar donde aprendemos' },
  { word: 'PELOTA', hint: 'Objeto redondo para jugar' },
  { word: 'JIRAFA', hint: 'Animal de cuello muy largo' },
  { word: 'PLATANO', hint: 'Fruta amarilla y curva' },
  { word: 'DRAGON', hint: 'Criatura mitica que escupe fuego' },
];

const ALPHABET = 'ABCDEFGHIJKLMNNOPQRSTUVWXYZ'.split('').filter((v, i, a) => a.indexOf(v) === i);
const MAX_FAILS = 6;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const LetterBlock = (props) => {
  const { letter, position, isUsed, isCorrect, onClick } = filterProps(props);
  const meshRef = useRef();
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current && !isUsed) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.15;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isUsed && onClick) onClick(letter);
  };

  const color = isUsed ? (isCorrect ? '#4CD964' : '#FF3B30') : '#FFCC00';

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.3]} />
        <meshLambertMaterial color={color} opacity={isUsed ? 0.5 : 1} transparent />
      </mesh>
      <Text position={[0, 0, 0.16]} fontSize={0.45} color="#111827" anchorX="center" anchorY="middle" fontWeight="bold">
        {letter}
      </Text>
    </group>
  );
};

const HangmanStructure = (props) => {
  const { fails } = filterProps(props);
  return (
    <group position={[-6, 0, 0]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 1]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Vertical pole */}
      {fails >= 1 && (
        <mesh position={[-1, 2.2, 0]}>
          <boxGeometry args={[0.25, 4, 0.25]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      )}
      {/* Horizontal beam */}
      {fails >= 2 && (
        <mesh position={[0, 4.1, 0]}>
          <boxGeometry args={[2.2, 0.25, 0.25]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      )}
      {/* Rope */}
      {fails >= 3 && (
        <mesh position={[1, 3.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshLambertMaterial color="#444444" />
        </mesh>
      )}
      {/* Head */}
      {fails >= 4 && (
        <mesh position={[1, 3.1, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshLambertMaterial color="#FFD1A4" />
        </mesh>
      )}
      {/* Body */}
      {fails >= 5 && (
        <mesh position={[1, 2.2, 0]}>
          <boxGeometry args={[0.4, 1.2, 0.3]} />
          <meshLambertMaterial color="#007AFF" />
        </mesh>
      )}
      {/* Arms + Legs */}
      {fails >= 6 && (
        <>
          <mesh position={[0.6, 2.3, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshLambertMaterial color="#007AFF" />
          </mesh>
          <mesh position={[1.4, 2.3, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshLambertMaterial color="#007AFF" />
          </mesh>
          <mesh position={[0.8, 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshLambertMaterial color="#333333" />
          </mesh>
          <mesh position={[1.2, 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshLambertMaterial color="#333333" />
          </mesh>
        </>
      )}
    </group>
  );
};

const DungeonScene = (props) => {
  const { } = filterProps(props);
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[24, 0.1, 16]} />
        <meshLambertMaterial color="#3A3A4A" />
      </mesh>
      {/* Walls back */}
      <mesh position={[0, 3, -8]}>
        <boxGeometry args={[24, 6, 0.4]} />
        <meshLambertMaterial color="#5A5A6A" />
      </mesh>
      {/* Torch glow accents */}
      {[[-8, 2, -7.7], [8, 2, -7.7], [0, 4, -7.7]].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial color="#FFA500" />
        </mesh>
      ))}
    </group>
  );
};

const Game3Hangman = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [fails, setFails] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [feedback, setFeedback] = useState('');

  const currentWord = WORDS[wordIndex];
  const wordLetters = useMemo(() => currentWord.word.split(''), [currentWord]);
  const correctLetters = useMemo(() => new Set(wordLetters), [wordLetters]);

  const handleLetterClick = (letter) => {
    if (gameState !== 'playing' || guessedLetters.has(letter)) return;
    const newGuessed = new Set([...guessedLetters, letter]);
    setGuessedLetters(newGuessed);

    if (correctLetters.has(letter)) {
      setFeedback(`Correcto! "${letter}" esta en la palabra.`);
      // Check win
      const allRevealed = wordLetters.every(l => newGuessed.has(l));
      if (allRevealed) {
        setGameState('won');
      }
    } else {
      const newFails = fails + 1;
      setFails(newFails);
      setFeedback(`Fallo! "${letter}" no esta en la palabra.`);
      if (newFails >= MAX_FAILS) {
        setGameState('lost');
      }
    }
    setTimeout(() => setFeedback(''), 1500);
  };

  const restart = () => {
    const newIdx = (wordIndex + 1) % WORDS.length;
    setWordIndex(newIdx);
    setGuessedLetters(new Set());
    setFails(0);
    setGameState('playing');
    setFeedback('');
  };

  const displayWord = wordLetters.map(l => guessedLetters.has(l) ? l : '_').join(' ');

  // Position letters in a 6x5 grid
  const letterPositions = useMemo(() => {
    const cols = 7;
    const rows = Math.ceil(ALPHABET.length / cols);
    return ALPHABET.map((letter, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        letter,
        position: [
          (col - cols / 2 + 0.5) * 1.1 + 3,
          0.5,
          (row - rows / 2 + 0.5) * 1.1 + 2,
        ],
      };
    });
  }, []);

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#2A2A3A', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 8, 11]} fov={55} />
          <OrbitControls enablePan={false} minDistance={8} maxDistance={20} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 8, 5]} intensity={0.8} color="#FFCC00" />
          <directionalLight position={[5, 10, 5]} intensity={0.6} castShadow />
          <DungeonScene />
          <HangmanStructure fails={fails} />
          {letterPositions.map(({ letter, position }) => (
            <LetterBlock
              key={letter}
              letter={letter}
              position={position}
              isUsed={guessedLetters.has(letter)}
              isCorrect={correctLetters.has(letter)}
              onClick={handleLetterClick}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* HUD - Word and Hint */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="hangman-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '22px' }}>
            <div>FALLOS: {fails} / {MAX_FAILS}</div>
            <div>LETRAS USADAS: {guessedLetters.size}</div>
          </div>
        </div>
        <div className="pointer-events-auto bg-yellow-400 border-4 border-black p-4 max-w-lg" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div style={{ fontFamily: 'VT323, monospace' }}>
            <div className="text-lg">PISTA:</div>
            <div className="text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>{currentWord.hint}</div>
          </div>
        </div>
        <button
          data-testid="hangman-exit-button"
          onClick={() => navigate('/minigames')}
          className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black"
          style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
        >
          SALIR
        </button>
      </div>

      {/* Word display */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-none z-10">
        <div className="bg-white border-4 border-black p-6" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="hangman-word">
          <p className="text-center text-5xl tracking-widest" style={{ fontFamily: 'VT323, monospace', color: '#111827' }}>
            {displayWord}
          </p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-3 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '22px' }} data-testid="hangman-feedback">
          {feedback}
        </div>
      )}

      {/* Win modal */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="hangman-win-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#4CD964' }}>VICTORIA!</h2>
            <p className="mb-2 text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>Adivinaste la palabra:</p>
            <p className="text-3xl mb-6" style={{ fontFamily: 'VT323, monospace' }}>{currentWord.word}</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="hangman-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>NUEVA PALABRA</button>
              <button data-testid="hangman-back-hub-button" onClick={() => navigate('/minigames')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}

      {/* Lost modal */}
      {gameState === 'lost' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="hangman-lost-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#FF3B30' }}>PERDISTE</h2>
            <p className="mb-2 text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>La palabra era:</p>
            <p className="text-3xl mb-6" style={{ fontFamily: 'VT323, monospace' }}>{currentWord.word}</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="hangman-restart-button-lost" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>REINTENTAR</button>
              <button data-testid="hangman-back-hub-button-lost" onClick={() => navigate('/minigames')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game3Hangman;
