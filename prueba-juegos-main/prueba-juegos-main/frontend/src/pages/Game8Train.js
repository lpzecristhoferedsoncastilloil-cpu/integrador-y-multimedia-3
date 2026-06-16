import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
// Objects categorized by first letter
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
    { name: 'LAPIZ', display: 'Lapiz', type: 'lapiz' },
    { name: 'LIBRO', display: 'Libro', type: 'libro' },
    { name: 'LUNA', display: 'Luna', type: 'luna' },
  ],
};

const WAGONS = [
  { letter: 'M', x: -3.5, color: '#FF3B30' },
  { letter: 'P', x: 0, color: '#1E90FF' },
  { letter: 'L', x: 3.5, color: '#FFCC00' },
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

// Speech synthesis helper
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

// 3D object renderers
const ToyObject = ({ type }) => {
  switch (type) {
    case 'pato':
      return (
        <group>
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshLambertMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0.25, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshLambertMaterial color="#FFD700" />
          </mesh>
          <mesh position={[0.45, 0.3, 0]} castShadow rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.08, 0.18, 8]} />
            <meshLambertMaterial color="#FF8C00" />
          </mesh>
          <mesh position={[0.3, 0.38, 0.12]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      );
    case 'pelota':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshLambertMaterial color="#FF3B30" />
          </mesh>
          <mesh position={[0, 0.001, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.35, 0.04, 8, 24]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      );
    case 'perro':
      return (
        <group>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 0.35, 0.3]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0.3, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshLambertMaterial color="#A0522D" />
          </mesh>
          <mesh position={[0.25, 0.35, 0.1]} castShadow>
            <coneGeometry args={[0.08, 0.15, 6]} />
            <meshLambertMaterial color="#5D2906" />
          </mesh>
          <mesh position={[0.25, 0.35, -0.1]} castShadow>
            <coneGeometry args={[0.08, 0.15, 6]} />
            <meshLambertMaterial color="#5D2906" />
          </mesh>
          <mesh position={[-0.35, 0.15, 0]}>
            <boxGeometry args={[0.15, 0.05, 0.05]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        </group>
      );
    case 'mesa':
      return (
        <group>
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.7, 0.06, 0.5]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          {[[-0.3, -0.05, -0.2], [0.3, -0.05, -0.2], [-0.3, -0.05, 0.2], [0.3, -0.05, 0.2]].map((p, i) => (
            <mesh key={i} position={p} castShadow>
              <boxGeometry args={[0.06, 0.4, 0.06]} />
              <meshLambertMaterial color="#5D2906" />
            </mesh>
          ))}
        </group>
      );
    case 'manzana':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshLambertMaterial color="#E53935" />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
            <meshLambertMaterial color="#5D4037" />
          </mesh>
          <mesh position={[0.1, 0.38, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.18, 0.04, 0.1]} />
            <meshLambertMaterial color="#4CAF50" />
          </mesh>
        </group>
      );
    case 'mariposa':
      return (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          <mesh position={[-0.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.25, 0.5, 4]} />
            <meshLambertMaterial color="#E91E63" />
          </mesh>
          <mesh position={[0.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.25, 0.5, 4]} />
            <meshLambertMaterial color="#9C27B0" />
          </mesh>
        </group>
      );
    case 'lapiz':
      return (
        <group rotation={[0, 0, Math.PI / 4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
            <meshLambertMaterial color="#FFCC00" />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <coneGeometry args={[0.07, 0.1, 8]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
            <meshLambertMaterial color="#FF69B4" />
          </mesh>
        </group>
      );
    case 'libro':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.12, 0.45]} />
            <meshLambertMaterial color="#1E88E5" />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.55, 0.02, 0.4]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </group>
      );
    case 'luna':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshLambertMaterial color="#FFF59D" />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.27, 16, 16]} />
            <meshLambertMaterial color="#87CEEB" />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshLambertMaterial color="#FF00FF" />
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
        <meshLambertMaterial color="#666666" />
      </mesh>
      {[-12, -8, -4, 0, 4, 8, 12].map(x => (
        <mesh key={x} position={[x - trainOffset, -0.02, 0]}>
          <boxGeometry args={[1.5, 0.05, 1]} />
          <meshLambertMaterial color="#3E2723" />
        </mesh>
      ))}
      {/* Locomotive */}
      <group position={[-6.5, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.8, 0.9]} />
          <meshLambertMaterial color="#212121" />
        </mesh>
        <mesh position={[0.5, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 12]} />
          <meshLambertMaterial color="#424242" />
        </mesh>
        <mesh position={[-0.6, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshLambertMaterial color="#FFCC00" />
        </mesh>
        <mesh position={[-0.6, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshLambertMaterial color="#FFCC00" />
        </mesh>
      </group>
      {/* Wagons */}
      {WAGONS.map((wagon) => (
        <group key={wagon.letter} position={[wagon.x, 0.3, 0]}>
          {/* Wagon body */}
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.8, 0.9]} />
            <meshLambertMaterial color={wagon.color} />
          </mesh>
          {/* Open top - lighter inner */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.4, 0.5, 0.7]} />
            <meshLambertMaterial color="#FFFFFF" opacity={0.3} transparent />
          </mesh>
          {/* Letter on side */}
          <Text position={[0, 0.05, 0.46]} fontSize={0.55} color="#FFFFFF" anchorX="center" anchorY="middle" fontWeight="bold" outlineColor="#000000" outlineWidth={0.05}>
            {wagon.letter}
          </Text>
          {/* Wheels */}
          <mesh position={[-0.5, -0.4, 0.5]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          <mesh position={[0.5, -0.4, 0.5]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          <mesh position={[-0.5, -0.4, -0.5]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          <mesh position={[0.5, -0.4, -0.5]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshLambertMaterial color="#3E2723" />
          </mesh>
          {/* Star sparkle when filled */}
          {wagonsFilled[wagon.letter] && (
            <mesh position={[0, 0.8, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

const Scenery = (props) => {
  const { } = filterProps(props);
  return (
    <group>
      {/* Grass floor */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[40, 0.2, 30]} />
        <meshLambertMaterial color="#7CB342" />
      </mesh>
      {/* Mountains */}
      {[[-10, -10], [-5, -12], [5, -11], [10, -10]].map((p, i) => (
        <mesh key={i} position={[p[0], 0, p[1]]} castShadow>
          <coneGeometry args={[2.5, 3, 8]} />
          <meshLambertMaterial color={i % 2 ? '#8D6E63' : '#A1887F'} />
        </mesh>
      ))}
      {/* Trees */}
      {[[-8, -5], [8, -5], [-6, -8], [6, -8], [-12, -4], [12, -4]].map((p, i) => (
        <group key={i} position={[p[0], 0, p[1]]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 6]} />
            <meshLambertMaterial color="#5D4037" />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshLambertMaterial color="#2E7D32" />
          </mesh>
        </group>
      ))}
      {/* Cloud */}
      <group position={[0, CLOUD_Y, CLOUD_Z]}>
        <mesh castShadow>
          <sphereGeometry args={[0.8, 12, 12]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[-0.6, -0.1, 0]} castShadow>
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.6, -0.1, 0]} castShadow>
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.2, -0.3, 0]} castShadow>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </group>
  );
};

const DraggableObject = (props) => {
  const { currentObject, isDragging, setIsDragging, dragPos, springBackTo, onCheckDrop } = filterProps(props);
  const groupRef = useRef();
  const positionRef = useRef({ x: 0, y: CLOUD_Y, z: CLOUD_Z });
  const targetRef = useRef({ x: 0, y: CLOUD_Y, z: CLOUD_Z });
  const animStateRef = useRef('idle'); // idle, dragging, springback

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (isDragging && dragPos.current) {
      positionRef.current.x = dragPos.current.x;
      positionRef.current.y = dragPos.current.y;
      positionRef.current.z = dragPos.current.z;
      animStateRef.current = 'dragging';
    } else if (springBackTo.current) {
      // Spring back to cloud
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
      // Idle bobbing on cloud
      positionRef.current.x = 0;
      positionRef.current.y = CLOUD_Y + OBJECT_IDLE_Y_OFFSET + Math.sin(state.clock.elapsedTime * 3) * 0.12;
      positionRef.current.z = CLOUD_Z;
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
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
    >
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
      <Text position={[0, 0, 0.12]} fontSize={0.55} color="#FFFFFF" anchorX="center" anchorY="middle" fontWeight="bold" outlineColor="#000000" outlineWidth={0.04}>
        {letter}
      </Text>
    </group>
  );
};

const Game8Train = () => {
  const navigate = useNavigate();
  const [wagonsFilled, setWagonsFilled] = useState({ M: false, P: false, L: false });
  const [currentObject, setCurrentObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [trainOffset, setTrainOffset] = useState(0);
  const dragPos = useRef({ x: 0, y: 2.5, z: -2 });
  const springBackTo = useRef(null);

  const pickNewObject = (filled) => {
    const available = Object.keys(filled).filter(k => !filled[k]);
    if (available.length === 0) return null;
    const letter = available[Math.floor(Math.random() * available.length)];
    const options = OBJECTS[letter];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Initial object spawn
  useEffect(() => {
    const obj = pickNewObject(wagonsFilled);
    setCurrentObject(obj);
    if (obj) {
      setTimeout(() => speakSpanish(obj.name, true), 500);
    }
  }, []);

  // Victory animation: train moves off screen
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
    speakSpanish('Felicidades! Lo lograste!');
    animate();
    return () => cancelAnimationFrame(raf);
  }, [gameState]);

  // Global pointer up handler
  useEffect(() => {
    const handleUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      // Check drop position
      const pos = dragPos.current;
      let droppedWagon = null;
      // Wagons are at z=WAGON_Z (5) +- 0.45, x at WAGONS[i].x +- 0.8
      if (pos && Math.abs(pos.z - WAGON_Z) < 1.5) {
        for (const w of WAGONS) {
          if (Math.abs(pos.x - w.x) < 1.2) {
            droppedWagon = w.letter;
            break;
          }
        }
      }

      if (droppedWagon && currentObject && droppedWagon === currentObject.name[0]) {
        // Correct!
        const newFilled = { ...wagonsFilled, [droppedWagon]: true };
        setWagonsFilled(newFilled);
        setScore(prev => prev + 1);
        setFeedback(`Excelente! Metiste el ${currentObject.display} en la ${droppedWagon}!`);
        speakSpanish(`Excelente! Metiste el ${currentObject.display} en la ${droppedWagon}!`);
        setTimeout(() => setFeedback(''), 2500);

        // Check win
        if (Object.values(newFilled).every(v => v)) {
          setTimeout(() => setGameState('won'), 1000);
        } else {
          // Spawn next object
          setTimeout(() => {
            const next = pickNewObject(newFilled);
            setCurrentObject(next);
            if (next) {
              setTimeout(() => speakSpanish(next.name, true), 300);
            }
          }, 1200);
        }
      } else {
        // Wrong - friendly bounce back
        springBackTo.current = { x: 0, y: CLOUD_Y + OBJECT_IDLE_Y_OFFSET, z: CLOUD_Z };
        const correctLetter = currentObject?.name[0];
        setFeedback(`Oh, casi! ${currentObject?.display} empieza con la ${correctLetter}!`);
        speakSpanish(`Oh, casi! ${currentObject?.display} empieza con la ${correctLetter}!`);
        setTimeout(() => setFeedback(''), 2500);
      }
    };
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, currentObject, wagonsFilled]);

  const restart = () => {
    setWagonsFilled({ M: false, P: false, L: false });
    setScore(0);
    setGameState('playing');
    setTrainOffset(0);
    const obj = pickNewObject({ M: false, P: false, L: false });
    setCurrentObject(obj);
    if (obj) setTimeout(() => speakSpanish(obj.name, true), 300);
  };

  const replayAudio = () => {
    if (currentObject) speakSpanish(currentObject.name, true);
  };

  // Falling letters for victory
  const fallingLetters = gameState === 'won' ? [
    { letter: 'M', x: -3, color: '#FF3B30', delay: 0 },
    { letter: 'P', x: 0, color: '#1E90FF', delay: 300 },
    { letter: 'L', x: 3, color: '#FFCC00', delay: 600 },
    { letter: 'A', x: -5, color: '#4CD964', delay: 900 },
    { letter: 'O', x: 5, color: '#9B59B6', delay: 1200 },
    { letter: 'E', x: -2, color: '#FF8C00', delay: 1500 },
  ] : [];

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#87CEEB', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <CameraSetup />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
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

      {/* HUD */}
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto bg-white border-4 border-black p-4" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }} data-testid="train-hud">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '22px' }}>
            <div>OBJETOS: {score} / 3</div>
            <div className="flex gap-2 mt-2">
              {WAGONS.map(w => (
                <div key={w.letter} className="px-3 py-1 border-2 border-black" style={{ backgroundColor: wagonsFilled[w.letter] ? '#4CD964' : '#E0E0E0' }}>
                  {w.letter} {wagonsFilled[w.letter] ? '✓' : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="pointer-events-auto bg-yellow-400 border-4 border-black p-4 max-w-md" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}>
            <div>EL TREN DE LAS LETRAS</div>
            <div className="text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Arrastra el juguete al vagon con su primera letra
            </div>
          </div>
        </div>
        <button data-testid="train-exit-button" onClick={() => navigate('/')} className="pointer-events-auto px-4 py-2 bg-red-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>SALIR</button>
      </div>

      {/* Audio replay button */}
      {gameState === 'playing' && currentObject && (
        <button
          data-testid="train-replay-audio-button"
          onClick={replayAudio}
          className="fixed top-32 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10 px-6 py-3 bg-orange-400 border-4 border-black flex items-center gap-2"
          style={{ fontFamily: 'VT323, monospace', fontSize: '24px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
        >
          📢 {currentObject.display}
        </button>
      )}

      {feedback && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white border-4 border-black p-4 z-20" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: 'VT323, monospace', fontSize: '22px', maxWidth: '90%' }} data-testid="train-feedback">
          {feedback}
        </div>
      )}

      {gameState === 'won' && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-white border-4 border-black p-8 max-w-md text-center pointer-events-auto" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }} data-testid="train-win-modal">
            <h2 className="text-5xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#4CD964' }}>¡VICTORIA!</h2>
            <p className="mb-2 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>¡Llenaste todos los vagones!</p>
            <p className="mb-6 text-3xl" style={{ fontFamily: 'VT323, monospace' }}>¡Chuuu Chuuu! 🚂</p>
            <div className="flex gap-3 justify-center">
              <button data-testid="train-restart-button" onClick={restart} className="px-6 py-3 bg-yellow-400 border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>JUGAR DE NUEVO</button>
              <button data-testid="train-back-button" onClick={() => navigate('/')} className="px-6 py-3 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>MENU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game8Train;
