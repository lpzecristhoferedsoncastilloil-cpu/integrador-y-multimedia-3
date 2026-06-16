import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import RobotCharacter from '../components/game/RobotCharacter';
import FloatingIsland from '../components/game/FloatingIsland';
import FloatingLetter from '../components/game/FloatingLetter';
import { Pause, Settings, Volume2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LETTERS_DATA = [
  { id: 1, letter: 'W', position: [3, 2, 2] },
  { id: 2, letter: 'O', position: [-3, 2.5, 1] },
  { id: 3, letter: 'R', position: [2, 2.2, -3] },
  { id: 4, letter: 'D', position: [-2, 2.8, -2] },
  { id: 5, letter: 'G', position: [4, 2.3, -1] },
  { id: 6, letter: 'A', position: [-4, 2.6, 3] },
  { id: 7, letter: 'M', position: [1, 2.4, 4] },
  { id: 8, letter: 'E', position: [-1, 2.7, -4] },
];

const Game = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [playerPosition, setPlayerPosition] = useState([0, 2, 8]);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [collectedLetters, setCollectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState(LETTERS_DATA);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showWordForm, setShowWordForm] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [formedWords, setFormedWords] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const keysPressed = useRef({});
  const moveSpeed = 0.1;

  useEffect(() => {
    loadGameProgress();
  }, []);

  const loadGameProgress = async () => {
    try {
      const { data } = await axios.get(`${API}/game/load`, { withCredentials: true });
      if (data.progress) {
        setScore(data.progress.score || 0);
        setCollectedLetters(data.progress.collected_letters || []);
        setFormedWords(data.progress.formed_words || []);
        if (data.progress.position) {
          setPlayerPosition([data.progress.position.x, data.progress.position.y, data.progress.position.z]);
        }
      }
    } catch (error) {
      console.error('Failed to load game progress:', error);
    }
  };

  const saveGameProgress = async () => {
    try {
      await axios.post(
        `${API}/game/save`,
        {
          progress: {
            current_world: 'educational_city',
            position: { x: playerPosition[0], y: playerPosition[1], z: playerPosition[2] },
            collected_letters: collectedLetters,
            formed_words: formedWords,
            completed_challenges: [],
            score: score,
            lives: 3,
            level: 1,
          },
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        saveGameProgress();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [playerPosition, collectedLetters, formedWords, score, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused) return;
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === ' ' && !isJumping) {
        performJump();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, isJumping]);

  useEffect(() => {
    if (isPaused) return;

    const gameLoop = setInterval(() => {
      let newX = playerPosition[0];
      let newZ = playerPosition[2];
      let moved = false;
      let newRotation = playerRotation;

      if (keysPressed.current['w']) {
        newZ -= moveSpeed;
        newRotation = 0;
        moved = true;
      }
      if (keysPressed.current['s']) {
        newZ += moveSpeed;
        newRotation = Math.PI;
        moved = true;
      }
      if (keysPressed.current['a']) {
        newX -= moveSpeed;
        newRotation = Math.PI / 2;
        moved = true;
      }
      if (keysPressed.current['d']) {
        newX += moveSpeed;
        newRotation = -Math.PI / 2;
        moved = true;
      }

      const distance = Math.sqrt(newX * newX + newZ * newZ);
      if (distance < 11) {
        setPlayerPosition([newX, playerPosition[1], newZ]);
        if (moved) {
          setPlayerRotation(newRotation);
        }
        setIsMoving(moved);
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [playerPosition, playerRotation, isPaused]);

  const performJump = () => {
    setIsJumping(true);
    const jumpHeight = 2;
    const jumpDuration = 600;
    const startY = playerPosition[1];
    const startTime = Date.now();

    const jumpInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / jumpDuration;

      if (progress >= 1) {
        setPlayerPosition([playerPosition[0], startY, playerPosition[2]]);
        setIsJumping(false);
        clearInterval(jumpInterval);
      } else {
        const jumpY = startY + Math.sin(progress * Math.PI) * jumpHeight;
        setPlayerPosition([playerPosition[0], jumpY, playerPosition[2]]);
      }
    }, 16);
  };

  const handleCollectLetter = (letter) => {
    if (!collectedLetters.includes(letter)) {
      setCollectedLetters([...collectedLetters, letter]);
      setAvailableLetters(availableLetters.filter((l) => l.letter !== letter));
      setScore(score + 10);
    }
  };

  const handleFormWord = () => {
    if (currentWord.length >= 3) {
      const wordLetters = currentWord.toUpperCase().split('');
      const hasAllLetters = wordLetters.every((letter) => collectedLetters.includes(letter));

      if (hasAllLetters && !formedWords.includes(currentWord.toUpperCase())) {
        setFormedWords([...formedWords, currentWord.toUpperCase()]);
        setScore(score + currentWord.length * 20);
        setCurrentWord('');
        setShowWordForm(false);
      } else {
        alert('Invalid word or missing letters!');
      }
    }
  };

  const handleLogout = async () => {
    await saveGameProgress();
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#87CEEB' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={60} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2.2}
          />
          
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <FloatingIsland />
          <RobotCharacter
            position={playerPosition}
            rotation={playerRotation}
            isMoving={isMoving}
            isJumping={isJumping}
          />
          
          {availableLetters.map((letterData) => (
            <FloatingLetter
              key={letterData.id}
              position={letterData.position}
              letter={letterData.letter}
              onCollect={handleCollectLetter}
            />
          ))}
        </Suspense>
      </Canvas>

      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="game-hud-score">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '24px' }}>
            <div>SCORE: {score}</div>
            <div className="mt-2">LETTERS: {collectedLetters.join(', ')}</div>
            <div className="mt-2">WORDS: {formedWords.length}</div>
          </div>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <button
            data-testid="game-form-word-button"
            onClick={() => setShowWordForm(!showWordForm)}
            className="p-3 border-4 border-black bg-green-400 transition-all"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '20px' }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px 0px rgba(0,0,0,1)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
            }}
          >
            FORM WORD
          </button>
          
          <button
            data-testid="game-pause-button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-3 border-4 border-black bg-white transition-all"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
          >
            <Pause size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      {showWordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20" data-testid="word-form-modal">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-4xl mb-4" style={{ fontFamily: 'VT323, monospace' }}>FORM A WORD</h2>
            <p className="mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Use your collected letters: {collectedLetters.join(', ')}</p>
            <input
              data-testid="word-input"
              type="text"
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              className="w-full p-3 border-4 border-black mb-4 text-lg"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
              placeholder="Type your word..."
            />
            <div className="flex gap-4">
              <button
                data-testid="submit-word-button"
                onClick={handleFormWord}
                className="flex-1 p-3 border-4 border-black bg-yellow-400 transition-all"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '20px' }}
              >
                SUBMIT
              </button>
              <button
                data-testid="cancel-word-button"
                onClick={() => { setShowWordForm(false); setCurrentWord(''); }}
                className="flex-1 p-3 border-4 border-black bg-gray-300 transition-all"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '20px' }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20" data-testid="pause-menu">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <h2 className="text-5xl mb-6 text-center" style={{ fontFamily: 'VT323, monospace' }}>PAUSED</h2>
            <div className="space-y-4">
              <button
                data-testid="resume-button"
                onClick={() => setIsPaused(false)}
                className="w-full p-4 border-4 border-black bg-yellow-400 transition-all"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '24px' }}
              >
                RESUME
              </button>
              <button
                data-testid="save-button"
                onClick={() => { saveGameProgress(); alert('Game saved!'); }}
                className="w-full p-4 border-4 border-black bg-green-400 transition-all"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '24px' }}
              >
                SAVE GAME
              </button>
              <button
                data-testid="logout-button"
                onClick={handleLogout}
                className="w-full p-4 border-4 border-black bg-red-400 transition-all"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '24px' }}
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-6 pointer-events-none" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '14px', color: '#111827' }}>
        <div className="bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div className="font-bold mb-2">CONTROLS:</div>
          <div>W, A, S, D - Move</div>
          <div>SPACE - Jump</div>
          <div>Click letters to collect</div>
        </div>
      </div>
    </div>
  );
};

export default Game;