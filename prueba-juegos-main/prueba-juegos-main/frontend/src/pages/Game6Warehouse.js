import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

const ROUNDS = [
  {
    category: 'VERBOS',
    instruction: 'Encuentra solo las ACCIONES (verbos)',
    words: ['CORRER', 'SALTAR', 'COMER', 'JUGAR'],
    intruders: ['MESA', 'PERRO', 'AZUL', 'CASA'],
  },
  {
    category: 'SUSTANTIVOS',
    instruction: 'Encuentra solo los OBJETOS (sustantivos)',
    words: ['LIBRO', 'SILLA', 'PERRO', 'FLOR'],
    intruders: ['ROJO', 'COMER', 'GRAN', 'BAJAR'],
  },
  {
    category: 'ADJETIVOS',
    instruction: 'Encuentra solo las CUALIDADES (adjetivos)',
    words: ['ALTO', 'AZUL', 'FELIZ', 'GRAN'],
    intruders: ['MESA', 'CORRER', 'GATO', 'JUGAR'],
  },
];

const GRID_SIZE = 10;
const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

// Build a grid with the words placed horizontally/vertically and fill rest with random letters
const buildGrid = (words, intruders) => {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  const placedWords = [];
  const allToPlace = [...words.map(w => ({ word: w, isTarget: true })), ...intruders.map(w => ({ word: w, isTarget: false }))];

  for (const item of allToPlace) {
    let placed = false;
    for (let attempt = 0; attempt < 60 && !placed; attempt++) {
      const horizontal = Math.random() < 0.5;
      const len = item.word.length;
      const maxR = horizontal ? GRID_SIZE : GRID_SIZE - len;
      const maxC = horizontal ? GRID_SIZE - len : GRID_SIZE;
      const r = Math.floor(Math.random() * maxR);
      const c = Math.floor(Math.random() * maxC);
      // Check space free
      let canPlace = true;
      for (let i = 0; i < len; i++) {
        const rr = horizontal ? r : r + i;
        const cc = horizontal ? c + i : c;
        if (grid[rr][cc] !== null) { canPlace = false; break; }
      }
      if (canPlace) {
        const positions = [];
        for (let i = 0; i < len; i++) {
          const rr = horizontal ? r : r + i;
          const cc = horizontal ? c + i : c;
          grid[rr][cc] = item.word[i];
          positions.push([rr, cc]);
        }
        placedWords.push({ word: item.word, isTarget: item.isTarget, positions, direction: horizontal ? 'H' : 'V' });
        placed = true;
      }
    }
  }
  // Fill empties with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  return { grid, placedWords };
};

const WarehouseScene = (props) => {
  const { } = filterProps(props);
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[30, 0.1, 20]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, 4, -8]}>
        <boxGeometry args={[30, 8, 0.4]} />
        <meshLambertMaterial color="#A0826D" />
      </mesh>
      {/* Shelves */}
      {[-10, -5, 5, 10].map(x => (
        <group key={x}>
          <mesh position={[x, 1.5, -7.5]}>
            <boxGeometry args={[2.5, 3, 0.5]} />
            <meshLambertMaterial color="#5D4037" />
          </mesh>
          <mesh position={[x, 0.8, -7.5]}>
            <boxGeometry args={[2.3, 0.1, 0.7]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          <mesh position={[x, 1.8, -7.5]}>
            <boxGeometry args={[2.3, 0.1, 0.7]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          {/* Books */}
          {[-0.8, -0.3, 0.2, 0.7].map((bx, i) => (
            <mesh key={i} position={[x + bx, 1.15, -7.4]}>
              <boxGeometry args={[0.3, 0.5, 0.3]} />
              <meshLambertMaterial color={['#FF3B30', '#FFCC00', '#007AFF', '#4CD964'][i]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const Game6Warehouse = () => {
  const navigate = useNavigate();
  const [roundIndex, setRoundIndex] = useState(0);
  const [gridData, setGridData] = useState(() => buildGrid(ROUNDS[0].words, ROUNDS[0].intruders));
  const [foundWords, setFoundWords] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const round = ROUNDS[roundIndex];

  const selectedCells = useMemo(() => {
    if (!startCell || !endCell) return [];
    const [r1, c1] = startCell;
    const [r2, c2] = endCell;
    const cells = [];
    if (r1 === r2) {
      const min = Math.min(c1, c2), max = Math.max(c1, c2);
      for (let c = min; c <= max; c++) cells.push([r1, c]);
    } else if (c1 === c2) {
      const min = Math.min(r1, r2), max = Math.max(r1, r2);
      for (let r = min; r <= max; r++) cells.push([r, c1]);
    }
    return cells;
  }, [startCell, endCell]);

  const handleCellMouseDown = (r, c) => {
    if (gameState !== 'playing') return;
    setSelecting(true);
    setStartCell([r, c]);
    setEndCell([r, c]);
  };

  const handleCellMouseEnter = (r, c) => {
    if (!selecting) return;
    setEndCell([r, c]);
  };

  const handleMouseUp = () => {
    if (!selecting || !startCell || !endCell) {
      setSelecting(false);
      return;
    }
    setSelecting(false);
    // Build word
    const word = selectedCells.map(([r, c]) => gridData.grid[r][c]).join('');
    const reversed = word.split('').reverse().join('');
    
    const matchTarget = gridData.placedWords.find(pw =>
      pw.isTarget && !foundWords.has(pw.word) &&
      (pw.word === word || pw.word === reversed) &&
      selectedCells.length === pw.word.length &&
      selectedCells.every(([r, c]) => pw.positions.some(([pr, pc]) => pr === r && pc === c))
    );
    
    const matchIntruder = gridData.placedWords.find(pw =>
      !pw.isTarget && (pw.word === word || pw.word === reversed) &&
      selectedCells.length === pw.word.length
    );

    if (matchTarget) {
      const newFound = new Set([...foundWords, matchTarget.word]);
      setFoundWords(newFound);
      setFeedback(`CORRECTO! "${matchTarget.word}" es ${round.category.slice(0, -1)}`);
      setTimeout(() => setFeedback(''), 1500);
      if (newFound.size === round.words.length) {
        setTimeout(() => setGameState('won'), 800);
      }
    } else if (matchIntruder) {
      setFeedback(`INTRUSO! "${matchIntruder.word}" NO es ${round.category.slice(0, -1)}`);
      setTimeout(() => setFeedback(''), 1800);
    } else {
      setFeedback('No es una palabra valida');
      setTimeout(() => setFeedback(''), 1200);
    }
    setStartCell(null);
    setEndCell(null);
  };

  const restart = () => {
    const newIdx = (roundIndex + 1) % ROUNDS.length;
    setRoundIndex(newIdx);
    setGridData(buildGrid(ROUNDS[newIdx].words, ROUNDS[newIdx].intruders));
    setFoundWords(new Set());
    setGameState('playing');
    setFeedback('');
  };

  const isInSelection = (r, c) => selectedCells.some(([sr, sc]) => sr === r && sc === c);
  const isFoundCell = (r, c) => gridData.placedWords.some(pw => 
    pw.isTarget && foundWords.has(pw.word) && pw.positions.some(([pr, pc]) => pr === r && pc === c)
  );

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#5D4037', overflow: 'hidden' }} onMouseUp={handleMouseUp}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={55} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />
          <WarehouseScene />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="warehouse-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}>
            <div>CATEGORIA: {round.category}</div>
            <div>ENCONTRADAS: {foundWords.size} / {round.words.length}</div>
            <div className="text-sm mt-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>{round.instruction}</div>
          </div>
        </div>
        <button data-testid="warehouse-exit-button" onClick={() => navigate('/')} className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>SALIR</button>
      </div>

      {/* Word search grid */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 select-none">
        <div className="bg-white border-4 border-black p-4" style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {gridData.grid.map((row, r) => row.map((letter, c) => {
              const found = isFoundCell(r, c);
              const inSel = isInSelection(r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  data-testid={`grid-cell-${r}-${c}`}
                  onMouseDown={() => handleCellMouseDown(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  className="flex items-center justify-center border-2 border-black cursor-pointer transition-colors"
                  style={{
                    width: '38px',
                    height: '38px',
                    backgroundColor: found ? '#4CD964' : (inSel ? '#FFCC00' : '#FFFFFF'),
                    fontFamily: 'VT323, monospace',
                    fontSize: '24px',
                    color: '#111827',
                    fontWeight: 'bold',
                  }}
                >
                  {letter}
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Words to find */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-yellow-400 border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>PALABRAS:</div>
          <div className="flex gap-3 flex-wrap" style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}>
            {round.words.map(w => (
              <span key={w} style={{ textDecoration: foundWords.has(w) ? 'line-through' : 'none', color: foundWords.has(w) ? '#4CD964' : '#111827' }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-3 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '20px' }} data-testid="warehouse-feedback">
          {feedback}
        </div>
      )}

      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" data-testid="warehouse-win-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#4CD964' }}>VICTORIA!</h2>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>Limpiaste el almacen!</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="warehouse-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>SIGUIENTE NIVEL</button>
              <button data-testid="warehouse-back-button" onClick={() => navigate('/')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game6Warehouse;
