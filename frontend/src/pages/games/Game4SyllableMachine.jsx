import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Settings, Play, Info, HelpCircle } from 'lucide-react';
import api from '../../services/api';

// SVG drawings representing prefix concepts for 10-year-olds
const DrawingSVG = ({ type }) => {
  const normType = type.toLowerCase()
    .replace('é', 'e')
    .replace('í', 'i')
    .replace('ó', 'o')
    .replace('á', 'a')
    .replace('ú', 'u');

  switch (normType) {
    case 'despeinar':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#f43f5e" />
          <path d="M 25 50 L 75 50 M 25 50 L 25 60 M 35 50 L 35 60 M 45 50 L 45 60 M 55 50 L 55 60 M 65 50 L 65 60 M 75 50 L 75 60" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <path d="M 40 30 L 60 42 M 60 30 L 40 42" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="30" r="3" stroke="#ffffff" strokeWidth="2" fill="none" />
          <circle cx="60" cy="30" r="3" stroke="#ffffff" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'injusto':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#64748b" />
          <line x1="50" y1="20" x2="50" y2="75" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="75" x2="70" y2="75" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <line x1="25" y1="30" x2="75" y2="45" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <line x1="25" y1="30" x2="20" y2="55" stroke="#ffffff" strokeWidth="2" />
          <line x1="25" y1="30" x2="30" y2="55" stroke="#ffffff" strokeWidth="2" />
          <path d="M 15 55 Q 25 60 35 55 Z" fill="#ffffff" />
          <line x1="75" y1="45" x2="70" y2="70" stroke="#ffffff" strokeWidth="2" />
          <line x1="75" y1="45" x2="80" y2="70" stroke="#ffffff" strokeWidth="2" />
          <path d="M 65 70 Q 75 75 85 70 Z" fill="#ffffff" />
        </svg>
      );
    case 'desatar':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#0d9488" />
          <path d="M 15 50 Q 30 35 42 50" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 85 50 Q 70 65 58 50" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" />
          <line x1="50" y1="35" x2="50" y2="42" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="65" x2="50" y2="58" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'reescribir':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#0284c7" />
          <rect x="30" y="25" width="35" height="45" rx="3" fill="#ffffff" />
          <line x1="37" y1="35" x2="58" y2="35" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="37" y1="45" x2="58" y2="45" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="37" y1="55" x2="50" y2="55" stroke="#94a3b8" strokeWidth="2.5" />
          <path d="M 52 65 L 75 35 L 80 40 L 57 70 Z" fill="#eab308" />
          <polygon points="52,65 50,72 57,70" fill="#000" />
          <path d="M 25 75 A 15 15 0 0 1 45 75" fill="none" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          <polygon points="45,71 49,75 45,79" fill="#facc15" />
        </svg>
      );
    case 'subsuelo':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#15803d" />
          <rect x="20" y="25" width="60" height="10" fill="#22c55e" />
          <rect x="20" y="35" width="60" height="20" fill="#b45309" />
          <rect x="20" y="55" width="60" height="20" fill="#475569" />
          <line x1="50" y1="20" x2="50" y2="48" stroke="#ffffff" strokeWidth="3.5" />
          <rect x="42" y="16" width="16" height="4" fill="#ffffff" />
          <polygon points="44,48 56,48 50,60" fill="#cbd5e1" />
        </svg>
      );
    case 'inutil':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#4b5563" />
          <circle cx="50" cy="50" r="22" stroke="#ffffff" strokeWidth="6" fill="none" />
          <line x1="32" y1="32" x2="68" y2="68" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'television':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#1e293b" />
          <rect x="22" y="32" width="56" height="42" rx="6" fill="#475569" stroke="#ffffff" strokeWidth="3" />
          <rect x="28" y="38" width="36" height="30" fill="#000000" />
          <line x1="50" y1="32" x2="35" y2="15" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="32" x2="65" y2="15" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="35" cy="15" r="3" fill="#ef4444" />
          <circle cx="65" cy="15" r="3" fill="#ef4444" />
          <circle cx="70" cy="44" r="3" fill="#ffffff" />
          <circle cx="70" cy="52" r="3" fill="#ffffff" />
        </svg>
      );
    case 'antivirus':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#4338ca" />
          <path d="M 32 30 L 50 20 L 68 30 C 68 50 50 68 50 68 C 50 68 32 50 32 30 Z" fill="#2563eb" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M 42 45 L 48 51 L 58 39" stroke="#10b981" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'prehistoria':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#78350f" />
          <line x1="30" y1="68" x2="70" y2="52" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
          <line x1="30" y1="52" x2="70" y2="68" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
          <path d="M 50 20 C 62 38 58 60 50 62 C 42 60 38 38 50 20 Z" fill="#ef4444" />
          <path d="M 50 32 C 58 45 55 58 50 60 C 45 58 42 45 50 32 Z" fill="#f97316" />
          <path d="M 50 42 C 54 50 52 58 50 59 C 48 58 46 50 50 42 Z" fill="#facc15" />
        </svg>
      );
    case 'superheroe':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#b91c1c" />
          <polygon points="50,22 58,38 76,41 63,54 66,72 50,64 34,72 37,54 24,41 42,38" fill="#facc15" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'contradecir':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#312e81" />
          <rect x="22" y="28" width="34" height="22" rx="4" fill="#f43f5e" />
          <polygon points="28,50 34,50 30,55" fill="#f43f5e" />
          <line x1="30" y1="39" x2="48" y2="39" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="44" y="44" width="34" height="22" rx="4" fill="#06b6d4" />
          <polygon points="72,66 66,66 70,71" fill="#06b6d4" />
          <line x1="52" y1="55" x2="70" y2="55" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );
    case 'multicolor':
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          <circle cx="50" cy="50" r="40" fill="#e2e8f0" />
          <path d="M 50 50 L 50 14 A 36 36 0 0 1 86 50 Z" fill="#ef4444" />
          <path d="M 50 50 L 86 50 A 36 36 0 0 1 50 86 Z" fill="#10b981" />
          <path d="M 50 50 L 50 86 A 36 36 0 0 1 14 50 Z" fill="#3b82f6" />
          <path d="M 50 50 L 14 50 A 36 36 0 0 1 50 14 Z" fill="#facc15" />
        </svg>
      );
    default:
      return null;
  }
};

// Word recipes grouped by 6 levels (3 words per level)
const LEVELS_RECIPES = [
  // Level 1: Very Easy (2 parts, prefix visible)
  [
    { parts: ['DES', 'PEINAR'], full: 'DESPEINAR', meaning: '¿Cómo está tu cabello al despertarte de la cama?' },
    { parts: ['IN', 'JUSTO'], full: 'INJUSTO', meaning: '¿Qué sientes cuando una acción no es equitativa?' },
    { parts: ['DES', 'ATAR'], full: 'DESATAR', meaning: '¿Qué le haces a un nudo ciego para poder soltarlo?' },
  ],
  // Level 2: Easy (2 parts, prefix visible)
  [
    { parts: ['RE', 'ESCRIBIR'], full: 'REESCRIBIR', meaning: '¿Qué haces para corregir y mejorar un texto escrito?' },
    { parts: ['SUB', 'SUELO'], full: 'SUBSUELO', meaning: '¿Cómo se le llama a la capa oculta bajo la tierra?' },
    { parts: ['IN', 'ÚTIL'], full: 'INÚTIL', meaning: '¿Cómo calificas a un objeto que ya no sirve para nada?' },
  ],
  // Level 3: Medium (2 parts, prefix visible)
  [
    { parts: ['TELE', 'VISIÓN'], full: 'TELEVISIÓN', meaning: '¿En qué pantalla ves tus series y dibujos animados?' },
    { parts: ['ANTI', 'VIRUS'], full: 'ANTIVIRUS', meaning: '¿Qué escudo protege tu computadora de archivos malos?' },
    { parts: ['PRE', 'HISTORIA'], full: 'PREHISTORIA', meaning: '¿En qué época lejana vivían los grandes dinosaurios?' },
  ],
  // Level 4: Medium-Hard (2 parts, prefix visible)
  [
    { parts: ['SUPER', 'HÉROE'], full: 'SUPERHÉROE', meaning: '¿Quién vuela con capa, tiene poderes y salva a la gente?' },
    { parts: ['CONTRA', 'DECIR'], full: 'CONTRADECIR', meaning: '¿Qué haces al afirmar lo opuesto de lo que otro dice?' },
    { parts: ['MULTI', 'COLOR'], full: 'MULTICOLOR', meaning: '¿Cómo describes un objeto lleno de muchos colores?' },
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
  const lastIndex = LEVELS_RECIPES[level - 1][0].parts.length - 1;
  const current = LEVELS_RECIPES[level - 1].map(r => r.parts[lastIndex]);
  const others = LEVELS_RECIPES.filter((_, idx) => idx !== level - 1).flatMap(l => l.map(r => r.parts[r.parts.length - 1]));
  const uniqueOthers = [...new Set(others)].filter(s => !current.includes(s));
  const selectedOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...new Set([...current, ...selectedOthers])];
};

const isPartPink = (partsCount, partIndex) => {
  if (partsCount === 2) {
    return partIndex === 0;
  }
  return partIndex === 0 || partIndex === 1;
};

const LEVEL_WIN_SCORE = 3; // 3 matches per level
const MAX_FAILS = 10; // 10 failures max before Game Over

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

// Spinning Gear component for toy factory wall
const SpinningGear = ({ position, radius, color, speed, teeth = 8 }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* Central Hub */}
      <mesh castShadow>
        <cylinderGeometry args={[radius * 0.35, radius * 0.35, 0.2, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.2} />
      </mesh>
      {/* Main Gear Cylinder */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.15, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Teeth */}
      {Array.from({ length: teeth }).map((_, idx) => {
        const angle = (idx / teeth) * Math.PI * 2;
        const toothWidth = radius * 0.35;
        const toothLength = radius * 1.3;
        return (
          <mesh 
            key={idx} 
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]} 
            rotation={[0, 0, angle]}
            castShadow
          >
            <boxGeometry args={[toothWidth, toothWidth, 0.15]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        );
      })}
      {/* Axle Pin */}
      <mesh position={[0, 0, 0.11]}>
        <cylinderGeometry args={[radius * 0.12, radius * 0.12, 0.05, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

// Animated Robot Arm component
const RobotArm = ({ position, baseColor, armColor }) => {
  const armRef1 = useRef();
  const armRef2 = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (armRef1.current) {
      armRef1.current.rotation.z = Math.sin(t * 1.2) * 0.22 - 0.15;
      armRef1.current.rotation.y = Math.cos(t * 0.6) * 0.12;
    }
    if (armRef2.current) {
      armRef2.current.rotation.x = Math.sin(t * 1.8) * 0.25;
    }
  });
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.35, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>
      {/* Joint sphere */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} />
      </mesh>
      {/* Upper arm */}
      <group ref={armRef1} position={[0, 0.25, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.9, 8]} />
          <meshStandardMaterial color={armColor} roughness={0.4} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color={baseColor} roughness={0.3} />
        </mesh>
        {/* Forearm */}
        <group ref={armRef2} position={[0, 0.9, 0]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.7, 8]} />
            <meshStandardMaterial color={armColor} roughness={0.4} />
          </mesh>
          {/* Tool head */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.25, 0.12, 0.25]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          {/* Glowing tip */}
          <mesh position={[0, 0.78, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// Candy Dispenser Spawner Tube
const SpawnerTube = ({ position, baseColor, isLeft }) => {
  return (
    <group position={position}>
      {/* Main Tube */}
      <mesh castShadow>
        <cylinderGeometry args={[0.7, 0.7, 2.0, 16]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Candy stripes */}
      {[0.4, 0.0, -0.4].map((yOffset, i) => (
        <mesh key={i} position={[0, yOffset, 0]} rotation={[0, isLeft ? Math.PI/6 : -Math.PI/6, 0]}>
          <torusGeometry args={[0.72, 0.06, 8, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}
      
      {/* Connector ring */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.15, 16]} />
        <meshStandardMaterial color="#facc15" metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Glass dome */}
      <mesh position={[0, 1.4, 0]} transparent>
        <sphereGeometry args={[0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      
      {/* Spinning Star inside the dome */}
      <SpinningStar position={[0, 1.25, 0]} color="#fbbf24" />
    </group>
  );
};

const SpinningStar = ({ position, color }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2.0;
      ref.current.rotation.z = state.clock.elapsedTime * 1.0;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.14, 0]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const ConveyorBelt = () => {
  return (
    <group>
      {/* Belt 1 (Rear lane, Pink channel - Left to Right) */}
      <mesh position={[0, 0, -0.8]} receiveShadow>
        <boxGeometry args={[16, 0.2, 1.0]} />
        <meshStandardMaterial color="#ec4899" metalness={0.1} roughness={0.4} />
      </mesh>
      {/* Rollers Belt 1 */}
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
        <mesh key={`r1-${i}`} position={[x, -0.1, -0.8]}>
          <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
      ))}
      {/* Left Tube spawner */}
      <SpawnerTube position={[-8, 2.5, -0.8]} baseColor="#f43f5e" isLeft={true} />
      {/* Support pole for Left Tube */}
      <mesh position={[-8, 0.6, -0.8]}>
        <cylinderGeometry args={[0.08, 0.08, 1.8, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Belt 2 (Front lane, Cyan channel - Right to Left) */}
      <mesh position={[0, 0, 0.8]} receiveShadow>
        <boxGeometry args={[16, 0.2, 1.0]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.1} roughness={0.4} />
      </mesh>
      {/* Rollers Belt 2 */}
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
        <mesh key={`r2-${i}`} position={[x, -0.1, 0.8]}>
          <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
      ))}
      {/* Right Tube spawner */}
      <SpawnerTube position={[8, 2.5, 0.8]} baseColor="#0ea5e9" isLeft={false} />
      {/* Support pole for Right Tube */}
      <mesh position={[8, 0.6, 0.8]}>
        <cylinderGeometry args={[0.08, 0.08, 1.8, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Toy Factory floor */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[24, 0.2, 10]} />
        <meshStandardMaterial color="#0f766e" roughness={0.5} />
      </mesh>
      {/* Floor border line */}
      <mesh position={[0, -0.89, 0]}>
        <boxGeometry args={[23.8, 0.02, 9.8]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} wireframe />
      </mesh>

      {/* Back Wall - Golden Sunny Yellow */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <boxGeometry args={[24, 8, 0.4]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.6} />
      </mesh>
      {/* Decorative wall panels */}
      {[-8.5, -4.5, -0.5, 3.5, 7.5].map((x, i) => (
        <mesh key={i} position={[x, 3, -4.7]} receiveShadow>
          <boxGeometry args={[0.1, 8, 0.1]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      ))}

      {/* Interlocking Gears on back wall */}
      <SpinningGear position={[-3, 4.2, -4.7]} radius={0.95} color="#ef4444" speed={0.5} teeth={8} />
      <SpinningGear position={[-1.4, 4.8, -4.7]} radius={0.75} color="#3b82f6" speed={-0.63} teeth={7} />
      <SpinningGear position={[0.2, 4.1, -4.7]} radius={0.85} color="#10b981" speed={0.56} teeth={8} />
      
      {/* Decorative toy pipes on back wall */}
      <mesh position={[-6.5, 2.0, -4.75]}>
        <cylinderGeometry args={[0.08, 0.08, 4.0, 8]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.3} />
      </mesh>
      <mesh position={[-6.5, 4.0, -4.75]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      <mesh position={[-5.0, 4.0, -4.75]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.08, 0.08, 3.0, 8]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.3} />
      </mesh>

      <mesh position={[5.5, 2.5, -4.75]}>
        <cylinderGeometry args={[0.08, 0.08, 5.0, 8]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} />
      </mesh>
      <mesh position={[5.5, 5.0, -4.75]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[4.0, 5.0, -4.75]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.08, 0.08, 3.0, 8]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} />
      </mesh>

      {/* Robot Arms at sides */}
      <RobotArm position={[-9.5, -0.9, 1.5]} baseColor="#ef4444" armColor="#facc15" />
      <RobotArm position={[9.5, -0.9, -1.5]} baseColor="#0ea5e9" armColor="#10b981" />
    </group>
  );
};

const SyllableBlock = (props) => {
  const { block, isSelected, onClick } = filterProps(props);
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && block) {
      groupRef.current.position.x = block.x;
      groupRef.current.position.z = block.z;
      // Faster and higher bounce on hover to excite kids!
      const floatSpeed = isHovered ? 8 : 4;
      const floatAmplitude = isHovered ? 0.08 : 0.05;
      groupRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * floatSpeed + block.id) * floatAmplitude;
    }
  });

  const baseColor = isSelected ? '#10b981' : (block.colorType === 'pink' ? '#f43f5e' : '#0ea5e9');
  const color = isHovered ? '#fbbf24' : baseColor; // Turn golden yellow on hover
  const scale = isHovered ? [1.12, 1.12, 1.12] : [1, 1, 1];
  const emissive = isHovered ? '#f59e0b' : '#000000';
  const emissiveIntensity = isHovered ? 1.5 : 0;

  return (
    <group 
      ref={groupRef} 
      position={[block.x, 0.6, block.z]} 
      scale={scale}
      onClick={(e) => { 
        e.stopPropagation(); 
        onClick(block); 
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.8, 0.8]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.1}
          emissive={emissive} 
          emissiveIntensity={emissiveIntensity} 
        />
      </mesh>
      {/* Corner light dots to look like a Lego/toy block */}
      {[-0.7, 0.7].map((cx) => (
        [-0.3, 0.3].map((cz) => (
          <mesh key={`${cx}-${cz}`} position={[cx, 0.41, cz]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))
      ))}
      <Text position={[0, 0, 0.42]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
        {block.text}
      </Text>
    </group>
  );
};

const Game4SyllableMachine = ({ player, onFinish }) => {

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

  const selectedBlocksRef = useRef([]);
  useEffect(() => {
    selectedBlocksRef.current = selectedBlocks;
  }, [selectedBlocks]);

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

  // Spawn blocks on the two parallel conveyor belts
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawn = () => {
      if (Date.now() < jamUntil) return;
      setBlocks(prev => {
        if (prev.length >= 8) return prev;

        const isThreeParts = recipe.parts.length === 3;
        const spawnOnBelt1 = Math.random() < 0.5;

        const currentStep = selectedBlocksRef.current.length;
        const neededPart = currentStep < recipe.parts.length ? recipe.parts[currentStep] : null;

        if (spawnOnBelt1) {
          // Belt 1: Pink blocks (Prefix/Root) traveling Left to Right (x starts at -8)
          const isTooClose = prev.some(b => b.z === -0.8 && b.x < -5.0);
          if (isTooClose) return prev;

          const prefixPool = getPrefixPool(currentLevel);
          let pool = prefixPool;
          if (isThreeParts) {
            const rootPool = LEVELS_RECIPES[currentLevel - 1].map(r => r.parts[1]);
            pool = [...prefixPool, ...rootPool];
          }

          let text = "";
          const needsPink = neededPart ? isPartPink(recipe.parts.length, currentStep) : false;

          if (needsPink && neededPart && Math.random() < 0.65) {
            text = neededPart;
          } else {
            text = pool[Math.floor(Math.random() * pool.length)];
          }

          return [...prev, {
            id: blockIdRef.current++,
            text,
            z: -0.8,
            colorType: 'pink',
            x: -8,
            spawnTime: Date.now(),
          }];
        } else {
          // Belt 2: Cyan blocks (Suffix) traveling Right to Left (x starts at 8)
          const isTooClose = prev.some(b => b.z === 0.8 && b.x > 5.0);
          if (isTooClose) return prev;

          const suffixPool = getSuffixPool(currentLevel);

          let text = "";
          const needsCyan = neededPart ? !isPartPink(recipe.parts.length, currentStep) : false;

          if (needsCyan && neededPart && Math.random() < 0.65) {
            text = neededPart;
          } else {
            text = suffixPool[Math.floor(Math.random() * suffixPool.length)];
          }

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
    const currentStep = selectedBlocks.length; // 0, 1, or 2

    if (block.text === recipeParts[currentStep]) {
      const nextBlocks = [...selectedBlocks, block];
      setSelectedBlocks(nextBlocks);
      setBlocks(prev => prev.filter(b => b.id !== block.id));
      
      if (nextBlocks.length === recipeParts.length) {
        const newLevelScore = levelScore + 1;
        const newCorrectCount = correctCount + 1;
        setLevelScore(newLevelScore);
        setCorrectCount(newCorrectCount);
      playCorrectSound();;
      playCorrectSound();
        setFeedback(`¡CORRECTO! ${recipeParts.join(' + ')} = ${recipe.full}`);
        
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
        setFeedback(`¡Bien! "${block.text}" colocado. Sigue con la siguiente parte.`);
        setTimeout(() => setFeedback(''), 1500);
      }
    } else {
      handleIncorrectClick();
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
          
          {/* Level 1-4 Drawing Help */}
          {recipe.parts.length === 2 && (
            <div className="my-2 bg-slate-950/60 p-3 rounded-2xl border border-indigo-500/20 flex items-center justify-center shadow-inner">
              <DrawingSVG type={recipe.full} />
            </div>
          )}

          <div className="text-indigo-200 font-bold mb-1 text-sm">
            {recipe.parts.length === 2 ? (
              <>
                Combina: <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 1 ? selectedBlocks[0].text : '[Prefijo]'}</span> + <span className="text-cyan-400 font-black">{selectedBlocks.length >= 2 ? selectedBlocks[1].text : '[Sufijo]'}</span>
              </>
            ) : (
              <>
                Combina: <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 1 ? selectedBlocks[0].text : '[Prefijo]'}</span> + <span className="text-pink-400 font-extrabold">{selectedBlocks.length >= 2 ? selectedBlocks[1].text : '[Raíz]'}</span> + <span className="text-cyan-400 font-black">{selectedBlocks.length >= 3 ? selectedBlocks[2].text : '[Sufijo]'}</span>
              </>
            )}
          </div>
          
          <div className="text-[11px] text-yellow-300 font-bold leading-normal max-w-xs mt-1">
            Pista: "{recipe.meaning}"
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
                Combina las partes correctas (prefijos, raíces, sufijos) en las dos líneas de montaje paralelas para construir la palabra de la pista.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Mira el dibujo de ayuda y lee la pista (ej. El dibujo de <b>INJUSTO</b>).</li>
                  <li>Selecciona las partes correspondientes en orden (ej: <b>IN</b> en la banda de atrás y luego <b>JUSTO</b> en la banda de adelante).</li>
                  <li>Los bloques <b>Rosas (Prefijos/Raíces)</b> avanzan en la banda de atrás (de izquierda a derecha).</li>
                  <li>Los bloques <b>Azules (Sufijos)</b> avanzan en la banda de adelante (de derecha a izquierda).</li>
                  <li>En los niveles 5 y 6, debes armar palabras de 3 partes en orden guiándote por la pista de texto.</li>
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
