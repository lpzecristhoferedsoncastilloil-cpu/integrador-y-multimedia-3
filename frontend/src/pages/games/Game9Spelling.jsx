// ============================================================
// pages/games/Game9Spelling.jsx — Deletreo Estelar
// Juego 9: Deletreo para niños de 7 a 10 años
// Modo 7 años (Cadete): Juego de disparos en 3D (shooter)
// Modo 10 años (Comandante): Deletrear por voz (micrófono)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Html } from '@react-three/drei';
import API from '../../services/api';
import { HelpCircle, Volume2, Mic, Heart, Star, Compass, Sparkles, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

// 10 niveles, 3 subniveles cada uno (3 palabras por nivel)
const WORDS_LEVELS = {
  1: ['SOL', 'PAN', 'MAR'],
  2: ['CASA', 'GATO', 'SAPO'],
  3: ['LUNA', 'PATO', 'MESA'],
  4: ['PERRO', 'BOTAS', 'PIANO'],
  5: ['LIMON', 'RATON', 'GLOBO'],
  6: ['COHETE', 'JUGUETE', 'PELOTA'],
  7: ['FRUTILLA', 'MANZANA', 'ESCUELA'],
  8: ['ELEFANTE', 'VENTANA', 'HELADO'],
  9: ['MARIPOSA', 'DINOSAURIO', 'BIBLIOTECA'],
  10: ['ASTRONAUTA', 'COMPUTADORA', 'UNIVERSO']
};

const ALPHABET = 'ABCDEFGHIJKLEMNOPQRSTUVWXYZ';
const getRandomLetters = (excludeList, count = 4) => {
  const result = [];
  while (result.length < count) {
    const char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    if (!excludeList.includes(char) && !result.includes(char)) {
      result.push(char);
    }
  }
  return result;
};

// --- COMPONENTES 3D (React Three Fiber) ---

const SpaceRocket3D = ({ position, isLaunching, isError, scale = [0.5, 0.5, 0.5] }) => {
  const rocketRef = useRef();
  const flameRef = useRef();
  const isLaunchingRef = useRef(isLaunching);

  // Sincronizar y forzar reset inmediato de posición física al cambiar isLaunching
  useEffect(() => {
    isLaunchingRef.current = isLaunching;
    if (!isLaunching && rocketRef.current) {
      rocketRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [isLaunching, position]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (rocketRef.current) {
      rocketRef.current.rotation.y = t * 0.5;
      
      if (isLaunchingRef.current) {
        rocketRef.current.position.y += 0.08; // Despegue
        rocketRef.current.position.x = position[0] + Math.sin(t * 50) * 0.05;
      } else {
        // Seguir posición actual y restablecer
        rocketRef.current.position.x = position[0];
        rocketRef.current.position.y = position[1];
        rocketRef.current.position.z = position[2];
      }
    }
    if (flameRef.current) {
      const pulse = isLaunchingRef.current 
        ? 2.5 + Math.sin(t * 40) * 0.5 
        : 1.0 + Math.sin(t * 15) * 0.2;
      flameRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={rocketRef} position={position} scale={scale}>
      {/* Cuerpo principal */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 2.5, 16]} />
        <meshStandardMaterial color={isError ? '#ef4444' : '#4f46e5'} metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Cabina / Ventana */}
      <mesh position={[0, 0.4, 0.35]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#60a5fa" emissive="#1e3a8a" roughness={0.1} />
      </mesh>

      {/* Punta del Cohete (Cono) */}
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.45, 1.0, 16]} />
        <meshStandardMaterial color="#fb923c" metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Alerón Izquierdo */}
      <mesh position={[-0.55, -0.8, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.15, 0.8, 0.4]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>

      {/* Alerón Derecho */}
      <mesh position={[0.55, -0.8, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.15, 0.8, 0.4]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>

      {/* Flama de Propulsión */}
      <mesh ref={flameRef} position={[0, -1.6, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} rotation={[Math.PI, 0, 0]} />
        <meshBasicMaterial color="#f59e0b" toneMapped={false} />
      </mesh>
    </group>
  );
};

// Asteroides flotantes 3D con letras (40% más pequeño: escala 0.6)
const LetterAsteroid3D = ({ letter, position, scale = [0.6, 0.6, 0.6] }) => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.rotation.x = t * 0.3;
      meshRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <group position={position} scale={scale}>
        <mesh ref={meshRef}>
          <dodecahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial color="#312e81" roughness={0.5} metalness={0.6} flatShading />
        </mesh>
        <Html
          position={[0, 0, 0.72]}
          center
          distanceFactor={5}
          pointerEvents="none"
        >
          <div className="select-none font-black text-white text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none text-center">
            {letter}
          </div>
        </Html>
      </group>
    </Float>
  );
};

// Componente de actualización física que corre dentro del Canvas
const PhysicsController = ({
  mode,
  isLaunching,
  isError,
  asteroidsRef,
  lasersRef,
  setAsteroids,
  setLasers,
  setParticles,
  handleAsteroidHit
}) => {
  const { viewport } = useThree();
  const { width, height } = viewport;

  // Guardamos en una ref para evitar capturas obsoletas en useFrame
  const handleAsteroidHitRef = useRef(handleAsteroidHit);
  useEffect(() => {
    handleAsteroidHitRef.current = handleAsteroidHit;
  }, [handleAsteroidHit]);

  useFrame(() => {
    // 1. Mover asteroides (solo en modo cadete)
    if (mode === 'cadete' && !isLaunching && !isError) {
      const currentAsteroids = asteroidsRef.current;
      const currentLasers = lasersRef.current;

      let hitDetected = false;
      let hitLetter = '';
      let hitAsteroid = null;
      let hitLaserId = null;

      // Límites dinámicos basados en el viewport a profundidad z=0.5 (distancia 5.0 de la cámara a z=5.5)
      const scaleFactor = 5.0 / 5.5;
      const asteroidWidth = width * scaleFactor;
      const asteroidHeight = height * scaleFactor;
      const radius = 0.65 * 0.36; // 0.234
      const xLimit = asteroidWidth / 2 - radius;
      const yLimit = asteroidHeight / 2 - radius;

      // 1. Mover asteroides
      let updatedAsteroids = currentAsteroids.map(ast => {
        let nx = ast.x + ast.vx;
        let ny = ast.y + ast.vy;
        let nvx = ast.vx;
        let nvy = ast.vy;

        if (nx < -xLimit) {
          nx = -xLimit;
          nvx = Math.abs(nvx);
        } else if (nx > xLimit) {
          nx = xLimit;
          nvx = -Math.abs(nvx);
        }

        if (ny < -yLimit) {
          ny = -yLimit;
          nvy = Math.abs(nvy);
        } else if (ny > yLimit) {
          ny = yLimit;
          nvy = -Math.abs(nvy);
        }

        return { ...ast, x: nx, y: ny, vx: nvx, vy: nvy };
      });

      // Rebote asteroide contra asteroide (colisiones elásticas de círculos)
      const collisionDist = 2 * radius; // 0.468

      for (let i = 0; i < updatedAsteroids.length; i++) {
        for (let j = i + 1; j < updatedAsteroids.length; j++) {
          const ast1 = updatedAsteroids[i];
          const ast2 = updatedAsteroids[j];

          const dx = ast2.x - ast1.x;
          const dy = ast2.y - ast1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < collisionDist && dist > 0) {
            // Dirección normal de colisión
            const nx = dx / dist;
            const ny = dy / dist;

            // Dirección tangente
            const tx = -ny;
            const ty = nx;

            // Proyectar velocidades sobre normal y tangente
            const v1n = ast1.vx * nx + ast1.vy * ny;
            const v1t = ast1.vx * tx + ast1.vy * ty;
            const v2n = ast2.vx * nx + ast2.vy * ny;
            const v2t = ast2.vx * tx + ast2.vy * ty;

            // Intercambiar velocidades normales (colisión elástica con masas iguales)
            const v1n_new = v2n;
            const v2n_new = v1n;

            // Volver a componentes X e Y
            ast1.vx = v1n_new * nx + v1t * tx;
            ast1.vy = v1n_new * ny + v1t * ty;
            ast2.vx = v2n_new * nx + v2t * tx;
            ast2.vy = v2n_new * ny + v2t * ty;

            // Separar físicamente para evitar que se queden pegados
            const overlap = collisionDist - dist;
            ast1.x -= nx * (overlap / 2);
            ast1.y -= ny * (overlap / 2);
            ast2.x += nx * (overlap / 2);
            ast2.y += ny * (overlap / 2);
          }
        }
      }

      // 2. Mover láseres y verificar colisiones
      const updatedLasers = currentLasers.map(l => ({ ...l, y: l.y + 0.15 })).filter(l => l.y < 3.5);

      for (let l of updatedLasers) {
        for (let ast of updatedAsteroids) {
          const dx = l.x - ast.x;
          const dy = l.y - ast.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.35) {
            hitDetected = true;
            hitLetter = ast.letter;
            hitAsteroid = ast;
            hitLaserId = l.id;
            break;
          }
        }
        if (hitDetected) break;
      }

      if (hitDetected) {
        // Remover el láser que impactó en el estado y ref
        const remainingLasers = updatedLasers.filter(l => l.id !== hitLaserId);
        setLasers(remainingLasers);
        lasersRef.current = remainingLasers;
        // Ejecutar impacto del asteroide
        setTimeout(() => {
          handleAsteroidHitRef.current(hitLetter, hitAsteroid);
        }, 0);
      } else {
        setLasers(updatedLasers);
        lasersRef.current = updatedLasers;
      }

      setAsteroids(updatedAsteroids);
      asteroidsRef.current = updatedAsteroids;
    } else {
      // Mover láseres residuales si hay
      const currentLasers = lasersRef.current;
      if (currentLasers.length > 0) {
        const remainingLasers = currentLasers.map(l => ({ ...l, y: l.y + 0.15 })).filter(l => l.y < 3.5);
        setLasers(remainingLasers);
        lasersRef.current = remainingLasers;
      }
    }

    // 3. Mover partículas de explosiones
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      scale: p.scale - 0.03
    })).filter(p => p.scale > 0));
  });

  return null;
};

// --- COMPONENTE PRINCIPAL DEL JUEGO ---

const Game9Spelling = ({ player, onFinish, initialMode }) => {
  const [mode, setMode] = useState(null); // 'cadete' o 'commander'
  const [level, setLevel] = useState(1);
  const levelRef = useRef(1);
  const [sublevel, setSublevel] = useState(0); 
  const sublevelRef = useRef(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const [score, setScore] = useState(0);
  
  const [currentWord, setCurrentWord] = useState('');
  const currentWordRef = useRef('');
  const [selectedLetters, setSelectedLetters] = useState([]); // Letras armadas en Cadete
  const selectedLettersRef = useRef([]);
  const [listening, setListening] = useState(false); 
  const [speechResult, setSpeechResult] = useState('');
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [wordStartTime, setWordStartTime] = useState(null);
  const [attempts, setAttempts] = useState([]);

  // --- Estados de la física del Shooter (Modo 7 años) ---
  const [bounds, setBounds] = useState({ xMin: -2.0, xMax: 2.0, yMin: -2.0, yMax: 2.0 });

  useEffect(() => {
    const updateBounds = () => {
      const w = window.innerWidth - 380;
      const h = window.innerHeight;
      const aspect = w / h;
      const height = 2 * Math.tan((30 * Math.PI) / 180) * 5.5;
      const width = height * aspect;
      setBounds({
        xMin: -width / 2 + 0.4,
        xMax: width / 2 - 0.4,
        yMin: -height / 2 + 0.6,
        yMax: height / 2 - 0.6
      });
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const [rocketX, setRocketX] = useState(0); // Centrado X
  const [rocketY, setRocketY] = useState(-1.0); // Eje Y configurable en todo el Canvas
  const [lasers, setLasers] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [particles, setParticles] = useState([]);

  // Refs de sincronización física a 60fps
  const asteroidsRef = useRef([]);
  const lasersRef = useRef([]);
  const rocketXRef = useRef(0);
  const rocketYRef = useRef(-1.0);

  useEffect(() => {
    asteroidsRef.current = asteroids;
  }, [asteroids]);

  useEffect(() => {
    lasersRef.current = lasers;
  }, [lasers]);

  useEffect(() => {
    rocketXRef.current = rocketX;
  }, [rocketX]);

  useEffect(() => {
    rocketYRef.current = rocketY;
  }, [rocketY]);

  // Inicializar audio
  const playCorrectSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  };

  const playIncorrectSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(147, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  const speakWord = (word) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'es-ES';
    utterance.rate = 0.75;
    utterance.pitch = 1.25;
    window.speechSynthesis.speak(utterance);
  };

  // Iniciar sesión en BD
  const startSession = async (selectedMode) => {
    setSessionStartTime(Date.now());
    try {
      const res = await API.post('/games/session/start', {
        player_id: player.id || player.patient_id || player.id_paciente,
        game_type: selectedMode === 'cadete' ? 'spelling_cadete' : 'spelling_commander', 
        game_number: 9,
        level: level,
      });
      setSessionId(res.data.id);
    } catch (e) {
      console.error('Error iniciando sesión en deletreo:', e);
    }
  };

  // Iniciar en el modo elegido
  const selectMode = (chosenMode) => {
    setMode(chosenMode);
    livesRef.current = 3;
    setLives(3);
    startSession(chosenMode);
    loadWord(1, 0, chosenMode);
  };

  useEffect(() => {
    if (initialMode) {
      selectMode(initialMode);
    }
  }, [initialMode]);

  // Spawnea 1 asteroide correcto y 4 distractores (total 5 asteroides)
  const spawnAsteroidsForLetter = (expectedLetter) => {
    const distractors = getRandomLetters([expectedLetter], 4); // 4 distractores
    const allLetters = [expectedLetter, ...distractors];

    // Desordenar
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
    }

    const newAsteroids = allLetters.map((char, i) => {
      const angle = (i / allLetters.length) * Math.PI * 2;
      return {
        id: `asteroid-${i}-${char}-${Date.now()}`,
        letter: char,
        // Centrar en el panel derecho de forma dispersa
        x: Math.cos(angle) * 1.5,
        y: Math.sin(angle) * 0.7 + 1.2,
        vx: (Math.random() - 0.5) * 0.015,
        vy: (Math.random() - 0.5) * 0.015
      };
    });
    asteroidsRef.current = newAsteroids;
    setAsteroids(newAsteroids);
  };

  // Cargar una palabra
  const loadWord = (lvl, subLvl, currentMode = mode) => {
    const words = WORDS_LEVELS[lvl];
    if (!words) {
      finishGame(); // Ir directo al podio
      return;
    }
    const word = words[subLvl];
    currentWordRef.current = word;
    setCurrentWord(word);
    
    selectedLettersRef.current = [];
    setSelectedLetters([]);
    
    setSpeechResult('');
    setIsLaunching(false);
    setIsError(false);
    setWordStartTime(Date.now());
    
    lasersRef.current = [];
    setLasers([]);
    
    setParticles([]);
    setRocketX(0); // Reset X
    setRocketY(-1.0); // Reset Y
    rocketXRef.current = 0;
    rocketYRef.current = -1.0;

    // Dictar palabra al cargar
    setTimeout(() => {
      speakWord(word);
    }, 500);

    if (currentMode === 'cadete') {
      spawnAsteroidsForLetter(word[0]);
    }
  };

  // Disparar Láser
  const shoot = () => {
    if (isLaunching || isError || livesRef.current <= 0) return;
    const newLasers = [
      ...lasersRef.current,
      {
        id: `${Date.now()}-${Math.random()}`,
        x: rocketXRef.current, // Leer la posición X de pilotaje actualizada
        y: rocketYRef.current // Empezar disparo desde la posición Y de pilotaje actualizada
      }
    ];
    lasersRef.current = newLasers;
    setLasers(newLasers);
  };

  const shootRef = useRef(shoot);
  useEffect(() => {
    shootRef.current = shoot;
  }, [shoot]);

  // Spawn de Partículas al Explotar Asteroide
  const spawnExplosion = (x, y) => {
    const newParticles = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.08;
      newParticles.push({
        id: `${i}-${Date.now()}-${Math.random()}`,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0.35 + Math.random() * 0.4,
        color: i % 2 === 0 ? '#fb923c' : '#facc15'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Manejar impacto del disparo
  const handleAsteroidHit = (letter, asteroid) => {
    const nextLetterIndex = selectedLettersRef.current.length;
    const expectedLetter = currentWordRef.current[nextLetterIndex];

    // Siempre explota al recibir un impacto
    spawnExplosion(asteroid.x, asteroid.y);

    // Quitar de la pantalla el asteroide destruido en la ref y en el estado inmediatamente
    const remainingAsteroids = asteroidsRef.current.filter(ast => ast.id !== asteroid.id);
    asteroidsRef.current = remainingAsteroids;
    setAsteroids(remainingAsteroids);

    if (letter === expectedLetter) {
      const newSelected = [...selectedLettersRef.current, letter];
      selectedLettersRef.current = newSelected;
      setSelectedLetters(newSelected);

      if (newSelected.join('') === currentWordRef.current) {
        handleSuccess();
      } else {
        // Siguiente letra
        const nextChar = currentWordRef.current[newSelected.length];
        spawnAsteroidsForLetter(nextChar);
      }
    } else {
      // Impacto incorrecto -> resta vida y shake de error, pero no reinicia la palabra en el modo 7 años
      handleFailure(letter);
    }
  };

  // Reconocimiento de voz en Modo Commander (10 años)
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Reconocimiento de voz no soportado en este navegador.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      setListening(false);
      const transcript = event.results[0][0].transcript;
      setSpeechResult(transcript);
      
      const cleanInput = normalizeSpellingInput(transcript);
      
      if (cleanInput === currentWord) {
        handleSuccess(cleanInput);
      } else {
        handleFailure(cleanInput);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error('Error al escuchar el micrófono. Reintenta de nuevo.');
    };
  };

  const normalizeSpellingInput = (spokenText) => {
    let text = spokenText.toLowerCase();
    const letterMap = {
      'hache': 'h', 'jota': 'j', 'equis': 'x', 'ye': 'y', 'zeta': 'z',
      'efe': 'f', 'ele': 'l', 'eme': 'm', 'ene': 'n', 'eñe': 'ñ',
      'ere': 'r', 'erre': 'r', 'ese': 's', 'uve': 'v', 'doble ve': 'w',
      'uve doble': 'w', 'i griega': 'y', 'ce': 'c', 'se': 'c', 'ka': 'k',
      'cu': 'q', 'pe': 'p', 'te': 't', 'de': 'd', 'be': 'b', 've': 'v',
      'ge': 'g', 'ca': 'c', 'pa': 'p', 'ma': 'm', 'sa': 's', 'ta': 't',
      'la': 'l', 'ra': 'r', 'na': 'n', 'da': 'd', 'ba': 'b', 'va': 'v'
    };

    for (const [key, value] of Object.entries(letterMap)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      text = text.replace(regex, value);
    }
    text = text.replace(/[^a-zñ]/g, '');
    return text.toUpperCase();
  };

  // Acierto
  const handleSuccess = async (givenAnswer = currentWordRef.current) => {
    playCorrectSound();
    setIsLaunching(true);
    setScore(s => s + (10 * levelRef.current));

    const reactionTime = Date.now() - wordStartTime;
    logAttempt(givenAnswer, true, reactionTime);

    setTimeout(() => {
      const nextSublevel = sublevelRef.current + 1;
      if (nextSublevel < 3) {
        sublevelRef.current = nextSublevel;
        setSublevel(nextSublevel);
        loadWord(levelRef.current, nextSublevel);
      } else {
        setLevelComplete(true);
      }
    }, 2000);
  };

  // Fallo
  const handleFailure = async (givenAnswer = '') => {
    playIncorrectSound();
    setIsError(true);

    const nextLives = livesRef.current - 1;
    livesRef.current = nextLives;
    setLives(nextLives);

    const reactionTime = Date.now() - wordStartTime;
    logAttempt(givenAnswer, false, reactionTime);

    // Si pierde todas las vidas, ir directo al podio sin pasar por pantalla de Misión Fallida
    if (nextLives <= 0) {
      setTimeout(() => {
        setIsError(false);
        finishGame();
      }, 1500);
      return;
    }

    setTimeout(() => {
      setIsError(false);
      // En modo commander (10 años), reintentamos la palabra recargándola
      // En modo cadete (7 años), solo habilitamos los controles de nuevo para seguir intentándolo
      if (mode === 'commander') {
        loadWord(levelRef.current, sublevelRef.current);
      }
    }, 1500);
  };

  // Registrar intento en BD
  const logAttempt = async (givenAnswer, isCorrect, reactionTime) => {
    const attempt = {
      word_shown: currentWordRef.current,
      answer_given: givenAnswer || selectedLettersRef.current.join(''),
      is_correct: isCorrect,
      reaction_time_ms: reactionTime,
      error_type: isCorrect ? null : 'spelling',
      num_clicks: mode === 'cadete' ? selectedLettersRef.current.length + 1 : 1,
      attempt_number: 1,
    };

    setAttempts(prev => [...prev, attempt]);

    if (sessionId) {
      try {
        await API.post('/games/attempt', { session_id: sessionId, ...attempt });
      } catch (e) {
        console.error('Error al subir intento de deletreo:', e);
      }
    }
  };

  const handleNextLevel = () => {
    setLevelComplete(false);
    const nextLevel = levelRef.current + 1;
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    sublevelRef.current = 0;
    setSublevel(0);
    loadWord(nextLevel, 0);
  };

  // Finalizar juego completo y guardar resultados
  const finishGame = async () => {
    const totalTime = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
    const correctCount = attempts.filter(a => a.is_correct).length;
    const percentage = attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0;

    if (sessionId) {
      try {
        await API.put(`/games/session/${sessionId}/complete`, {
          total_time_seconds: totalTime,
          final_score: score,
          correct_attempts: correctCount,
          incorrect_attempts: attempts.length - correctCount,
          total_attempts: attempts.length
        });
      } catch (e) {
        console.error('Error al completar sesión en deletreo:', e);
      }
    }

    onFinish({
      score: score,
      level: levelRef.current,
      sessionId: sessionId
    });
  };

  // --- CONTROLES DE TECLADO ---

  // Escuchar Teclado en Modo Cadete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'cadete' || isLaunching || isError || livesRef.current <= 0) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setRocketX(x => Math.max(bounds.xMin, Math.min(bounds.xMax, x - 0.25)));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setRocketX(x => Math.max(bounds.xMin, Math.min(bounds.xMax, x + 0.25)));
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setRocketY(y => Math.max(bounds.yMin, Math.min(bounds.yMax, y + 0.25)));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setRocketY(y => Math.max(bounds.yMin, Math.min(bounds.yMax, y - 0.25)));
      } else if (e.key === ' ') {
        e.preventDefault();
        shootRef.current(); // Llamar a la referencia mutable del disparo para evitar cierres de estado obsoletos
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isLaunching, isError, bounds]);

  // Clic en pantalla derecha para disparar
  const handleContainerClick = (e) => {
    // Evitar disparar si se hace clic en paneles de control, botones o HUD
    if (e.target.closest('.no-shoot-click')) return;
    if (mode === 'cadete' && !isLaunching && !isError && livesRef.current > 0) {
      shoot();
    }
  };

  // --- RENDERS DE PANTALLA ---

  // 1. Selector de modo
  if (mode === null) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-white px-6" style={{ background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)' }}>
        <div className="max-w-xl w-full bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <Compass className="w-16 h-16 text-indigo-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-extrabold mb-2 tracking-wide">Deletreo Estelar</h2>
          <p className="text-slate-300 text-sm mb-8">Selecciona tu nivel de dificultad para iniciar el despegue de la nave:</p>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={() => selectMode('cadete')}
              className="py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] active:scale-95 transition-all text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 text-left flex items-center justify-between pointer-events-auto cursor-pointer"
            >
              <div>
                <div className="text-lg text-white">Cadete Espacial (7-8 años)</div>
                <div className="text-xs text-indigo-200 font-normal mt-0.5">Escucha la palabra y deletrea destruyendo los asteroides en 3D.</div>
              </div>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
            </button>

            <button
              onClick={() => selectMode('commander')}
              className="py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-95 transition-all text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-left flex items-center justify-between pointer-events-auto cursor-pointer"
            >
              <div>
                <div className="text-lg text-white">Comandante Estelar (9-10 años)</div>
                <div className="text-xs text-emerald-100 font-normal mt-0.5">Observa y escucha la palabra. Deletrea en voz alta usando el micrófono.</div>
              </div>
              <Mic className="w-6 h-6 text-yellow-300 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Nivel completado
  if (levelComplete) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-white px-6" style={{ background: '#090d16' }}>
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">¡Nivel {level} Completado!</h2>
          <p className="text-slate-300 text-sm mb-6">El cohete ha despegado con éxito hacia la órbita estelar.</p>
          <div className="bg-slate-950/40 rounded-2xl p-4 mb-6 text-sm">
            <div className="flex justify-between mb-2"><span>Puntaje:</span><strong className="text-white">{score}</strong></div>
            <div className="flex justify-between"><span>Siguiente Misión:</span><strong className="text-yellow-400">Nivel {level + 1}</strong></div>
          </div>
          {WORDS_LEVELS[level + 1] ? (
            <button onClick={handleNextLevel} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 font-extrabold rounded-xl transition text-sm cursor-pointer shadow-lg shadow-emerald-500/20">
              Siguiente Nivel →
            </button>
          ) : (
            <button onClick={finishGame} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold rounded-xl transition text-sm cursor-pointer shadow-lg shadow-yellow-500/20">
              🏆 Completar Aventura Estelar!
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Panel de Juego (HUD + Canvas 3D + Dashboard Lateral)
  return (
    <div 
      className="flex flex-row w-full h-full select-none" 
      style={{ background: '#05070c' }}
      onClick={handleContainerClick}
    >
      
      {/* 1. Panel Izquierdo: Consola de Control / Cabina */}
      <div className="w-96 min-w-[380px] bg-slate-950/90 border-r border-white/10 flex flex-col justify-between p-6 z-10 shadow-2xl overflow-y-auto no-shoot-click">
        {/* HUD Superior de la Consola */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span className="font-extrabold text-white uppercase tracking-wider text-sm">Deletreo Estelar</span>
            </div>
            <button onClick={() => setShowHelpModal(true)} className="p-1.5 bg-slate-900 border border-white/10 hover:border-white/20 rounded-lg transition cursor-pointer">
              <HelpCircle className="w-4 h-4 text-indigo-300" />
            </button>
          </div>

          {/* Estadísticas en la Consola */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Nivel / Palabra</span>
              <span className="text-lg font-extrabold text-white">{level}/10 - {sublevel + 1}/3</span>
            </div>
            <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Estrellas</span>
              <span className="text-lg font-extrabold text-yellow-400 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {score}
              </span>
            </div>
          </div>

          {/* Combustible (Vidas) */}
          <div className="bg-slate-900/60 border border-white/5 p-3 rounded-xl flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Combustible (Vidas)</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 animate-pulse" style={{ fill: i < lives ? '#ef4444' : 'none', color: '#ef4444', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>

          {/* Botón Escuchar palabra */}
          <button
            onClick={() => speakWord(currentWord)}
            className="w-full py-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer mt-2 shadow-lg"
          >
            <Volume2 className="w-4 h-4" /> Escuchar palabra
          </button>

          {/* Ranuras de la palabra */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl mt-2 flex flex-col gap-2">
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block text-center">Progreso de Deletreo</span>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {currentWord.split('').map((char, i) => {
                let showChar = false;
                if (mode === 'cadete' && i < selectedLetters.length) showChar = true;
                if (isLaunching) showChar = true;

                return (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg border-2 transition-all duration-300 ${
                      showChar 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg' 
                        : 'bg-slate-950/60 border-dashed border-white/20 text-white/20'
                    }`}
                  >
                    {showChar ? (mode === 'cadete' ? selectedLetters[i] : char) : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Área de Control según el Modo */}
          {mode === 'commander' ? (
            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col items-center gap-3">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block text-center animate-pulse">Transmisión de Voz Activa</span>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Presiona el micrófono y deletrea la palabra en voz alta, letra por letra (ej. "C... A... S... A")
              </p>
              
              <button
                onClick={startVoiceRecognition}
                disabled={listening || isLaunching || isError}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
                  listening
                    ? 'bg-red-500 animate-pulse scale-110 shadow-red-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20 hover:scale-105'
                }`}
              >
                <Mic className={`w-7 h-7 text-white ${listening ? 'animate-bounce' : ''}`} />
              </button>
              
              {speechResult && (
                <div className="w-full p-2.5 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-indigo-300 text-center">
                  Escuchado: <strong className="text-white">"{speechResult}"</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-left bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block text-center">🎮 Pilotaje del Cohete</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Usa las teclas de dirección (◀ ▶ ▲ ▼) o el control en pantalla para pilotear libremente.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Presiona <strong>Espacio</strong> o toca la pantalla a la derecha para disparar láseres a los asteroides.
              </p>
            </div>
          )}
        </div>

        {/* Feedback visual */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
          {isLaunching && (
            <div className="text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-1.5 animate-bounce text-center">
              <Sparkles className="w-4 h-4 fill-emerald-400 animate-spin" style={{ animationDuration: '3s' }} /> ¡Excelente! Lanzando Cohete...
            </div>
          )}
          {isError && (
            <div className="text-red-400 font-extrabold text-sm animate-pulse text-center">
              ¡Inténtalo de nuevo! 😔
            </div>
          )}
        </div>
      </div>

      {/* 2. Panel Derecho: Ventana Espacial (Canvas 3D) */}
      <div className="flex-1 relative h-full overflow-hidden bg-[#020408]">
        {/* Botón Salir */}
        <button
          onClick={finishGame}
          className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-20 text-sm no-shoot-click"
        >
          SALIR
        </button>

        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 60 }}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2.0} />
            <Stars radius={90} depth={40} count={1000} factor={3} saturation={0.5} fade speed={1} />
            
            {/* Controlador de la simulación física */}
            <PhysicsController 
              mode={mode}
              isLaunching={isLaunching}
              isError={isError}
              asteroidsRef={asteroidsRef}
              lasersRef={lasersRef}
              setAsteroids={setAsteroids}
              setLasers={setLasers}
              setParticles={setParticles}
              handleAsteroidHit={handleAsteroidHit}
            />

            {/* El Cohete 3D (50% más pequeño: scale [0.5, 0.5, 0.5]) */}
            <SpaceRocket3D 
              position={[mode === 'cadete' ? rocketX : 0, mode === 'cadete' ? rocketY : -1.0, 0]} 
              isLaunching={isLaunching} 
              isError={isError}
              scale={[0.25, 0.25, 0.25]} // Reducido un 50% de la escala anterior (0.5 * 0.5 = 0.25)
            />
            
            {/* Asteroides flotantes con letras (40% más pequeño: scale [0.6, 0.6, 0.6]) */}
            {mode === 'cadete' && asteroids.map((ast) => (
              <LetterAsteroid3D
                key={ast.id}
                letter={ast.letter}
                position={[ast.x, ast.y, 0.5]}
                scale={[0.36, 0.36, 0.36]} // Reducido un 40% de la escala anterior (0.6 * 0.6 = 0.36)
              />
            ))}

            {/* Láseres en vuelo */}
            {mode === 'cadete' && lasers.map(l => (
              <mesh key={l.id} position={[l.x, l.y, 0.5]}>
                <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
                <meshBasicMaterial color="#ef4444" toneMapped={false} />
              </mesh>
            ))}

            {/* Partículas de explosión */}
            {particles.map(p => (
              <mesh key={p.id} position={[p.x, p.y, 0.5]} scale={[p.scale, p.scale, p.scale]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color={p.color} toneMapped={false} />
              </mesh>
            ))}
          </Canvas>
        </div>

        {/* Mando D-Pad Flotante de Pilotaje Completo en la parte inferior derecha del Canvas */}
        {mode === 'cadete' && (
          <div className="absolute bottom-6 right-6 flex flex-col items-center gap-2 pointer-events-auto no-shoot-click z-20">
            {/* Botón Arriba */}
            <button
              onClick={(e) => { e.stopPropagation(); if (livesRef.current <= 0) return; setRocketY(y => Math.min(bounds.yMax, y + 0.4)); }}
              className="w-14 h-14 bg-slate-900/80 border border-white/20 hover:border-indigo-500/50 hover:bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl active:scale-95 select-none text-2xl transition-all"
              title="Mover Arriba"
            >
              ▲
            </button>
            <div className="flex gap-2 items-center">
              {/* Botón Izquierda */}
              <button
                onClick={(e) => { e.stopPropagation(); if (livesRef.current <= 0) return; setRocketX(x => Math.max(bounds.xMin, x - 0.4)); }}
                className="w-14 h-14 bg-slate-900/80 border border-white/20 hover:border-indigo-500/50 hover:bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl active:scale-95 select-none text-2xl transition-all"
                title="Mover Izquierda"
              >
                ◀
              </button>
              {/* Botón Disparar */}
              <button
                onClick={(e) => { e.stopPropagation(); if (livesRef.current <= 0) return; shoot(); }}
                className="w-16 h-16 bg-red-600/90 border border-red-500/30 text-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl shadow-red-500/20 active:scale-90 select-none text-2xl hover:bg-red-500 transition-all animate-pulse"
                title="Disparar Rayo"
              >
                🔥
              </button>
              {/* Botón Derecha */}
              <button
                onClick={(e) => { e.stopPropagation(); if (livesRef.current <= 0) return; setRocketX(x => Math.min(bounds.xMax, x + 0.4)); }}
                className="w-14 h-14 bg-slate-900/80 border border-white/20 hover:border-indigo-500/50 hover:bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl active:scale-95 select-none text-2xl transition-all"
                title="Mover Derecha"
              >
                ▶
              </button>
            </div>
            {/* Botón Abajo */}
            <button
              onClick={(e) => { e.stopPropagation(); if (livesRef.current <= 0) return; setRocketY(y => Math.max(bounds.yMin, y - 0.4)); }}
              className="w-14 h-14 bg-slate-900/80 border border-white/20 hover:border-indigo-500/50 hover:bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow-2xl active:scale-95 select-none text-2xl transition-all"
              title="Mover Abajo"
            >
              ▼
            </button>
          </div>
        )}
      </div>

      {/* Ayuda Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-shoot-click">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative pointer-events-auto">
            <HelpCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Deletreo Estelar</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              {mode === 'cadete'
                ? 'Pilotea el cohete libremente usando el mando o teclado. Dispara tu rayo láser con la tecla de Espacio o haciendo clic/toque en la pantalla. ¡Debes destruir los asteroides con las letras correctas en orden!'
                : 'Escucha la palabra. Luego presiona el micrófono verde y deletrea la palabra en voz alta letra por letra (ej. "G... A... T... O"). ¡Las letras se encenderán en verde!'}
            </p>
            <button onClick={() => setShowHelpModal(false)} className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition cursor-pointer">
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game9Spelling;
