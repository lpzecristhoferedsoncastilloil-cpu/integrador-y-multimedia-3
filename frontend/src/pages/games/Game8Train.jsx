import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { Volume2, Award, Info, HelpCircle } from 'lucide-react';
import * as THREE from 'three';
import api from '../../services/api';

const LEVELS_CONFIG = [
  {
    level: 1,
    wagons: [
      { letter: 'M', x: -3.5, color: '#f43f5e' },
      { letter: 'P', x: 0, color: '#3b82f6' },
      { letter: 'L', x: 3.5, color: '#fbbf24' },
    ],
    objects: {
      M: { name: 'MESA', display: 'Mesa', type: 'mesa' },
      P: { name: 'PATO', display: 'Pato', type: 'pato' },
      L: { name: 'LUNA', display: 'Luna', type: 'luna' },
    }
  },
  {
    level: 2,
    wagons: [
      { letter: 'S', x: -3.5, color: '#10b981' },
      { letter: 'T', x: 0, color: '#8b5cf6' },
      { letter: 'B', x: 3.5, color: '#ec4899' },
    ],
    objects: {
      S: { name: 'SAPO', display: 'Sapo', type: 'sapo' },
      T: { name: 'TREN', display: 'Tren', type: 'tren' },
      B: { name: 'BOTA', display: 'Bota', type: 'bota' },
    }
  },
  {
    level: 3,
    wagons: [
      { letter: 'G', x: -3.5, color: '#3b82f6' },
      { letter: 'F', x: 0, color: '#f43f5e' },
      { letter: 'V', x: 3.5, color: '#10b981' },
    ],
    objects: {
      G: { name: 'GATO', display: 'Gato', type: 'gato' },
      F: { name: 'FLOR', display: 'Flor', type: 'flor' },
      V: { name: 'VACA', display: 'Vaca', type: 'vaca' },
    }
  },
  {
    level: 4,
    wagons: [
      { letter: 'D', x: -3.5, color: '#fbbf24' },
      { letter: 'C', x: 0, color: '#8b5cf6' },
      { letter: 'N', x: 3.5, color: '#06b6d4' },
    ],
    objects: {
      D: { name: 'DADO', display: 'Dado', type: 'dado' },
      C: { name: 'CASA', display: 'Casa', type: 'casa' },
      N: { name: 'NUBE', display: 'Nube', type: 'nube' },
    }
  },
  {
    level: 5,
    wagons: [
      { letter: 'R', x: -3.5, color: '#ec4899' },
      { letter: 'H', x: 0, color: '#f97316' },
      { letter: 'E', x: 3.5, color: '#fbbf24' },
    ],
    objects: {
      R: { name: 'RATON', display: 'Ratón', type: 'raton' },
      H: { name: 'HELADO', display: 'Helado', type: 'helado' },
      E: { name: 'ESTRELLA', display: 'Estrella', type: 'estrella' },
    }
  },
  {
    level: 6,
    wagons: [
      { letter: 'V', x: -3.5, color: '#3b82f6' },
      { letter: 'G', x: 0, color: '#10b981' },
      { letter: 'E', x: 3.5, color: '#8b5cf6' },
    ],
    objects: {
      V: { name: 'VENTANA', display: 'Ventana', type: 'ventana' },
      G: { name: 'GLOBO', display: 'Globo', type: 'globo' },
      E: { name: 'ELEFANTE', display: 'Elefante', type: 'elefante' },
    }
  },
  {
    level: 7,
    wagons: [
      { letter: 'J', x: -3.5, color: '#f43f5e' },
      { letter: 'C', x: 0, color: '#fbbf24' },
      { letter: 'D', x: 3.5, color: '#f97316' },
    ],
    objects: {
      J: { name: 'JUGUETE', display: 'Juguete', type: 'juguete' },
      C: { name: 'COCHE', display: 'Coche', type: 'coche' },
      D: { name: 'DINOSAURIO', display: 'Dinosaurio', type: 'dinosaurio' },
    }
  },
  {
    level: 8,
    wagons: [
      { letter: 'A', x: -3.5, color: '#06b6d4' },
      { letter: 'C', x: 0, color: '#8b5cf6' },
      { letter: 'P', x: 3.5, color: '#3b82f6' },
    ],
    objects: {
      A: { name: 'ASTRONAUTA', display: 'Astronauta', type: 'astronauta' },
      C: { name: 'COMPUTADORA', display: 'Computadora', type: 'computadora' },
      P: { name: 'PANTALLA', display: 'Pantalla', type: 'pantalla' },
    }
  },
  {
    level: 9,
    wagons: [
      { letter: 'B', x: -3.5, color: '#ec4899' },
      { letter: 'M', x: 0, color: '#f43f5e' },
      { letter: 'S', x: 3.5, color: '#10b981' },
    ],
    objects: {
      B: { name: 'BICICLETA', display: 'Bicicleta', type: 'bicicleta' },
      M: { name: 'MARIPOSA', display: 'Mariposa', type: 'mariposa' },
      S: { name: 'SEMAFORO', display: 'Semáforo', type: 'semaforo' },
    }
  },
  {
    level: 10,
    wagons: [
      { letter: 'H', x: -3.5, color: '#f97316' },
      { letter: 'K', x: 0, color: '#8b5cf6' },
      { letter: 'Z', x: 3.5, color: '#78350f' },
    ],
    objects: {
      H: { name: 'HELICOPTERO', display: 'Helicóptero', type: 'helicoptero' },
      K: { name: 'KOALA', display: 'Koala', type: 'koala' },
      Z: { name: 'ZAPATO', display: 'Zapato', type: 'zapato' },
    }
  }
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
    case 'sapo':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 16, 12]} />
            <meshLambertMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0.1, 0.22, 0.12]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.1, 0.25, 0.14]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.1, 0.22, 0.12]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.1, 0.25, 0.14]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.2, -0.15, 0.05]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.15, 0.1, 0.15]} />
            <meshLambertMaterial color="#166534" />
          </mesh>
          <mesh position={[-0.2, -0.15, 0.05]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.15, 0.1, 0.15]} />
            <meshLambertMaterial color="#166534" />
          </mesh>
        </group>
      );
    case 'tren':
      return (
        <group>
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.55, 0.25, 0.3]} />
            <meshLambertMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[-0.15, 0.15, 0]} castShadow>
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.12, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.25, 8]} />
            <meshLambertMaterial color="#fbbf24" />
          </mesh>
        </group>
      );
    case 'bota':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.4, 12]} />
            <meshLambertMaterial color="#b45309" />
          </mesh>
          <mesh position={[0.15, -0.1, 0]} castShadow>
            <boxGeometry args={[0.45, 0.2, 0.26]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
        </group>
      );
    case 'gato':
      return (
        <group>
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.45, 0.25, 0.28]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
          <mesh position={[0.18, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
          <mesh position={[0.15, 0.28, 0.08]} rotation={[0.2, 0, -0.2]} castShadow>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshLambertMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0.15, 0.28, -0.08]} rotation={[-0.2, 0, -0.2]} castShadow>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshLambertMaterial color="#ea580c" />
          </mesh>
          <mesh position={[-0.26, 0.05, 0]} rotation={[0, 0, 0.6]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
        </group>
      );
    case 'flor':
      return (
        <group>
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
            <meshLambertMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshLambertMaterial color="#eab308" />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.22, 0.12 + Math.sin(angle) * 0.22, 0]}
                castShadow
              >
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshLambertMaterial color="#ec4899" />
              </mesh>
            );
          })}
        </group>
      );
    case 'vaca':
      return (
        <group>
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.55, 0.35, 0.35]} />
            <meshLambertMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0.1, 0.13, 0.12]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[-0.15, -0.05, -0.14]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.05, -0.16]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.26, 0.18, 0]} castShadow>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshLambertMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0.36, 0.12, 0]} castShadow>
            <boxGeometry args={[0.1, 0.12, 0.16]} />
            <meshLambertMaterial color="#fda4af" />
          </mesh>
        </group>
      );
    case 'dado':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <meshLambertMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, 0, 0.23]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {[-0.1, 0.1].map((x, idx) =>
            [-0.1, 0, 0.1].map((z, idz) => (
              <mesh key={`${idx}-${idz}`} position={[x, 0.23, z]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            ))
          )}
        </group>
      );
    case 'casa':
      return (
        <group>
          <mesh position={[0, -0.08, 0]} castShadow>
            <boxGeometry args={[0.5, 0.35, 0.5]} />
            <meshLambertMaterial color="#fed7aa" />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.42, 0.3, 4]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.12, -0.12, 0.251]}>
            <boxGeometry args={[0.14, 0.22, 0.02]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
        </group>
      );
    case 'nube':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.26, 16, 12]} />
            <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.2, -0.05, 0]} castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.2, -0.05, 0]} castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.15, -0.05]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshLambertMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>
      );
    case 'raton':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 16, 12]} scale={[1.2, 0.8, 0.8]} />
            <meshLambertMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0.36, 0.02, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#fda4af" />
          </mesh>
          <mesh position={[0.15, 0.2, 0.14]} rotation={[0, 0, -0.3]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} scale={[1, 1, 0.2]} />
            <meshLambertMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0.15, 0.2, -0.14]} rotation={[0, 0, -0.3]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} scale={[1, 1, 0.2]} />
            <meshLambertMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[-0.38, -0.05, 0]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.015, 0.015, 0.35, 6]} />
            <meshLambertMaterial color="#fda4af" />
          </mesh>
        </group>
      );
    case 'helado':
      return (
        <group>
          <mesh position={[0, -0.16, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.18, 0.42, 12]} />
            <meshLambertMaterial color="#d97706" />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshLambertMaterial color="#fda4af" />
          </mesh>
          <mesh position={[0, 0.26, 0]} castShadow>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshLambertMaterial color="#fbbf24" />
          </mesh>
        </group>
      );
    case 'estrella':
      return (
        <group>
          <mesh castShadow>
            <octahedronGeometry args={[0.34]} />
            <meshLambertMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={0.2} />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, Math.PI / 4]} castShadow>
            <octahedronGeometry args={[0.26]} />
            <meshLambertMaterial color="#facc15" />
          </mesh>
        </group>
      );
    case 'ventana':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.55, 0.08]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
          {[[-0.12, 0.12], [0.12, 0.12], [-0.12, -0.12], [0.12, -0.12]].map((p, idx) => (
            <mesh key={idx} position={[p[0], p[1], 0.01]}>
              <boxGeometry args={[0.2, 0.2, 0.082]} />
              <meshLambertMaterial color="#38bdf8" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      );
    case 'globo':
      return (
        <group>
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} scale={[1, 1.2, 1]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <coneGeometry args={[0.04, 0.06, 6]} />
            <meshLambertMaterial color="#b91c1c" />
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 6]} />
            <meshLambertMaterial color="#e2e8f0" />
          </mesh>
        </group>
      );
    case 'elefante':
      return (
        <group>
          <mesh position={[0, -0.06, 0]} castShadow>
            <boxGeometry args={[0.58, 0.42, 0.44]} />
            <meshLambertMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0.28, 0.14, 0]} castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshLambertMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0.2, 0.16, 0.24]} rotation={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.12, 0.22, 0.03]} />
            <meshLambertMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0.2, 0.16, -0.24]} rotation={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.12, 0.22, 0.03]} />
            <meshLambertMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0.4, 0.02, 0]} rotation={[0, 0, -0.5]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.26, 8]} />
            <meshLambertMaterial color="#94a3b8" />
          </mesh>
        </group>
      );
    case 'juguete':
      return (
        <group>
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 12]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, -0.08, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
            <meshLambertMaterial color="#fbbf24" />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
            <meshLambertMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshLambertMaterial color="#3b82f6" />
          </mesh>
        </group>
      );
    case 'coche':
      return (
        <group>
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.62, 0.16, 0.32]} />
            <meshLambertMaterial color="#dc2626" />
          </mesh>
          <mesh position={[-0.08, 0.08, 0]} castShadow>
            <boxGeometry args={[0.32, 0.16, 0.28]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          {[-0.2, 0.2].map((x) =>
            [-0.16, 0.16].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, -0.13, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, 0.05, 12]} />
                <meshLambertMaterial color="#1e293b" />
              </mesh>
            ))
          )}
        </group>
      );
    case 'dinosaurio':
      return (
        <group>
          <mesh position={[0, -0.06, 0]} castShadow>
            <boxGeometry args={[0.48, 0.28, 0.24]} />
            <meshLambertMaterial color="#10b981" />
          </mesh>
          <mesh position={[0.22, 0.12, 0]} rotation={[0, 0, 0.6]} castShadow>
            <boxGeometry args={[0.14, 0.3, 0.15]} />
            <meshLambertMaterial color="#10b981" />
          </mesh>
          <mesh position={[0.3, 0.26, 0]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.14]} />
            <meshLambertMaterial color="#059669" />
          </mesh>
          <mesh position={[-0.3, -0.04, 0]} rotation={[0, 0, -0.4]} castShadow>
            <boxGeometry args={[0.22, 0.08, 0.08]} />
            <meshLambertMaterial color="#10b981" />
          </mesh>
        </group>
      );
    case 'astronauta':
      return (
        <group>
          <mesh position={[0, -0.06, 0]} castShadow>
            <boxGeometry args={[0.26, 0.32, 0.22]} />
            <meshLambertMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshLambertMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, 0.18, 0.12]} scale={[1.1, 0.8, 1]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          <mesh position={[0, -0.05, -0.14]} castShadow>
            <boxGeometry args={[0.16, 0.22, 0.08]} />
            <meshLambertMaterial color="#cbd5e1" />
          </mesh>
        </group>
      );
    case 'computadora':
      return (
        <group>
          <mesh position={[0, 0.1, -0.1]} rotation={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 0.38, 0.04]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.1, -0.078]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.48, 0.32, 0.012]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, -0.1, 0.1]} castShadow>
            <boxGeometry args={[0.56, 0.04, 0.44]} />
            <meshLambertMaterial color="#64748b" />
          </mesh>
        </group>
      );
    case 'pantalla':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.68, 0.44, 0.03]} />
            <meshLambertMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.3, 0.02, 0.2]} />
            <meshLambertMaterial color="#334155" />
          </mesh>
        </group>
      );
    case 'bicicleta':
      return (
        <group>
          <mesh position={[-0.24, -0.12, 0]} castShadow>
            <torusGeometry args={[0.13, 0.018, 8, 20]} />
            <meshLambertMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.24, -0.12, 0]} castShadow>
            <torusGeometry args={[0.13, 0.018, 8, 20]} />
            <meshLambertMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0.4]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.45, 8]} />
            <meshLambertMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, -1.0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.45, 8]} />
            <meshLambertMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0.18, 0.14, 0]} castShadow>
            <boxGeometry args={[0.04, 0.25, 0.22]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
        </group>
      );
    case 'semaforo':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.18, 0.52, 0.18]} />
            <meshLambertMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.2, 0.091]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.05, 0.091]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
          <mesh position={[0, -0.1, 0.091]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
        </group>
      );
    case 'helicoptero':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.26, 12, 12]} scale={[1.4, 1, 1]} />
            <meshLambertMaterial color="#0284c7" />
          </mesh>
          <mesh position={[-0.38, 0.05, 0]} rotation={[0, 0, 0.25]} castShadow>
            <cylinderGeometry args={[0.04, 0.02, 0.34, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshLambertMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.36, 0]} castShadow>
            <boxGeometry args={[0.72, 0.015, 0.06]} />
            <meshLambertMaterial color="#334155" />
          </mesh>
          <mesh position={[0, -0.28, 0]} castShadow>
            <boxGeometry args={[0.42, 0.02, 0.28]} />
            <meshLambertMaterial color="#334155" />
          </mesh>
        </group>
      );
    case 'koala':
      return (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.26, 12, 12]} />
            <meshLambertMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0.18, 0.18, 0.18]} castShadow>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshLambertMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[-0.18, 0.18, 0.18]} castShadow>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshLambertMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, 0.04, 0.24]} scale={[1, 1.4, 1]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.08, 0.08, 0.22]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.08, 0.08, 0.22]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      );
    case 'zapato':
      return (
        <group>
          <mesh position={[-0.14, -0.04, 0]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.26]} />
            <meshLambertMaterial color="#78350f" />
          </mesh>
          <mesh position={[0.12, -0.1, 0]} castShadow>
            <boxGeometry args={[0.34, 0.12, 0.26]} />
            <meshLambertMaterial color="#b45309" />
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
  const { wagonsFilled, trainOffset, wagons } = filterProps(props);
  const activeWagons = wagons || [
    { letter: 'M', x: -3.5, color: '#f43f5e' },
    { letter: 'P', x: 0, color: '#3b82f6' },
    { letter: 'L', x: 3.5, color: '#fbbf24' },
  ];
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
      {activeWagons.map((wagon) => (
        <group key={wagon.letter} position={[wagon.x, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.8, 0.9]} />
            <meshLambertMaterial color={wagon.color} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.4, 0.5, 0.7]} />
            <meshLambertMaterial color="#ffffff" opacity={0.2} transparent />
          </mesh>
          {/* Letters on all 4 sides */}
          <Text position={[0, 0.05, 0.46]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {wagon.letter}
          </Text>
          <Text position={[0, 0.05, -0.46]} rotation={[0, Math.PI, 0]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {wagon.letter}
          </Text>
          <Text position={[0.81, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            {wagon.letter}
          </Text>
          <Text position={[-0.81, 0.05, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.55} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
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

const GrassFloor = () => {
  const tiles = useMemo(() => {
    const list = [];
    const rows = 12;
    const cols = 16;
    const tileW = 40 / cols;
    const tileD = 30 / rows;
    
    let seed = 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const greens = [
      '#2e7d32', // Forest green
      '#388e3c', // Medium green
      '#43a047', // Grass green
      '#4caf50', // Light green
      '#1b5e20', // Dark forest green
      '#558b2f', // Olive green
      '#689f38', // Light olive
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -20 + (c + 0.5) * tileW;
        const z = -15 + (r + 0.5) * tileD;
        const color = greens[Math.floor(random() * greens.length)];
        const height = 0.05 + random() * 0.08;
        list.push({ x, z, w: tileW, d: tileD, color, height });
      }
    }
    return list;
  }, []);

  const tufts = useMemo(() => {
    const list = [];
    let seed = 99;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 40; i++) {
      const x = -18 + random() * 36;
      let z = -13 + random() * 26;
      if (z > 3 && z < 7) {
        z = z < 5 ? 2 : 8;
      }
      
      const scale = 0.4 + random() * 0.5;
      const rotationY = random() * Math.PI;
      const shade = random() > 0.5 ? '#4caf50' : '#2e7d32';
      
      list.push({ x, z, scale, rotationY, shade });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Base floor plate */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[42, 0.1, 32]} />
        <meshLambertMaterial color="#1b5e20" />
      </mesh>
      
      {/* Mosaic tiles */}
      {tiles.map((t, i) => (
        <mesh key={i} position={[t.x, -0.15 + t.height/2, t.z]} receiveShadow>
          <boxGeometry args={[t.w, t.height, t.d]} />
          <meshLambertMaterial color={t.color} />
        </mesh>
      ))}

      {/* Scattered grass tufts */}
      {tufts.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} rotation={[0, t.rotationY, 0]} scale={[t.scale, t.scale, t.scale]}>
          <mesh position={[-0.05, 0.15, 0]} rotation={[0.1, 0, 0.1]} castShadow>
            <coneGeometry args={[0.06, 0.35, 4]} />
            <meshLambertMaterial color={t.shade} />
          </mesh>
          <mesh position={[0.05, 0.15, 0.05]} rotation={[-0.15, 0, -0.08]} castShadow>
            <coneGeometry args={[0.05, 0.3, 4]} />
            <meshLambertMaterial color={t.shade} />
          </mesh>
          <mesh position={[0, 0.2, -0.05]} rotation={[0, 0, -0.12]} castShadow>
            <coneGeometry args={[0.04, 0.4, 4]} />
            <meshLambertMaterial color={t.shade} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Scenery = () => {
  return (
    <group>
      {/* Grass floor */}
      <GrassFloor />
      {/* Mountains */}
      {[[-10, -10], [-5, -12], [5, -11], [10, -10]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.1, p[1]]} castShadow>
          <coneGeometry args={[2.5, 3, 8]} />
          <meshLambertMaterial color="#1b5e20" />
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
  const { currentObject, isDragging, dragPos, springBackTo } = filterProps(props);
  const groupRef = useRef();
  const positionRef = useRef({ x: 0, y: CLOUD_Y, z: CLOUD_Z });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (isDragging && dragPos.current) {
      positionRef.current.x = dragPos.current.x;
      positionRef.current.y = dragPos.current.y;
      positionRef.current.z = dragPos.current.z;
    } else if (springBackTo.current) {
      const target = springBackTo.current;
      const lerp = 0.12;
      positionRef.current.x += (target.x - positionRef.current.x) * lerp;
      positionRef.current.y += (target.y - positionRef.current.y) * lerp;
      positionRef.current.z += (target.z - positionRef.current.z) * lerp;
      const dx = Math.abs(target.x - positionRef.current.x);
      if (dx < 0.05) {
        springBackTo.current = null;
      }
    } else {
      positionRef.current.x = 0;
      positionRef.current.y = CLOUD_Y + OBJECT_IDLE_Y_OFFSET + Math.sin(state.clock.elapsedTime * 3) * 0.12;
      positionRef.current.z = CLOUD_Z;
    }
    
    groupRef.current.position.set(positionRef.current.x, positionRef.current.y, positionRef.current.z);
    groupRef.current.rotation.y += delta * 0.5;
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    props.setIsDragging(true);
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

  const [currentLevel, setCurrentLevel] = useState(1);
  const [wagonsFilled, setWagonsFilled] = useState({ M: false, P: false, L: false });
  const [currentObject, setCurrentObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing'); // playing, won_level, won, lost
  const [trainOffset, setTrainOffset] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [lives, setLives] = useState(3);
  const dragPos = useRef({ x: 0, y: 2.5, z: -2 });
  const springBackTo = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const currentLevelWagons = useMemo(() => {
    const config = LEVELS_CONFIG[currentLevel - 1] || LEVELS_CONFIG[0];
    return config.wagons;
  }, [currentLevel]);

  const pickNewObjectForLevel = (filled, lvl) => {
    const config = LEVELS_CONFIG[lvl - 1] || LEVELS_CONFIG[0];
    const available = Object.keys(filled).filter(k => !filled[k]);
    if (available.length === 0) return null;
    const letter = available[Math.floor(Math.random() * available.length)];
    return config.objects[letter];
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

  const finishGame = async (correct, incorrect, total, finalScore, finalLevel) => {
    const elapsed = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
    const saveLevel = finalLevel || currentLevel;
    if (sessionId) {
      try {
        await api.put(`/games/session/${sessionId}/complete`, {
          total_time_seconds: elapsed,
          final_score: finalScore,
          correct_attempts: correct,
          incorrect_attempts: incorrect,
          total_attempts: total,
          level: saveLevel
        });
      } catch (e) {
        console.error('Error al guardar progreso:', e);
      }
    }
    onFinish({ score: finalScore, level: saveLevel, sessionId });
  };

  useEffect(() => {
    const initialFilled = { M: false, P: false, L: false };
    setWagonsFilled(initialFilled);
    const obj = pickNewObjectForLevel(initialFilled, 1);
    setCurrentObject(obj);
    if (obj) {
      setTimeout(() => speakSpanish(obj.name, true), 500);
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'won_level') return;
    let raf;
    const start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000;
      setTrainOffset(elapsed * 6);
      if (elapsed < 3) {
        raf = requestAnimationFrame(animate);
      } else {
        const nextLvl = currentLevel + 1;
        setCurrentLevel(nextLvl);
        
        setTrainOffset(-15);
        const config = LEVELS_CONFIG[nextLvl - 1] || LEVELS_CONFIG[0];
        const newFilled = {};
        config.wagons.forEach(w => { newFilled[w.letter] = false; });
        setWagonsFilled(newFilled);
        setScore(0);
        setLives(3);
        setGameState('playing');
        
        const nextObj = pickNewObjectForLevel(newFilled, nextLvl);
        setCurrentObject(nextObj);
        if (nextObj) {
          setTimeout(() => speakSpanish(nextObj.name, true), 1000);
        }
        
        animateTrainReturn();
      }
    };
    speakSpanish(`¡Excelente! ¡Nivel ${currentLevel} completado!`);
    animate();
    return () => cancelAnimationFrame(raf);
  }, [gameState, currentLevel]);

  const animateTrainReturn = () => {
    let raf;
    const start = Date.now();
    const duration = 2.5;
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const currentOffset = -15 + progress * 15;
      setTrainOffset(currentOffset);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  useEffect(() => {
    if (gameState !== 'won') return;
    let raf;
    const start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000;
      setTrainOffset(elapsed * 5);
      if (elapsed < 5) {
        raf = requestAnimationFrame(animate);
      }
    };
    speakSpanish('¡Felicidades! ¡Completaste todos los niveles del Tren de las Letras!');
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
        for (const w of currentLevelWagons) {
          if (Math.abs(pos.x - w.x) < 1.2) {
            droppedWagon = w.letter;
            break;
          }
        }
      }

      if (droppedWagon) {
        if (currentObject && droppedWagon === currentObject.name[0]) {
          setCorrectCount(c => c + 1);
          playCorrectSound();
          const newFilled = { ...wagonsFilled, [droppedWagon]: true };
          setWagonsFilled(newFilled);
          setScore(prev => prev + 1);
          setFeedback(`¡Excelente! Metiste la palabra en el vagón ${droppedWagon}`);
          speakSpanish(`¡Excelente! Metiste el ${currentObject.display} en el vagón ${droppedWagon}`);
          setTimeout(() => setFeedback(''), 2500);

          if (Object.values(newFilled).every(v => v)) {
            if (currentLevel < 10) {
              setGameState('won_level');
            } else {
              setGameState('won');
              finishGame(correctCount + 1, incorrectCount, correctCount + 1 + incorrectCount, (correctCount + 1) * 300, 10);
            }
          } else {
            setTimeout(() => {
              const next = pickNewObjectForLevel(newFilled, currentLevel);
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
          setLives(prevLives => {
            const nextLives = prevLives - 1;
            if (nextLives <= 0) {
              setGameState('lost');
              setFeedback('¡Te quedaste sin vidas!');
              speakSpanish('Te quedaste sin vidas. Inténtalo de nuevo.');
              setTimeout(() => {
                finishGame(correctCount, incorrectCount + 1, correctCount + incorrectCount + 1, correctCount * 100, currentLevel);
              }, 2000);
            } else {
              setFeedback(`¡Casi! ${currentObject?.display} empieza con la letra ${correctLetter}`);
              speakSpanish(`¡Casi! ${currentObject?.display} empieza con la letra ${correctLetter}`);
              setTimeout(() => setFeedback(''), 2500);
            }
            return nextLives;
          });
        }
      } else {
        springBackTo.current = { x: 0, y: CLOUD_Y + OBJECT_IDLE_Y_OFFSET, z: CLOUD_Z };
        setFeedback('Suelta el objeto sobre uno de los vagones');
        setTimeout(() => setFeedback(''), 2000);
      }
    };
    
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, currentObject, wagonsFilled, correctCount, incorrectCount, currentLevel, currentLevelWagons]);

  const restart = () => {
    setCurrentLevel(1);
    setLives(3);
    const initialFilled = { M: false, P: false, L: false };
    setWagonsFilled(initialFilled);
    setScore(0);
    setGameState('playing');
    setTrainOffset(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    const obj = pickNewObjectForLevel(initialFilled, 1);
    setCurrentObject(obj);
    if (obj) setTimeout(() => speakSpanish(obj.name, true), 300);
  };

  const replayAudio = () => {
    if (currentObject) speakSpanish(currentObject.name, true);
  };

  const fallingLetters = (gameState === 'won' || gameState === 'won_level') ? [
    { letter: currentLevelWagons[0]?.letter || 'M', x: -3, color: '#f43f5e', delay: 0 },
    { letter: currentLevelWagons[1]?.letter || 'P', x: 0, color: '#3b82f6', delay: 300 },
    { letter: currentLevelWagons[2]?.letter || 'L', x: 3, color: '#fbbf24', delay: 600 },
  ] : [];

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 6, 13], fov: 50 }}>
        <Suspense fallback={null}>
          <OrbitControls 
            enabled={!isDragging} 
            target={[0, 2, 1]} 
            maxPolarAngle={Math.PI / 2 - 0.05} 
            minDistance={4} 
            maxDistance={25} 
          />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <Scenery />
          <Train wagonsFilled={wagonsFilled} trainOffset={trainOffset} wagons={currentLevelWagons} />
          {(gameState === 'playing' || gameState === 'won_level') && currentObject && (
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
          <div className="text-sm font-bold text-indigo-300">Nivel {currentLevel} / 10</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400 font-bold text-xs">Vidas:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="text-xs">
                  {i < lives ? '❤️' : '🖤'}
                </span>
              ))}
            </div>
          </div>
          <div className="text-base font-extrabold text-purple-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-400" /> Vagones llenos: {score} / 3
          </div>
          <div className="flex gap-1.5 mt-1">
            {currentLevelWagons.map(w => (
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
          <div className="text-slate-400 text-[10px] mt-1">Arrastra en zona vacía para mover la cámara en 3D</div>
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
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100, currentLevel)}
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
                  <li>Suéltalo en el vagón de tren que tenga la letra inicial correcta.</li>
                  <li>Usa el mouse (clic y arrastrar en la zona vacía) para mover la cámara y ver el escenario desde cualquier ángulo.</li>
                  <li>Completa el nivel para avanzar al siguiente. ¡Son 10 niveles en total con palabras cada vez más difíciles!</li>
                </ul>
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
