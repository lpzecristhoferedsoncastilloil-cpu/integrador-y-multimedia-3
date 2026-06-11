import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { HelpCircle, RefreshCw, LogOut, Trophy } from 'lucide-react';
import api from '../../services/api';

const WORDS_EASY = [
  { word: 'SOL', hint: 'Brilla de día en el cielo' },
  { word: 'CASA', hint: 'Lugar donde vivimos con la familia' },
  { word: 'GATO', hint: 'Mascota que maúlla y caza ratones' },
  { word: 'PATO', hint: 'Ave de granja que hace cua cua' },
  { word: 'LUNA', hint: 'Brilla de noche en el cielo' },
  { word: 'MESA', hint: 'Mueble para comer o escribir' },
  { word: 'LAPIZ', hint: 'Lo usas para escribir o dibujar' },
  { word: 'NUBE', hint: 'Es blanca o gris y flota en el cielo' },
];

const WORDS_MEDIUM = [
  { word: 'ESCUELA', hint: 'Lugar donde aprendemos y jugamos' },
  { word: 'JIRAFA', hint: 'Animal de cuello muy largo y manchas' },
  { word: 'PELOTA', hint: 'Objeto redondo para patear o lanzar' },
  { word: 'PLATANO', hint: 'Fruta amarilla que le gusta a los monos' },
  { word: 'DRAGON', hint: 'Criatura mítica que vuela y escupe fuego' },
  { word: 'ESTRELLA', hint: 'Cuerpo celeste que brilla de noche' },
  { word: 'VENTANA', hint: 'Abertura en la pared para ver afuera' },
  { word: 'ZAPATO', hint: 'Prenda para proteger el pie al caminar' },
];

const WORDS_HARD = [
  { word: 'BICICLETA', hint: 'Vehículo de dos ruedas con pedales' },
  { word: 'ELEFANTE', hint: 'Animal terrestre muy grande con trompa' },
  { word: 'MARIPOSA', hint: 'Insecto volador con alas coloridas' },
  { word: 'CASTILLO', hint: 'Fortaleza antigua donde vivían reyes' },
  { word: 'DURAZNO', hint: 'Fruta dulce con piel aterciopelada' },
  { word: 'ASTRONAUTA', hint: 'Persona que viaja al espacio exterior' },
  { word: 'BIBLIOTECA', hint: 'Lugar donde hay muchos libros' },
  { word: 'DINOSAURIO', hint: 'Reptil gigante extinto hace millones de años' },
];

const getWordForLevel = (level) => {
  let pool = WORDS_EASY;
  if (level === 3 || level === 4) {
    pool = WORDS_MEDIUM;
  } else if (level === 5 || level === 6) {
    pool = WORDS_HARD;
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').filter((v, i, a) => a.indexOf(v) === i);
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

  // Space theme colors: Unused purple, Correct emerald, Incorrect rose
  const color = isUsed ? (isCorrect ? '#10b981' : '#f43f5e') : '#8b5cf6';

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.3]} />
        <meshLambertMaterial color={color} opacity={isUsed ? 0.5 : 1} transparent />
      </mesh>
      <Text position={[0, 0, 0.16]} fontSize={0.4} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
        {letter}
      </Text>
    </group>
  );
};

const HangmanStructure = (props) => {
  const { fails } = filterProps(props);
  const structureColor = '#6366f1'; // Indigo structure
  const ropeColor = '#a78bfa';

  return (
    <group position={[-5, 0, 0]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 1]} />
        <meshLambertMaterial color={structureColor} />
      </mesh>
      {/* Vertical pole */}
      {fails >= 1 && (
        <mesh position={[-1, 2.2, 0]}>
          <boxGeometry args={[0.25, 4, 0.25]} />
          <meshLambertMaterial color={structureColor} />
        </mesh>
      )}
      {/* Horizontal beam */}
      {fails >= 2 && (
        <mesh position={[0, 4.1, 0]}>
          <boxGeometry args={[2.2, 0.25, 0.25]} />
          <meshLambertMaterial color={structureColor} />
        </mesh>
      )}
      {/* Rope */}
      {fails >= 3 && (
        <mesh position={[1, 3.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshLambertMaterial color={ropeColor} />
        </mesh>
      )}
      {/* Head */}
      {fails >= 4 && (
        <mesh position={[1, 3.1, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshLambertMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={0.2} />
        </mesh>
      )}
      {/* Body */}
      {fails >= 5 && (
        <mesh position={[1, 2.2, 0]}>
          <boxGeometry args={[0.4, 1.2, 0.3]} />
          <meshLambertMaterial color="#38bdf8" />
        </mesh>
      )}
      {/* Arms + Legs */}
      {fails >= 6 && (
        <>
          <mesh position={[0.6, 2.3, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshLambertMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[1.4, 2.3, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshLambertMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.8, 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
          <mesh position={[1.2, 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
        </>
      )}
    </group>
  );
};

const DungeonScene = () => {
  return (
    <group>
      {/* Floor - lighter and more vibrant indigo */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[24, 0.1, 16]} />
        <meshLambertMaterial color="#312e81" />
      </mesh>
      {/* Walls back - lighter purple/indigo for color variety */}
      <mesh position={[0, 3, -8]}>
        <boxGeometry args={[24, 6, 0.4]} />
        <meshLambertMaterial color="#4f46e5" />
      </mesh>
      {/* Torch glow accents - pink glowing spheres with point lights */}
      {[[-8, 2.5, -7.7], [8, 2.5, -7.7], [0, 4.5, -7.7]].map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#ec4899" />
          </mesh>
          <pointLight color="#ec4899" intensity={0.8} distance={6} />
        </group>
      ))}
    </group>
  );
};

const Game3Hangman = ({ player, onFinish }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState(() => getWordForLevel(1));
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [fails, setFails] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [feedback, setFeedback] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const wordLetters = useMemo(() => currentWord.word.split(''), [currentWord]);
  const correctLetters = useMemo(() => new Set(wordLetters), [wordLetters]);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'hangman',
          game_number: 5,
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

  const handleLetterClick = (letter) => {
    if (gameState !== 'playing' || guessedLetters.has(letter)) return;
    const newGuessed = new Set([...guessedLetters, letter]);
    setGuessedLetters(newGuessed);

    if (correctLetters.has(letter)) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      setFeedback(`¡Correcto! "${letter}" está en la palabra.`);
      
      const allRevealed = wordLetters.every(l => newGuessed.has(l));
      if (allRevealed) {
        if (currentLevel < 6) {
          // Go to next level
          const nextLvl = currentLevel + 1;
          setFeedback(`¡Nivel ${currentLevel} Completado! Avanzando al nivel ${nextLvl}...`);
          setTimeout(() => {
            setCurrentLevel(nextLvl);
            setCurrentWord(getWordForLevel(nextLvl));
            setGuessedLetters(new Set());
            setFails(0);
            setFeedback('');
          }, 1500);
        } else {
          // Won the final level
          setGameState('won');
          const finalScore = newCorrectCount * 150;
          finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, finalScore, 6);
        }
      }
    } else {
      const newFails = fails + 1;
      setFails(newFails);
      const newIncorrectCount = incorrectCount + 1;
      setIncorrectCount(newIncorrectCount);
      setFeedback(`¡Fallo! "${letter}" no está en la palabra.`);
      if (newFails >= MAX_FAILS) {
        setGameState('lost');
        finishGame(correctCount, newIncorrectCount, correctCount + newIncorrectCount, correctCount * 100, currentLevel);
      }
    }

    const allRevealed = wordLetters.every(l => newGuessed.has(l));
    if (!allRevealed && fails < MAX_FAILS) {
      setTimeout(() => setFeedback(''), 1500);
    }
  };

  const restart = () => {
    setCurrentLevel(1);
    setCurrentWord(getWordForLevel(1));
    setGuessedLetters(new Set());
    setFails(0);
    setGameState('playing');
    setFeedback('');
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  const displayWord = wordLetters.map(l => guessedLetters.has(l) ? l : '_').join(' ');

  const letterPositions = useMemo(() => {
    const cols = 9;
    const rows = Math.ceil(ALPHABET.length / cols);
    return ALPHABET.map((letter, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        letter,
        position: [
          (col - cols / 2 + 0.5) * 1.0 + 3.5,
          0.5,
          (row - rows / 2 + 0.5) * 1.0 + 2,
        ],
      };
    });
  }, []);

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 9.6, 13.2]} fov={55} />
          <OrbitControls enablePan={false} minDistance={10} maxDistance={24} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 8, 5]} intensity={1.0} color="#f3e8ff" />
          <directionalLight position={[5, 10, 5]} intensity={0.9} castShadow />
          {/* Scaled entire 3D content by 1.2 to make it 20% larger */}
          <group scale={1.2}>
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
          </group>
        </Suspense>
      </Canvas>

      {/* HUD - Glassmorphic */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10">
        <div className="font-sans text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Rescate de Letras</div>
          <div className="text-base font-extrabold text-purple-300">Nivel: {currentLevel} / 6</div>
          <div className="text-xs font-semibold text-indigo-300">Dificultad: {currentLevel <= 2 ? 'Fácil' : currentLevel <= 4 ? 'Medio' : 'Difícil'}</div>
          <div className="text-sm font-medium text-rose-400">Fallos: {fails} / {MAX_FAILS}</div>
          <div className="text-xs text-emerald-400">Puntaje Total: {correctCount * 150}</div>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-xs text-center z-10">
        <div className="font-sans text-sm flex flex-col items-center">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> PISTA
          </div>
          <div className="text-indigo-200 font-semibold">{currentWord.hint}</div>
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

      {/* Word display */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl text-4xl tracking-widest font-black uppercase text-center select-none z-10 font-mono">
        {displayWord}
      </div>

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
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Rescate de las Letras?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Rescata al astronauta adivinando las letras ocultas antes de que se complete el soporte de lanzamiento.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Lee la <b>pista central</b> arriba (ej. <i>PISTA: Animal gigante con trompa</i>).</li>
                  <li>Haz clic sobre las letras en 3D flotantes en el espacio.</li>
                  <li>Las letras correctas completan los espacios vacíos del astronauta abajo.</li>
                  <li>Las letras incorrectas construyen una parte del soporte. ¡Evita llegar a 6 fallos!</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-xs font-black text-white shadow">A</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡LETRA CORRECTA! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Se volverá verde, se colocará en la palabra y sumarás progreso.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-6 h-6 bg-rose-500 rounded flex items-center justify-center text-xs font-black text-white shadow">X</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡LETRA INCORRECTA! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Se volverá roja, se sumará 1 fallo y aparecerá una pieza del ahorcado.</p>
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

export default Game3Hangman;
