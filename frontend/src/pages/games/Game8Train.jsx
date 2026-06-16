import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { Volume2, Award, Info, HelpCircle } from 'lucide-react';
import * as THREE from 'three';
import api from '../../services/api';

const OBJECTS = {
  M: [
    { name: 'MESA', display: 'Mesa', type: 'mesa' },
    { name: 'MANZANA', display: 'Manzana', type: 'manzana' },
    { name: 'MARIPOSA', display: 'Mariposa', type: 'mariposa' },
  ],
  P: [
    { name: 'PATO', display: 'Pato', type: 'pato' },
    { name: 'PELOTA', display: 'Pelota', type: 'pelota' },
    { name: 'PERRO', display: 'Perro', type: 'perro' },
  ],
  L: [
    { name: 'LÁPIZ', display: 'Lápiz', type: 'lapiz' },
    { name: 'LIBRO', display: 'Libro', type: 'libro' },
    { name: 'LUNA', display: 'Luna', type: 'luna' },
  ],
};

const WAGONS = [
  { letter: 'M', x: -3.5, color: '#f43f5e' },
  { letter: 'P', x: 0, color: '#3b82f6' },
  { letter: 'L', x: 3.5, color: '#fbbf24' },
];

const WAGON_Z = 5;
const CLOUD_Y = 3;
const CLOUD_Z = -1;
const OBJECT_IDLE_Y_OFFSET = 1.6;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const speakSpanish = (text, emphasizeFirst = false) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  let speakText = text;
  if (emphasizeFirst && text.length > 1) {
    speakText = `${text[0]}... ${text}`;
  }
  const utterance = new SpeechSynthesisUtterance(speakText);
  utterance.lang = 'es-ES';
  utterance.rate = 0.85;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
};

const ToyObject = ({ type }) => {
  switch (type) {
    case 'pato':
      return (
        <group>
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshLambertMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0.25, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshLambertMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0.45, 0.3, 0]} castShadow rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.18, 8]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
          <mesh position={[0.3, 0.38, 0.12]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      );
    case 'pelota':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.001, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.35, 0.04, 8, 24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    case 'perro':
      return (
        <group>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 0.35, 0.3]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
          <mesh position={[0.3, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshLambertMaterial color="#b45309" />
          </mesh>
          <mesh position={[0.25, 0.35, 0.1]} castShadow>
            <coneGeometry args={[0.08, 0.15, 6]} />
            <meshLambertMaterial color="#451a03" />
          </mesh>
          <mesh position={[0.25, 0.35, -0.1]} castShadow>
            <coneGeometry args={[0.08, 0.15, 6]} />
            <meshLambertMaterial color="#451a03" />
          </mesh>
          <mesh position={[-0.35, 0.15, 0]}>
            <boxGeometry args={[0.15, 0.05, 0.05]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
        </group>
      );
    case 'mesa':
      return (
        <group>
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.7, 0.06, 0.5]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
          {[[-0.3, -0.05, -0.2], [0.3, -0.05, -0.2], [-0.3, -0.05, 0.2], [0.3, -0.05, 0.2]].map((p, i) => (
            <mesh key={i} position={p} castShadow>
              <boxGeometry args={[0.06, 0.4, 0.06]} />
              <meshLambertMaterial color="#b45309" />
            </mesh>
          ))}
        </group>
      );
    case 'manzana':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
          <mesh position={[0.1, 0.38, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.18, 0.04, 0.1]} />
            <meshLambertMaterial color="#22c55e" />
          </mesh>
        </group>
      );
    case 'mariposa':
      return (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
            <meshLambertMaterial color="#451a03" />
          </mesh>
          <mesh position={[-0.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.25, 0.5, 4]} />
            <meshLambertMaterial color="#ec4899" />
          </mesh>
          <mesh position={[0.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.25, 0.5, 4]} />
            <meshLambertMaterial color="#a855f7" />
          </mesh>
        </group>
      );
    case 'lapiz':
      return (
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
            <meshLambertMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <coneGeometry args={[0.07, 0.1, 8]} />
            <meshLambertMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
            <meshLambertMaterial color="#ec4899" />
          </mesh>
        </group>
      );
    case 'libro':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.12, 0.45]} />
            <meshLambertMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.55, 0.02, 0.4]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    case 'luna':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshLambertMaterial color="#fef08a" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.27, 16, 16]} />
            <meshLambertMaterial color="#0c0c2e" />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshLambertMaterial color="#ec4899" />
        </mesh>
      );
  }
};

const Train = (props) => {
  const { wagonsFilled, trainOffset } = filterProps(props);
  return (
    <group position={[trainOffset, 0, WAGON_Z]}>
      {/* Tracks */}
      <mesh position={[-trainOffset, -0.05, 0]} receiveShadow>
        <boxGeometry args={[30, 0.05, 1.2]} />
        <meshLambertMaterial color="#475569" />
      </mesh>
      {[-12, -8, -4, 0, 4, 8, 12].map(x => (
        <mesh key={x} position={[x - trainOffset, -0.02, 0]}>
          <boxGeometry args={[1.5, 0.05, 1]} />
          <meshLambertMaterial color="#312e81" />
        </mesh>
      ))}
      {/* Locomotive */}
      <group position={[-6.5, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.8, 0.9]} />
          <meshLambertMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[0.5, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 12]} />
          <meshLambertMaterial color="#4338ca" />
        </mesh>
        <mesh position={[-0.6, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshLambertMaterial color="#06b6d4" />
        </mesh>
        <mesh position={[-0.6, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshLambertMaterial color="#06b6d4" />
        </mesh>
      </group>
      {/* Wagons */}
      {WAGONS.map((wagon) => (
        <group key={wagon.letter} position={[wagon.x, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.8, 0.9]} />
            <meshLambertMaterial color={wagon.color} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.4, 0.5, 0.7]} />
            <meshLambertMaterial color="#ffffff" opacity={0.2} transparent />
          </mesh>
          <Text position={[0, 0.05, 0.46]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {wagon.letter}
          </Text>
          {/* Wheels */}
          {[-0.5, 0.5].map((wx) => (
            <group key={wx}>
              <mesh position={[wx, -0.4, 0.5]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
                <meshLambertMaterial color="#111827" />
              </mesh>
              <mesh position={[wx, -0.4, -0.5]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
                <meshLambertMaterial color="#111827" />
              </mesh>
            </group>
          ))}
          {/* Star sparkle when filled */}
          {wagonsFilled[wagon.letter] && (
            <mesh position={[0, 0.8, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

const Scenery = (props) => {
  return (
    <group>
      {/* Grass floor */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[40, 0.2, 30]} />
        <meshLambertMaterial color="#0b0f19" />
      </mesh>
      {/* Mountains */}
      {[[-10, -10], [-5, -12], [5, -11], [10, -10]].map((p, i) => (
        <mesh key={i} position={[p[0], 0, p[1]]} castShadow>
          <coneGeometry args={[2.5, 3, 8]} />
          <meshLambertMaterial color="#1e1b4b" />
        </mesh>
      ))}
      {/* Beacons */}
      {[[-8, -5], [8, -5], [-6, -8], [6, -8], [-12, -4], [12, -4]].map((p, i) => (
        <group key={i} position={[p[0], 0, p[1]]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.8, 6]} />
            <meshLambertMaterial color="#312e81" />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        </group>
      ))}
      {/* Cloud station */}
      <group position={[0, CLOUD_Y, CLOUD_Z]}>
        <mesh castShadow>
          <sphereGeometry args={[0.8, 12, 12]} />
          <meshLambertMaterial color="#312e81" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.6, -0.1, 0]} castShadow>
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshLambertMaterial color="#312e81" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.6, -0.1, 0]} castShadow>
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshLambertMaterial color="#312e81" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

const DraggableObject = (props) => {
  const { currentObject, isDragging, setIsDragging, dragPos, springBackTo } = filterProps(props);
  const groupRef = useRef();
  const positionRef = useRef({ x: 0, y: CLOUD_Y, z: CLOUD_Z });
  const animStateRef = useRef('idle');

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (isDragging && dragPos.current) {
      positionRef.current.x = dragPos.current.x;
      positionRef.current.y = dragPos.current.y;
      positionRef.current.z = dragPos.current.z;
      animStateRef.current = 'dragging';
    } else if (springBackTo.current) {
      const target = springBackTo.current;
      const lerp = 0.12;
      positionRef.current.x += (target.x - positionRef.current.x) * lerp;
      positionRef.current.y += (target.y - positionRef.current.y) * lerp;
      positionRef.current.z += (target.z - positionRef.current.z) * lerp;
      const dx = Math.abs(target.x - positionRef.current.x);
      if (dx < 0.05) {
        springBackTo.current = null;
        animStateRef.current = 'idle';
      }
    } else {
      positionRef.current.x = 0;
      positionRef.current.y = CLOUD_Y + OBJECT_IDLE_Y_OFFSET + Math.sin(state.clock.elapsedTime * 3) * 0.12;
      positionRef.current.z = CLOUD_Z;
      animStateRef.current = 'idle';
    }
    
    groupRef.current.position.set(positionRef.current.x, positionRef.current.y, positionRef.current.z);
    groupRef.current.rotation.y += delta * 0.5;
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    springBackTo.current = null;
    speakSpanish(currentObject.name, true);
  };

  if (!currentObject) return null;

  return (
    <group ref={groupRef} onPointerDown={handlePointerDown}>
      <ToyObject type={currentObject.type} />
    </group>
  );
};

const DragController = (props) => {
  const { isDragging, dragPos } = filterProps(props);
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -3));

  useFrame((state) => {
    if (!isDragging) return;
    raycaster.current.setFromCamera(state.pointer, camera);
    const intersection = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, intersection);
    if (intersection) {
      dragPos.current = { x: intersection.x, y: 3, z: intersection.z };
    }
  });
  return null;
};

const CameraSetup = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 6, 13);
    camera.lookAt(0, 2, 1);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const FallingLetter = (props) => {
  const { letter, x, color, delay } = filterProps(props);
  const groupRef = useRef();
  const startTimeRef = useRef(Date.now());

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (Date.now() - startTimeRef.current - delay) / 1000;
    if (elapsed < 0) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    groupRef.current.position.y = 8 - elapsed * 1.5;
    groupRef.current.rotation.z = elapsed * 2;
  });

  return (
    <group ref={groupRef} position={[x, 8, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.2]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <Text position={[0, 0, 0.12]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
        {letter}
      </Text>
    </group>
  );
};

const Game8Train = ({ player, onFinish }) => {

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
  const [wagonsFilled, setWagonsFilled] = useState({ M: false, P: false, L: false });
  const [currentObject, setCurrentObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [trainOffset, setTrainOffset] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const dragPos = useRef({ x: 0, y: 2.5, z: -2 });
  const springBackTo = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const pickNewObject = (filled) => {
    const available = Object.keys(filled).filter(k => !filled[k]);
    if (available.length === 0) return null;
    const letter = available[Math.floor(Math.random() * available.length)];
    const options = OBJECTS[letter];
    return options[Math.floor(Math.random() * options.length)];
  };

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'train',
          game_number: 10,
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
        console.error('Error al guardar progreso:', e);
      }
    }
    onFinish({ score: finalScore, level: 1, sessionId });
  };

  useEffect(() => {
    const obj = pickNewObject(wagonsFilled);
    setCurrentObject(obj);
    if (obj) {
      setTimeout(() => speakSpanish(obj.name, true), 500);
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'won') return;
    let raf;
    const start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000;
      setTrainOffset(elapsed * 4);
      if (elapsed < 5) {
        raf = requestAnimationFrame(animate);
      }
    };
    speakSpanish('¡Felicidades! ¡Lo lograste!');
    animate();
    return () => cancelAnimationFrame(raf);
  }, [gameState]);

  useEffect(() => {
    const handleUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      const pos = dragPos.current;
      let droppedWagon = null;
      if (pos && Math.abs(pos.z - WAGON_Z) < 1.5) {
        for (const w of WAGONS) {
          if (Math.abs(pos.x - w.x) < 1.2) {
            droppedWagon = w.letter;
            break;
          }
        }
      }

      if (droppedWagon && currentObject && droppedWagon === currentObject.name[0]) {
        setCorrectCount(c => c + 1);
      playCorrectSound();
        const newFilled = { ...wagonsFilled, [droppedWagon]: true };
        setWagonsFilled(newFilled);
        setScore(prev => prev + 1);
        setFeedback(`¡Excelente! Metiste la palabra en el vagón ${droppedWagon}`);
        speakSpanish(`¡Excelente! Metiste el ${currentObject.display} en el vagón ${droppedWagon}`);
        setTimeout(() => setFeedback(''), 2500);

        if (Object.values(newFilled).every(v => v)) {
          setGameState('won');
          finishGame(correctCount + 1, incorrectCount, correctCount + 1 + incorrectCount, (correctCount + 1) * 300);
        } else {
          setTimeout(() => {
            const next = pickNewObject(newFilled);
            setCurrentObject(next);
            if (next) {
              setTimeout(() => speakSpanish(next.name, true), 300);
            }
          }, 1200);
        }
      } else {
        setIncorrectCount(i => i + 1);
        springBackTo.current = { x: 0, y: CLOUD_Y + OBJECT_IDLE_Y_OFFSET, z: CLOUD_Z };
        const correctLetter = currentObject?.name[0];
        setFeedback(`¡Casi! ${currentObject?.display} empieza con la letra ${correctLetter}`);
        speakSpanish(`¡Casi! ${currentObject?.display} empieza con la letra ${correctLetter}`);
        setTimeout(() => setFeedback(''), 2500);
      }
    };
    
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, currentObject, wagonsFilled, correctCount, incorrectCount]);

  const restart = () => {
    setWagonsFilled({ M: false, P: false, L: false });
    setScore(0);
    setGameState('playing');
    setTrainOffset(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    const obj = pickNewObject({ M: false, P: false, L: false });
    setCurrentObject(obj);
    if (obj) setTimeout(() => speakSpanish(obj.name, true), 300);
  };

  const replayAudio = () => {
    if (currentObject) speakSpanish(currentObject.name, true);
  };

  const fallingLetters = gameState === 'won' ? [
    { letter: 'M', x: -3, color: '#f43f5e', delay: 0 },
    { letter: 'P', x: 0, color: '#3b82f6', delay: 300 },
    { letter: 'L', x: 3, color: '#fbbf24', delay: 600 },
    { letter: 'A', x: -5, color: '#10b981', delay: 900 },
    { letter: 'O', x: 5, color: '#a855f7', delay: 1200 },
    { letter: 'E', x: -2, color: '#f97316', delay: 1500 },
  ] : [];

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <CameraSetup />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <Scenery />
          <Train wagonsFilled={wagonsFilled} trainOffset={trainOffset} />
          {gameState === 'playing' && currentObject && (
            <DraggableObject
              currentObject={currentObject}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              dragPos={dragPos}
              springBackTo={springBackTo}
            />
          )}
          <DragController isDragging={isDragging} dragPos={dragPos} />
          {fallingLetters.map((fl, i) => <FallingLetter key={i} {...fl} />)}
        </Suspense>
      </Canvas>

      {/* HUD (Glassmorphic) */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10">
        <div className="font-sans text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Tren de las Letras</div>
          <div className="text-base font-extrabold text-purple-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-400" /> Vagones llenos: {score} / 3
          </div>
          <div className="flex gap-1.5 mt-1">
            {WAGONS.map(w => (
              <div
                key={w.letter}
                className={`px-2.5 py-0.5 rounded-md border font-black text-xs ${
                  wagonsFilled[w.letter]
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-700/30 text-slate-400'
                }`}
              >
                {w.letter} {wagonsFilled[w.letter] ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-sm text-center z-10">
        <div className="font-sans text-sm flex flex-col items-center">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-purple-400" /> Instrucción
          </div>
          <div className="text-indigo-200 font-semibold">Arrastra el juguete al vagón con su primera letra.</div>
        </div>
      </div>

      <button
        onClick={() => setShowHelpModal(true)}
        className="absolute top-4 right-28 p-2.5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 flex items-center justify-center pointer-events-auto"
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

      {/* Speaker trigger button */}
      {gameState === 'playing' && currentObject && (
        <button
          onClick={replayAudio}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all duration-200 shadow-2xl hover:scale-105 cursor-pointer flex items-center gap-2 text-base uppercase z-10 pointer-events-auto"
        >
          <Volume2 className="w-5 h-5 text-white animate-pulse" /> Escuchar: {currentObject.display}
        </button>
      )}

      {/* Action feedback popup */}
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
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Tren de las Letras?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Clasifica los objetos espaciales y arrástralos al vagón de tren que tenga su letra inicial correspondiente.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Observa el objeto 3D que flota arriba cerca de la nube.</li>
                  <li>Haz clic en el botón <b>"Escuchar"</b> para oír su nombre en español.</li>
                  <li>Haz <b>clic y arrastra</b> el objeto para moverlo por la pantalla.</li>
                  <li>Suéltalo en el vagón de tren que tenga la letra inicial correcta (por ejemplo, arrastra <b>MANZANA</b> al vagón con la letra <b>M</b>).</li>
                  <li>Llena los 3 vagones correctamente para hacer arrancar el tren y ganar la ronda.</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-6 bg-[#f43f5e] rounded flex items-center justify-center text-xs font-black text-white shadow">M</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡VAGÓN CORRECTO! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Si dejas caer el objeto en su letra inicial, el vagón se marca como completo.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-10 h-6 bg-[#3b82f6] rounded flex items-center justify-center text-xs font-black text-white shadow">P</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡VAGÓN INCORRECTO! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Si fallas, el objeto volverá arriba y recibirás una pista de voz en español.</p>
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

export default Game8Train;
