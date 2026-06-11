import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { HelpCircle } from 'lucide-react';
import api from '../../services/api';

const GRID_SIZE = 3;
const ROOM_SIZE = 6;
const START_POS = { x: 1, y: 1 };
const PORTAL_ROOMS = [
  { x: 0, y: 0, name: 'Portal del Queso', color: '#facc15' },
  { x: 2, y: 0, name: 'Portal del Rescate', color: '#3b82f6' },
  { x: 1, y: 2, name: 'Portal Final', color: '#10b981' },
];

const ROOM_COLORS = ['#312e81', '#4c1d95', '#1e1b4b', '#581c87', '#030712', '#111827', '#0f172a', '#1e293b', '#334155'];

const RIDDLES = [
  { hint: 'Donde sale el sol cada mañana', answer: 'east', answerText: 'ESTE' },
  { hint: 'Donde se pone el sol al atardecer', answer: 'west', answerText: 'OESTE' },
  { hint: 'Donde vive Papá Noel y hace mucho frío', answer: 'north', answerText: 'NORTE' },
  { hint: 'Donde está la Antártida y los pingüinos', answer: 'south', answerText: 'SUR' },
  { hint: 'Brújula apunta hacia... (opuesto al Sur)', answer: 'north', answerText: 'NORTE' },
  { hint: 'Dirección opuesta al Oeste', answer: 'east', answerText: 'ESTE' },
  { hint: 'Dirección opuesta al Este', answer: 'west', answerText: 'OESTE' },
  { hint: 'Dirección opuesta al Norte', answer: 'south', answerText: 'SUR' },
];

const Room = ({ position, color, isPortal, portalColor, isPlayerHere, visited }) => {
  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE - 0.5, 0.2, ROOM_SIZE - 0.5]} />
        <meshLambertMaterial color={visited ? color : '#374151'} />
      </mesh>
      {/* Wall outlines */}
      {[
        [0, 0.5, -ROOM_SIZE / 2 + 0.1, ROOM_SIZE - 0.5, 1, 0.2],
        [0, 0.5, ROOM_SIZE / 2 - 0.1, ROOM_SIZE - 0.5, 1, 0.2],
        [-ROOM_SIZE / 2 + 0.1, 0.5, 0, 0.2, 1, ROOM_SIZE - 0.5],
        [ROOM_SIZE / 2 - 0.1, 0.5, 0, 0.2, 1, ROOM_SIZE - 0.5],
      ].map((w, i) => (
        <mesh key={i} position={[w[0], w[1], w[2]]}>
          <boxGeometry args={[w[3], w[4], w[5]]} />
          <meshLambertMaterial color="#1f2937" />
        </mesh>
      ))}
      {isPortal && (
        <group position={[0, 1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 1.8, 16]} />
            <meshLambertMaterial color={portalColor} emissive={portalColor} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
      {isPlayerHere && (
        <group position={[0, 0.5, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.8, 0.4]} />
            <meshLambertMaterial color="#a855f7" />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Game1Maze = ({ player, onFinish }) => {
  const [playerPos, setPlayerPos] = useState(START_POS);
  const [visitedRooms, setVisitedRooms] = useState(new Set([`${START_POS.x},${START_POS.y}`]));
  const [collectedPortals, setCollectedPortals] = useState(new Set());
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [pendingDirection, setPendingDirection] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id,
          game_type: 'maze',
          game_number: 3,
          level: 1,
        });
        setSessionId(res.data.id);
      } catch (e) {
        console.error('Error al iniciar sesión de juego:', e);
      }
    };
    startSession();
  }, [player]);

  const finishGame = async (correct, incorrect, total, finalScore) => {
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
        console.error('Error al guardar progreso en la base de datos:', e);
      }
    }
    onFinish({ score: finalScore, level: 1, sessionId });
  };

  const roomGrid = useMemo(() => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const portal = PORTAL_ROOMS.find(p => p.x === x && p.y === y);
        grid.push({
          x, y,
          color: ROOM_COLORS[y * GRID_SIZE + x],
          isPortal: !!portal,
          portalColor: portal?.color,
          portalName: portal?.name,
        });
      }
    }
    return grid;
  }, []);

  const attemptMove = (direction) => {
    const dx = direction === 'east' ? 1 : direction === 'west' ? -1 : 0;
    const dy = direction === 'south' ? 1 : direction === 'north' ? -1 : 0;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      setFeedback('¡No hay habitación en esa dirección!');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    const matchingRiddles = RIDDLES.filter(r => r.answer === direction);
    const riddle = matchingRiddles[Math.floor(Math.random() * matchingRiddles.length)];
    setCurrentRiddle(riddle);
    setPendingDirection({ direction, newX, newY });
  };

  const submitRiddleAnswer = (selectedDirection) => {
    if (!currentRiddle || !pendingDirection) return;
    if (selectedDirection === currentRiddle.answer) {
      setCorrectCount(c => c + 1);
      const { newX, newY } = pendingDirection;
      setPlayerPos({ x: newX, y: newY });
      const key = `${newX},${newY}`;
      setVisitedRooms(prev => new Set([...prev, key]));
      const portal = PORTAL_ROOMS.find(p => p.x === newX && p.y === newY);
      if (portal && !collectedPortals.has(key)) {
        const newCollected = new Set([...collectedPortals, key]);
        setCollectedPortals(newCollected);
        setFeedback(`¡Encontraste: ${portal.name}!`);
        if (newCollected.size === PORTAL_ROOMS.length) {
          const finalScore = (correctCount + 1) * 100;
          setTimeout(() => {
            finishGame(correctCount + 1, incorrectCount, correctCount + 1 + incorrectCount, finalScore);
          }, 1500);
        }
      } else {
        setFeedback('¡Puerta abierta! Avanzaste.');
      }
      setTimeout(() => setFeedback(''), 2500);
    } else {
      setIncorrectCount(i => i + 1);
      setFeedback('¡Respuesta incorrecta! Intenta de nuevo.');
      setTimeout(() => setFeedback(''), 2000);
    }
    setCurrentRiddle(null);
    setPendingDirection(null);
  };

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[10, 15, 10]} fov={50} />
          <OrbitControls enablePan={false} minDistance={12} maxDistance={25} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={0.9} castShadow />
          {roomGrid.map((room) => {
            const px = (room.x - 1) * ROOM_SIZE;
            const pz = (room.y - 1) * ROOM_SIZE;
            return (
              <Room
                key={`${room.x},${room.y}`}
                position={[px, 0, pz]}
                color={room.color}
                isPortal={room.isPortal}
                portalColor={room.portalColor}
                isPlayerHere={playerPos.x === room.x && playerPos.y === room.y}
                visited={visitedRooms.has(`${room.x},${room.y}`)}
              />
            );
          })}
        </Suspense>
      </Canvas>

      {/* HUD de NeuroGym (Glassmorphic) */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10 pointer-events-auto">
        <div className="font-sans text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Lobby del Laberinto</div>
          <div className="text-base font-extrabold text-purple-300">Habitáculo: ({playerPos.x}, {playerPos.y})</div>
          <div>Salas exploradas: <strong className="text-white">{visitedRooms.size} / 9</strong></div>
          <div>Portales hallados: <strong className="text-yellow-400">{collectedPortals.size} / {PORTAL_ROOMS.length}</strong></div>
        </div>
      </div>

      <button
        onClick={() => setShowHelpModal(true)}
        className="absolute top-4 right-28 p-2.5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 pointer-events-auto flex items-center justify-center"
        title="¿Cómo jugar?"
      >
        <HelpCircle className="w-5 h-5 text-indigo-300" />
      </button>

      <button
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 pointer-events-auto text-sm"
      >
        SALIR
      </button>

      {/* Controles de Dirección */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-3xl p-5 text-white shadow-2xl w-[200px]">
          <p className="text-center mb-3 font-sans font-bold text-xs uppercase tracking-widest text-purple-300">Dirección</p>
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button onClick={() => attemptMove('north')} className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl hover:scale-105 transition-all cursor-pointer shadow-md">N</button>
            <div />
            <button onClick={() => attemptMove('west')} className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl hover:scale-105 transition-all cursor-pointer shadow-md">O</button>
            <div className="flex items-center justify-center text-gray-500 font-bold bg-white/5 border border-white/10 rounded-xl select-none">·</div>
            <button onClick={() => attemptMove('east')} className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl hover:scale-105 transition-all cursor-pointer shadow-md">E</button>
            <div />
            <button onClick={() => attemptMove('south')} className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl hover:scale-105 transition-all cursor-pointer shadow-md">S</button>
            <div />
          </div>
        </div>
      </div>

      {/* Mensajes flotantes */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl z-20 text-white font-sans text-lg font-bold shadow-2xl text-center select-none animate-pulse">
          {feedback}
        </div>
      )}

      {/* Riddle modal */}
      {currentRiddle && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-auto">
          <div className="bg-slate-900/95 border border-purple-500/30 rounded-3xl p-8 max-w-md w-full mx-4 text-white shadow-2xl">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/35 rounded-xl flex items-center justify-center mb-4 text-xl">❓</div>
            <h3 className="text-2xl font-black mb-2 text-purple-300 uppercase tracking-wider">ACERTIJO</h3>
            <p className="mb-6 text-lg font-medium text-gray-200">{currentRiddle.hint}</p>
            <p className="mb-4 text-sm font-semibold text-gray-400">¿Qué dirección debes tomar para abrir la compuerta?</p>
            <div className="grid grid-cols-2 gap-3">
              {['north', 'south', 'east', 'west'].map(dir => (
                <button
                  key={dir}
                  onClick={() => submitRiddleAnswer(dir)}
                  className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl transition-all duration-200 shadow-md hover:scale-103 cursor-pointer"
                >
                  {dir === 'north' ? 'NORTE' : dir === 'south' ? 'SUR' : dir === 'east' ? 'ESTE' : 'OESTE'}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setCurrentRiddle(null); setPendingDirection(null); }}
              className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all cursor-pointer text-sm"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* Help Modal Overlay */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#131238] to-[#080a1c] border-2 border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative font-sans">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Laberinto?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Explora el laberinto tridimensional resolviendo los acertijos cardinales para desbloquear las puertas de cada habitación y encontrar los portales de escape.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Usa el panel de dirección de la brújula (N, S, E, O) abajo para intentar moverte a una habitación vecina.</li>
                  <li>Al moverte, aparecerá un <b>acertijo de orientación</b>. Léelo y responde la dirección correcta.</li>
                  <li>Si la respuesta es correcta, la puerta se abrirá y avanzarás.</li>
                  <li>Encuentra los 3 portales especiales (Queso, Rescate y Final) para completar el laberinto.</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-6 bg-emerald-500 rounded flex items-center justify-center text-[9px] font-black text-white shadow">NORTE</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡RESPUESTA CORRECTA! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Si tu dirección coincide con la respuesta del acertijo, la puerta se abre.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-6 bg-rose-500 rounded flex items-center justify-center text-[9px] font-black text-white shadow">SUR</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡RESPUESTA INCORRECTA! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si fallas el acertijo, no podrás pasar y se registrará un intento erróneo.</p>
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

export default Game1Maze;
