import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Settings, Play, Info, HelpCircle } from 'lucide-react';
import api from '../../services/api';

// Word recipes grouped by 6 levels (3 words per level)
const LEVELS_RECIPES = [
  // Level 1: Very Easy (2 parts, prefix visible)
  [
    { parts: ['DES', 'PEINAR'], full: 'DESPEINAR', meaning: 'Deshacer el peinado o despeinar el cabello' },
    { parts: ['IN', 'JUSTO'], full: 'INJUSTO', meaning: 'Que no es justo o no es equitativo' },
    { parts: ['DES', 'ATAR'], full: 'DESATAR', meaning: 'Soltar una cuerda, un nudo o un lazo' },
  ],
  // Level 2: Easy (2 parts, prefix visible)
  [
    { parts: ['RE', 'ESCRIBIR'], full: 'REESCRIBIR', meaning: 'Escribir de nuevo un texto o historia' },
    { parts: ['SUB', 'SUELO'], full: 'SUBSUELO', meaning: 'Terreno que está debajo de la tierra' },
    { parts: ['IN', 'ÚTIL'], full: 'INÚTIL', meaning: 'Que no sirve para nada o no tiene utilidad' },
  ],
  // Level 3: Medium (2 parts, prefix visible)
  [
    { parts: ['TELE', 'VISIÓN'], full: 'TELEVISIÓN', meaning: 'Transmisión de imágenes y sonidos a distancia' },
    { parts: ['ANTI', 'VIRUS'], full: 'ANTIVIRUS', meaning: 'Programa que combate los virus de computadora' },
    { parts: ['PRE', 'HISTORIA'], full: 'PREHISTORIA', meaning: 'Época histórica antes del invento de la escritura' },
  ],
  // Level 4: Medium-Hard (2 parts, prefix visible)
  [
    { parts: ['SUPER', 'HÉROE'], full: 'SUPERHÉROE', meaning: 'Personaje de cómic con poderes extraordinarios' },
    { parts: ['CONTRA', 'DECIR'], full: 'CONTRADECIR', meaning: 'Decir lo contrario de lo que otra persona afirma' },
    { parts: ['MULTI', 'COLOR'], full: 'MULTICOLOR', meaning: 'Que tiene muchos colores diferentes' },
  ],
  // Level 5: Hard (3 parts, all empty slots to be filled!)
  [
    { parts: ['IN', 'ROM', 'PIBLE'], full: 'INROMPIBLE', meaning: 'Algo sumamente resistente que no se puede romper' },
    { parts: ['DES', 'COLO', 'RAR'], full: 'DESCOLORAR', meaning: 'Quitar o perder el color de un objeto o prenda' },
    { parts: ['SUB', 'MA', 'RINO'], full: 'SUBMARINO', meaning: 'Nave o barco capaz de viajar bajo el agua del mar' },
  ],
  // Level 6: Very Hard (3 parts, all empty slots to be filled!)
  [
    { parts: ['SUPER', 'MERC', 'ADO'], full: 'SUPERMERCADO', meaning: 'Establecimiento comercial grande de alimentos' },
    { parts: ['IN', 'COM', 'PLETO'], full: 'INCOMPLETO', meaning: 'Que le falta alguna parte y no está terminado' },
    { parts: ['DES', 'A', 'CORDAR'], full: 'DESACORDAR', meaning: 'No estar de acuerdo o romper el consenso' },
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
  // Extract last part
  const lastIndex = LEVELS_RECIPES[level - 1][0].parts.length - 1;
  const current = LEVELS_RECIPES[level - 1].map(r => r.parts[lastIndex]);
  const others = LEVELS_RECIPES.filter((_, idx) => idx !== level - 1).flatMap(l => l.map(r => r.parts[r.parts.length - 1]));
  const uniqueOthers = [...new Set(others)].filter(s => !current.includes(s));
  const selectedOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...new Set([...current, ...selectedOthers])];
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

const Game4SyllableMachine = ({ player, onFinish }) => {
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

  // Spawn blocks on the two parallel conveyor belts (Prefixes/Roots on Belt 1, Suffixes on Belt 2)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawn = () => {
      if (Date.now() < jamUntil) return;
      setBlocks(prev => {
        if (prev.length >= 8) return prev;

        const isThreeParts = recipe.parts.length === 3;
        const spawnOnBelt1 = Math.random() < 0.5;

        if (spawnOnBelt1) {
          // Belt 1: Pink blocks (Prefixes/Roots) traveling Left to Right (x starts at -8)
          const isTooClose = prev.some(b => b.z === -0.8 && b.x < -5.0);
          if (isTooClose) return prev;

          const prefixPool = getPrefixPool(currentLevel);
          let pool = prefixPool;
          if (isThreeParts) {
            // Mix in the root part text to spawn pool
            const rootPool = LEVELS_RECIPES[currentLevel - 1].map(r => r.parts[1]);
            pool = [...prefixPool, ...rootPool];
          }
          const text = pool[Math.floor(Math.random() * pool.length)];

          return [...prev, {
            id: blockIdRef.current++,
            text,
            z: -0.8,
            colorType: 'pink',
            x: -8,
            spawnTime: Date.now(),
          }];
        } else {
          // Belt 2: Cyan blocks (Suffixes) traveling Right to Left (x starts at 8)
          const isTooClose = prev.some(b => b.z === 0.8 && b.x > 5.0);
          if (isTooClose) return prev;

          const suffixPool = getSuffixPool(currentLevel);
          const text = suffixPool[Math.floor(Math.random() * suffixPool.length)];

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
    const isThreeParts = recipeParts.length === 3;

    if (!isThreeParts) {
      // 2-part words (Levels 1-4): suffix is pre-filled, guess the prefix
      if (block.text === recipeParts[0]) {
        const newLevelScore = levelScore + 1;
        const newCorrectCount = correctCount + 1;
        setLevelScore(newLevelScore);
        setCorrectCount(newCorrectCount);
        setFeedback(`¡CORRECTO! ${block.text} + ${recipeParts[1]} = ${recipe.full}`);
        setBlocks(prev => prev.filter(b => b.id !== block.id));
        setSelectedBlocks([block]);

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
        handleIncorrectClick();
      }
    } else {
      // 3-part words (Levels 5-6): all empty slots, guess in order (prefix -> root -> suffix)
      const currentStep = selectedBlocks.length; // 0, 1, or 2
      if (block.text === recipeParts[currentStep]) {
        const nextBlocks = [...selectedBlocks, block];
        setSelectedBlocks(nextBlocks);
        setBlocks(prev => prev.filter(b => b.id !== block.id));
        
        if (currentStep === 0) {
          setFeedback(`¡Bien! "${block.text}" colocado. Elige la raíz (2ª parte).`);
          setTimeout(() => setFeedback(''), 1500);
        } else if (currentStep === 1) {
          setFeedback(`¡Bien! "${block.text}" colocada. Elige el sufijo (3ª parte).`);
          setTimeout(() => setFeedback(''), 1500);
        } else if (currentStep === 2) {
          const newLevelScore = levelScore + 1;
          const newCorrectCount = correctCount + 1;
          setLevelScore(newLevelScore);
          setCorrectCount(newCorrectCount);
          setFeedback(`¡CORRECTO! ${recipeParts[0]} + ${recipeParts[1]} + ${recipeParts[2]} = ${recipe.full}`);
          
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
        }
      } else {
        handleIncorrectClick();
      }
    }
  };

  const handleIncorrectClick = () => {
    const newIncorrectCount = incorrectCount + 1;
    setIncorrectCount(newIncorrectCount);
    setFeedback('¡ERROR! Cortocircuito - Banda atascada 3s');
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
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Línea de Ensamblaje</div>
          <div className="text-base font-extrabold text-purple-300">Nivel: {currentLevel} / 6</div>
          <div className="text-sm font-semibold text-indigo-300">Progreso Nivel: {levelScore} / {LEVEL_WIN_SCORE}</div>
          <div className="text-xs text-emerald-400 font-medium">Puntaje Total: {correctCount * 200}</div>
          <div className="text-xs text-rose-400 font-bold">Errores: {incorrectCount} / {MAX_FAILS}</div>
          <div className="text-[11px] text-gray-300 mt-1">
            {selectedBlocks.length > 0 ? (
              <span>Armando: {selectedBlocks.map(b => b.text).join(' + ')}</span>
            ) : (
              <span>Selecciona un bloque para comenzar</span>
            )}
          </div>
        </div>
      </div>

      {/* Hints HUD */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-sm text-center z-10">
        <div className="font-sans text-sm flex flex-col items-center">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> ENSAMBLA LA PALABRA
          </div>
          <div className="text-indigo-200 font-bold mb-1 text-sm">
            {recipe.parts.length === 2 ? (
              <>
                Combina: <span className="text-pink-400 font-extrabold">{selectedBlocks.length === 1 ? selectedBlocks[0].text : '[Prefijo]'}</span> + <span className="text-cyan-400 font-black">{recipe.parts[1]}</span>
              </>
            ) : (
              <>
                Combina: <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 1 ? selectedBlocks[0].text : '[Prefijo]'}</span> + <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 2 ? selectedBlocks[1].text : '[Raíz]'}</span> + <span className="text-cyan-400 font-black">{selectedBlocks.length >= 3 ? selectedBlocks[2].text : '[Sufijo]'}</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-gray-400 italic">
            Significado: "{recipe.meaning}"
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
                Combina sílabas en las dos líneas de montaje paralelas para construir la palabra descrita en la pista central.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Lee la fórmula central (ej. <i>Combina: [Prefijo] + <b>PEINAR</b></i>).</li>
                  <li>Los bloques <b>Rosas (Prefijos/Raíces)</b> avanzan en la banda de atrás (de izquierda a derecha).</li>
                  <li>Los bloques <b>Azules (Sufijos)</b> avanzan en la banda de adelante (de derecha a izquierda).</li>
                  <li>En los niveles 5 y 6, debes llenar 3 espacios vacíos haciendo clic en orden: Prefijo + Raíz + Sufijo.</li>
                  <li>¡Evita fallar 10 veces para no sobrecargar el sistema!</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-8 h-6 bg-emerald-500 rounded flex items-center justify-center text-[10px] font-black text-white">DES</div>
                    <div className="w-11 h-6 bg-emerald-500 rounded flex items-center justify-center text-[9px] font-black text-white">PEINAR</div>
                  </div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs animate-pulse">¡CORRECTO! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Si se ensamblan bien, sumas progreso.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-8 h-6 bg-rose-500 rounded flex items-center justify-center text-[10px] font-black text-white">IN</div>
                    <div className="w-8 h-6 bg-cyan-500 rounded flex items-center justify-center text-[10px] font-black text-white">VIRUS</div>
                  </div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs animate-pulse">¡INCORRECTO! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si fallas, la banda se atascará 3 segundos. Máximo 10 fallas.</p>
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

export default Game4SyllableMachine;
