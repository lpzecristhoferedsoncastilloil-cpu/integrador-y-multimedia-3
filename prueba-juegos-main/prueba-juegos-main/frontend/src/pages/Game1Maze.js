import React, { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

// 3x3 grid of rooms. Player starts at (1,1) center.
// Portal rooms at (0,0), (2,0), (1,2)
const GRID_SIZE = 3;
const ROOM_SIZE = 6;
const START_POS = { x: 1, y: 1 };
const PORTAL_ROOMS = [
  { x: 0, y: 0, name: 'Portal del Queso', color: '#FFCC00' },
  { x: 2, y: 0, name: 'Portal del Rescate', color: '#007AFF' },
  { x: 1, y: 2, name: 'Portal Final', color: '#4CD964' },
];

const ROOM_COLORS = ['#FFE4B5', '#FFD1DC', '#D4F1F4', '#FFE4E1', '#E6E6FA', '#F0FFF0', '#FFEFD5', '#FFF8DC', '#F5F5DC'];

const RIDDLES = [
  { hint: 'Donde sale el sol cada manana', answer: 'east', answerText: 'ESTE' },
  { hint: 'Donde se pone el sol al atardecer', answer: 'west', answerText: 'OESTE' },
  { hint: 'Donde vive Papa Noel y hace mucho frio', answer: 'north', answerText: 'NORTE' },
  { hint: 'Donde esta la Antartida y los pinguinos', answer: 'south', answerText: 'SUR' },
  { hint: 'Brujula apunta hacia... (opuesto al Sur)', answer: 'north', answerText: 'NORTE' },
  { hint: 'Direccion opuesta al Oeste', answer: 'east', answerText: 'ESTE' },
  { hint: 'Direccion opuesta al Este', answer: 'west', answerText: 'OESTE' },
  { hint: 'Direccion opuesta al Norte', answer: 'south', answerText: 'SUR' },
];

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const Room = (props) => {
  const { position, color, isPortal, portalColor, isPlayerHere, visited } = filterProps(props);
  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE - 0.5, 0.2, ROOM_SIZE - 0.5]} />
        <meshLambertMaterial color={visited ? color : '#999999'} />
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
          <meshLambertMaterial color="#3A3A3A" />
        </mesh>
      ))}
      {isPortal && (
        <group position={[0, 1, 0]}>
          <mesh>
            <cylinderGeometry args={[1, 1, 2, 16]} />
            <meshLambertMaterial color={portalColor} emissive={portalColor} emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
      {isPlayerHere && (
        <group position={[0, 0.5, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.6, 0.8, 0.4]} />
            <meshLambertMaterial color="#007AFF" />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Game1Maze = () => {
  const navigate = useNavigate();
  const [playerPos, setPlayerPos] = useState(START_POS);
  const [visitedRooms, setVisitedRooms] = useState(new Set([`${START_POS.x},${START_POS.y}`]));
  const [collectedPortals, setCollectedPortals] = useState(new Set());
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [pendingDirection, setPendingDirection] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [gameWon, setGameWon] = useState(false);

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
      setFeedback('No hay habitacion en esa direccion!');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    // Show riddle that hints toward the chosen direction
    const matchingRiddles = RIDDLES.filter(r => r.answer === direction);
    const riddle = matchingRiddles[Math.floor(Math.random() * matchingRiddles.length)];
    setCurrentRiddle(riddle);
    setPendingDirection({ direction, newX, newY });
  };

  const submitRiddleAnswer = (selectedDirection) => {
    if (!currentRiddle || !pendingDirection) return;
    if (selectedDirection === currentRiddle.answer) {
      const { newX, newY } = pendingDirection;
      setPlayerPos({ x: newX, y: newY });
      const key = `${newX},${newY}`;
      setVisitedRooms(prev => new Set([...prev, key]));
      const portal = PORTAL_ROOMS.find(p => p.x === newX && p.y === newY);
      if (portal && !collectedPortals.has(key)) {
        const newCollected = new Set([...collectedPortals, key]);
        setCollectedPortals(newCollected);
        setFeedback(`Encontraste: ${portal.name}!`);
        if (newCollected.size === PORTAL_ROOMS.length) {
          setTimeout(() => setGameWon(true), 1500);
        }
      } else {
        setFeedback('Puerta abierta! Avanzaste.');
      }
      setTimeout(() => setFeedback(''), 2500);
    } else {
      setFeedback('Respuesta incorrecta. Intenta de nuevo!');
      setTimeout(() => setFeedback(''), 2000);
    }
    setCurrentRiddle(null);
    setPendingDirection(null);
  };

  const restart = () => {
    setPlayerPos(START_POS);
    setVisitedRooms(new Set([`${START_POS.x},${START_POS.y}`]));
    setCollectedPortals(new Set());
    setGameWon(false);
    setCurrentRiddle(null);
    setPendingDirection(null);
    setFeedback('');
  };

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#87CEEB', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[12, 18, 12]} fov={50} />
          <OrbitControls enablePan={false} minDistance={15} maxDistance={30} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
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

      {/* HUD */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="maze-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}>
            <div>HABITACION: ({playerPos.x}, {playerPos.y})</div>
            <div>VISITADAS: {visitedRooms.size}/9</div>
            <div>PORTALES: {collectedPortals.size}/{PORTAL_ROOMS.length}</div>
          </div>
        </div>
        <button
          data-testid="maze-exit-button"
          onClick={() => navigate('/minigames')}
          className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black"
          style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
        >
          SALIR
        </button>
      </div>

      {/* Direction buttons */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10">
        <div className="bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <p className="text-center mb-2" style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>MOVERSE</p>
          <div className="grid grid-cols-3 gap-2" style={{ width: '180px' }}>
            <div />
            <button data-testid="move-north-button" onClick={() => attemptMove('north')} className="p-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace' }}>N</button>
            <div />
            <button data-testid="move-west-button" onClick={() => attemptMove('west')} className="p-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace' }}>O</button>
            <div className="p-3 bg-gray-200 border-4 border-black text-center" style={{ fontFamily: 'VT323, monospace' }}>·</div>
            <button data-testid="move-east-button" onClick={() => attemptMove('east')} className="p-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace' }}>E</button>
            <div />
            <button data-testid="move-south-button" onClick={() => attemptMove('south')} className="p-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace' }}>S</button>
            <div />
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-4 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '24px' }} data-testid="maze-feedback">
          {feedback}
        </div>
      )}

      {/* Riddle modal */}
      {currentRiddle && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30" data-testid="riddle-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full mx-4" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h3 className="text-3xl mb-4" style={{ fontFamily: 'VT323, monospace' }}>ACERTIJO</h3>
            <p className="mb-6 text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>{currentRiddle.hint}</p>
            <p className="mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Que direccion debes elegir?</p>
            <div className="grid grid-cols-2 gap-3">
              {['north', 'south', 'east', 'west'].map(dir => (
                <button
                  key={dir}
                  data-testid={`riddle-answer-${dir}`}
                  onClick={() => submitRiddleAnswer(dir)}
                  className="p-3 bg-yellow-400 border-4 border-black"
                  style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  {dir === 'north' ? 'NORTE' : dir === 'south' ? 'SUR' : dir === 'east' ? 'ESTE' : 'OESTE'}
                </button>
              ))}
            </div>
            <button
              data-testid="riddle-cancel-button"
              onClick={() => { setCurrentRiddle(null); setPendingDirection(null); }}
              className="w-full mt-4 p-2 bg-gray-300 border-4 border-black"
              style={{ fontFamily: 'VT323, monospace', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* Win modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="maze-win-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#4CD964' }}>VICTORIA!</h2>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>Encontraste los 3 portales del laberinto!</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="maze-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>JUGAR DE NUEVO</button>
              <button data-testid="maze-back-hub-button" onClick={() => navigate('/minigames')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game1Maze;
