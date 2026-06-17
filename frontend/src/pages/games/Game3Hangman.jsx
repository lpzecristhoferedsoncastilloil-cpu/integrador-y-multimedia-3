import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { HelpCircle, RefreshCw, LogOut, Trophy } from 'lucide-react';
import api from '../../services/api';

// SVG drawings representing hints for the target words
const DrawingSVG = ({ type }) => {
  const normType = type.toLowerCase()
    .replace('é', 'e')
    .replace('í', 'i')
    .replace('ó', 'o')
    .replace('á', 'a')
    .replace('ú', 'u');

  switch (normType) {
    case 'sol':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="22" fill="#f59e0b" />
          <circle cx="50" cy="50" r="16" fill="#eab308" />
          <path d="M 50 10 L 50 22 M 50 78 L 50 90 M 10 50 L 22 50 M 78 50 L 90 50 M 22 22 L 31 31 M 69 69 L 78 78 M 22 69 L 31 60 M 69 22 L 60 31" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'casa':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <polygon points="50,15 15,45 85,45" fill="#ef4444" />
          <rect x="25" y="45" width="50" height="40" fill="#fcd34d" />
          <rect x="42" y="58" width="16" height="27" fill="#b45309" />
          <rect x="30" y="50" width="12" height="12" fill="#38bdf8" />
          <rect x="58" y="50" width="12" height="12" fill="#38bdf8" />
        </svg>
      );
    case 'gato':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="55" r="35" fill="#94a3b8" />
          <polygon points="20,35 30,10 45,30" fill="#94a3b8" />
          <polygon points="80,35 70,10 55,30" fill="#94a3b8" />
          <polygon points="23,32 30,15 40,28" fill="#fda4af" />
          <polygon points="77,32 70,15 60,28" fill="#fda4af" />
          <ellipse cx="40" cy="50" rx="4" ry="6" fill="#22c55e" />
          <ellipse cx="60" cy="50" rx="4" ry="6" fill="#22c55e" />
          <circle cx="40" cy="50" r="2" fill="#000" />
          <circle cx="60" cy="50" r="2" fill="#000" />
          <polygon points="47,60 53,60 50,64" fill="#fda4af" />
          <line x1="25" y1="58" x2="10" y2="56" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="25" y1="62" x2="8" y2="64" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="75" y1="58" x2="90" y2="56" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="75" y1="62" x2="92" y2="64" stroke="#e2e8f0" strokeWidth="2" />
        </svg>
      );
    case 'pato':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="45" r="28" fill="#facc15" />
          <ellipse cx="42" cy="40" rx="3" ry="5" fill="#000" />
          <ellipse cx="58" cy="40" rx="3" ry="5" fill="#000" />
          <ellipse cx="50" cy="54" rx="14" ry="7" fill="#f97316" />
          <line x1="38" y1="54" x2="62" y2="54" stroke="#c2410c" strokeWidth="1.5" />
        </svg>
      );
    case 'luna':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <path d="M 65 20 A 35 35 0 1 0 65 90 A 28 28 0 1 1 65 20" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
          <circle cx="42" cy="45" r="2.5" fill="#ca8a04" />
          <path d="M 38 56 Q 44 60 40 52" stroke="#ca8a04" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'mesa':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <rect x="15" y="40" width="70" height="12" rx="4" fill="#854d0e" />
          <rect x="20" y="48" width="60" height="4" fill="#a16207" />
          <rect x="22" y="52" width="6" height="30" fill="#713f12" />
          <rect x="72" y="52" width="6" height="30" fill="#713f12" />
          <rect x="32" y="52" width="5" height="25" fill="#451a03" opacity="0.7" />
          <rect x="63" y="52" width="5" height="25" fill="#451a03" opacity="0.7" />
        </svg>
      );
    case 'lapiz':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <rect x="20" y="40" width="10" height="20" rx="2" fill="#f472b6" transform="rotate(-30 25 50)" />
          <rect x="28" y="40" width="6" height="20" fill="#94a3b8" transform="rotate(-30 31 50)" />
          <rect x="34" y="40" width="36" height="20" fill="#eab308" transform="rotate(-30 52 50)" />
          <rect x="34" y="45" width="36" height="10" fill="#ca8a04" transform="rotate(-30 52 50)" />
          <polygon points="65,30 80,45 68,52" fill="#fed7aa" transform="rotate(-30 71 42)" />
          <polygon points="73,38 80,45 75,48" fill="#1e293b" transform="rotate(-30 76 43)" />
        </svg>
      );
    case 'nube':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <path d="M 25 60 A 15 15 0 0 1 35 35 A 20 20 0 0 1 70 35 A 15 15 0 0 1 80 60 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="3" />
          <path d="M 30 60 A 10 10 0 0 1 38 42 A 15 15 0 0 1 65 42 A 10 10 0 0 1 75 60 Z" fill="#ffffff" />
        </svg>
      );
    case 'escuela':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <rect x="20" y="40" width="60" height="45" rx="4" fill="#dc2626" />
          <polygon points="50,15 15,40 85,40" fill="#991b1b" />
          <rect x="42" y="60" width="16" height="25" fill="#f59e0b" />
          <circle cx="46" cy="72" r="2" fill="#78350f" />
          <rect x="28" y="48" width="12" height="12" rx="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="60" y="48" width="12" height="12" rx="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="50" y1="15" x2="50" y2="5" stroke="#94a3b8" strokeWidth="2" />
          <polygon points="50,5 65,9 50,13" fill="#facc15" />
        </svg>
      );
    case 'jirafa':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#fef08a" />
          <rect x="40" y="45" width="20" height="45" fill="#f59e0b" rx="2" />
          <circle cx="45" cy="55" r="4" fill="#b45309" />
          <circle cx="55" cy="65" r="5" fill="#b45309" />
          <circle cx="46" cy="78" r="4" fill="#b45309" />
          <rect x="35" y="25" width="30" height="25" fill="#f59e0b" rx="6" />
          <ellipse cx="50" cy="44" rx="14" ry="7" fill="#fef08a" />
          <circle cx="45" cy="44" r="1.5" fill="#b45309" />
          <circle cx="55" cy="44" r="1.5" fill="#b45309" />
          <circle cx="43" cy="32" r="3.5" fill="#000" />
          <circle cx="57" cy="32" r="3.5" fill="#000" />
          <circle cx="44" cy="31" r="1" fill="#fff" />
          <circle cx="58" cy="31" r="1" fill="#fff" />
          <ellipse cx="32" cy="24" rx="3" ry="8" fill="#f59e0b" transform="rotate(-30 32 24)" />
          <ellipse cx="68" cy="24" rx="3" ry="8" fill="#f59e0b" transform="rotate(30 68 24)" />
          <line x1="45" y1="25" x2="42" y2="15" stroke="#b45309" strokeWidth="2.5" />
          <circle cx="42" cy="14" r="3" fill="#b45309" />
          <line x1="55" y1="25" x2="58" y2="15" stroke="#b45309" strokeWidth="2.5" />
          <circle cx="58" cy="14" r="3" fill="#b45309" />
        </svg>
      );
    case 'pelota':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#3b82f6" />
          <path d="M 50 10 A 40 40 0 0 0 10 50 A 40 40 0 0 0 50 90 A 28 40 0 0 1 50 10" fill="#ef4444" />
          <path d="M 50 10 A 40 40 0 0 1 90 50 A 40 40 0 0 1 50 90 A 28 40 0 0 0 50 10" fill="#facc15" />
          <circle cx="50" cy="50" r="8" fill="#ffffff" />
        </svg>
      );
    case 'platano':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#ecfdf5" />
          <path d="M 25 30 C 50 30 75 45 75 70 C 55 65 35 50 25 30 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
          <path d="M 25 30 Q 23 28 20 28 Q 23 32 25 30" fill="#713f12" />
          <path d="M 75 70 Q 78 74 80 75 Q 76 72 75 70" fill="#451a03" stroke="#451a03" strokeWidth="2" />
        </svg>
      );
    case 'dragon':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#10b981" />
          <polygon points="35,25 30,10 42,20" fill="#facc15" />
          <polygon points="65,25 70,10 58,20" fill="#facc15" />
          <ellipse cx="32" cy="58" rx="8" ry="6" fill="#059669" />
          <ellipse cx="68" cy="58" rx="8" ry="6" fill="#059669" />
          <ellipse cx="50" cy="62" rx="16" ry="12" fill="#6ee7b7" />
          <circle cx="45" cy="58" r="2.5" fill="#047857" />
          <circle cx="55" cy="58" r="2.5" fill="#047857" />
          <circle cx="38" cy="40" r="5" fill="#fff" />
          <circle cx="62" cy="40" r="5" fill="#fff" />
          <circle cx="38" cy="40" r="2.5" fill="#000" />
          <circle cx="62" cy="40" r="2.5" fill="#000" />
          <path d="M 45 68 Q 50 90 55 68 Z" fill="#ef4444" />
          <path d="M 47 68 Q 50 82 53 68 Z" fill="#f97316" />
        </svg>
      );
    case 'estrella':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <polygon points="50,10 63,38 93,38 69,56 78,86 50,68 22,86 31,56 7,38 37,38" fill="#facc15" stroke="#eab308" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="42" cy="45" r="2" fill="#451a03" />
          <circle cx="58" cy="45" r="2" fill="#451a03" />
          <path d="M 46 54 Q 50 58 54 54" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'ventana':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <rect x="20" y="20" width="60" height="60" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          <rect x="26" y="26" width="21" height="21" fill="#38bdf8" />
          <rect x="53" y="26" width="21" height="21" fill="#38bdf8" />
          <rect x="26" y="53" width="21" height="21" fill="#38bdf8" />
          <rect x="53" y="53" width="21" height="21" fill="#38bdf8" />
          <path d="M 30 26 L 42 26 L 26 42 L 26 30 Z" fill="#ffffff" opacity="0.4" />
          <path d="M 57 26 L 69 26 L 53 42 L 53 30 Z" fill="#ffffff" opacity="0.4" />
        </svg>
      );
    case 'zapato':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <path d="M 20 70 Q 50 78 85 70 L 85 64 Q 50 72 20 64 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M 22 64 C 20 50 35 40 50 40 L 75 50 C 82 52 85 60 85 64 Z" fill="#ef4444" />
          <ellipse cx="52" cy="40" rx="10" ry="4" fill="#ffffff" />
          <path d="M 22 64 C 21 58 26 52 32 52 C 34 58 32 64 22 64 Z" fill="#ffffff" />
          <line x1="48" y1="45" x2="58" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="49" x2="54" y2="56" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'bicicleta':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#f0fdfa" />
          <circle cx="32" cy="65" r="14" stroke="#475569" strokeWidth="4" fill="none" />
          <circle cx="32" cy="65" r="11" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
          <circle cx="68" cy="65" r="14" stroke="#475569" strokeWidth="4" fill="none" />
          <circle cx="68" cy="65" r="11" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
          <circle cx="32" cy="65" r="2.5" fill="#1e293b" />
          <circle cx="68" cy="65" r="2.5" fill="#1e293b" />
          <path d="M 32 65 L 48 45 L 68 65 L 56 45 L 32 65 M 48 45 L 48 35 M 56 45 L 58 32" stroke="#0d9488" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="44" y1="35" x2="52" y2="35" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 52 32 L 62 32 L 66 38" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'elefante':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <ellipse cx="25" cy="48" rx="20" ry="24" fill="#94a3b8" />
          <ellipse cx="27" cy="48" rx="14" ry="18" fill="#fda4af" opacity="0.6" />
          <ellipse cx="75" cy="48" rx="20" ry="24" fill="#94a3b8" />
          <ellipse cx="73" cy="48" rx="14" ry="18" fill="#fda4af" opacity="0.6" />
          <circle cx="50" cy="52" r="26" fill="#cbd5e1" />
          <circle cx="42" cy="46" r="3.5" fill="#000" />
          <circle cx="58" cy="46" r="3.5" fill="#000" />
          <circle cx="43" cy="45" r="1" fill="#fff" />
          <circle cx="59" cy="45" r="1" fill="#fff" />
          <path d="M 46 56 Q 50 82 58 80 Q 62 78 60 74 Q 54 75 52 62" stroke="#cbd5e1" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 38 60 Q 34 68 32 64 Q 35 58 38 60 Z" fill="#ffffff" />
          <path d="M 62 60 Q 66 68 68 64 Q 65 58 62 60 Z" fill="#ffffff" />
        </svg>
      );
    case 'mariposa':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <path d="M 50 50 Q 20 20 22 42 Q 22 62 50 54" fill="#ec4899" />
          <path d="M 50 50 Q 25 75 30 58 Q 30 45 50 50" fill="#a855f7" />
          <path d="M 50 50 Q 80 20 78 42 Q 78 62 50 54" fill="#ec4899" />
          <path d="M 50 50 Q 75 75 70 58 Q 70 45 50 50" fill="#a855f7" />
          <circle cx="32" cy="38" r="4" fill="#fdf2f8" />
          <circle cx="68" cy="38" r="4" fill="#fdf2f8" />
          <ellipse cx="50" cy="50" rx="3.5" ry="22" fill="#1e293b" />
          <circle cx="50" cy="25" r="4.5" fill="#1e293b" />
          <path d="M 48 22 Q 42 12 36 14" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 22 Q 58 12 64 14" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'castillo':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <rect x="10" y="78" width="80" height="10" rx="2" fill="#475569" />
          <rect x="30" y="45" width="40" height="35" fill="#94a3b8" />
          <rect x="35" y="40" width="30" height="6" fill="#64748b" />
          <rect x="32" y="34" width="6" height="6" fill="#475569" />
          <rect x="47" y="34" width="6" height="6" fill="#475569" />
          <rect x="62" y="34" width="6" height="6" fill="#475569" />
          <rect x="20" y="35" width="12" height="45" fill="#cbd5e1" />
          <polygon points="26,18 18,35 34,35" fill="#ef4444" />
          <rect x="68" y="35" width="12" height="45" fill="#cbd5e1" />
          <polygon points="74,18 66,35 82,35" fill="#ef4444" />
          <path d="M 42 80 L 42 64 A 8 8 0 0 1 58 64 L 58 80 Z" fill="#451a03" />
          <rect x="24" y="45" width="4" height="8" fill="#1e293b" />
          <rect x="72" y="45" width="4" height="8" fill="#1e293b" />
        </svg>
      );
    case 'durazno':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#fef2f2" />
          <path d="M 50 30 C 25 30 25 75 50 82 C 75 75 75 30 50 30 Z" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M 50 30 C 32 30 32 75 50 82 Z" fill="#ef4444" opacity="0.8" />
          <path d="M 50 30 Q 52 20 55 16" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 52 22 Q 68 18 64 30 Q 52 26 52 22 Z" fill="#22c55e" />
        </svg>
      );
    case 'astronauta':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#0f172a" />
          <rect x="35" y="70" width="30" height="20" rx="4" fill="#e2e8f0" />
          <rect x="42" y="74" width="16" height="4" fill="#3b82f6" />
          <circle cx="50" cy="46" r="28" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M 32 46 C 32 32 68 32 68 46 C 68 56 32 56 32 46 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
          <path d="M 36 44 Q 50 35 64 44" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <circle cx="40" cy="48" r="1.5" fill="#ffffff" />
        </svg>
      );
    case 'biblioteca':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <rect x="15" y="15" width="70" height="70" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="3.5" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="#78350f" strokeWidth="4" />
          <rect x="22" y="24" width="8" height="24" fill="#ef4444" rx="1" />
          <rect x="31" y="20" width="7" height="28" fill="#3b82f6" rx="1" />
          <rect x="39" y="26" width="9" height="22" fill="#facc15" rx="1" />
          <rect x="52" y="22" width="8" height="26" fill="#10b981" rx="1" transform="rotate(15 52 48)" />
          <rect x="20" y="58" width="9" height="24" fill="#a855f7" rx="1" />
          <rect x="30" y="54" width="7" height="28" fill="#f97316" rx="1" />
          <rect x="60" y="56" width="9" height="26" fill="#ec4899" rx="1" />
          <rect x="70" y="58" width="8" height="24" fill="#06b6d4" rx="1" />
        </svg>
      );
    case 'dinosaurio':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="40" fill="#ecfdf5" />
          <polygon points="25,40 15,45 23,52" fill="#f59e0b" />
          <polygon points="30,26 22,28 26,38" fill="#f59e0b" />
          <path d="M 28 80 C 28 50 35 25 55 25 C 70 25 75 40 75 48 C 75 54 65 58 55 58 C 50 58 46 68 46 80 Z" fill="#10b981" />
          <circle cx="62" cy="45" r="4" fill="#059669" opacity="0.5" />
          <circle cx="58" cy="36" r="3.5" fill="#fff" />
          <circle cx="58" cy="36" r="2" fill="#000" />
          <path d="M 68 48 Q 60 52 56 46" stroke="#047857" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

const WORDS_EASY = [
  { word: 'SOL', hint: 'Brilla de día en el cielo' },
  { word: 'CASA', hint: 'Lugar donde vivimos con la familia' },
  { word: 'GATO', hint: 'Mascota que maúlla y caza ratones' },
  { word: 'PATO', hint: 'Ave de granja que hace cua cua' },
  { word: 'LUNA', hint: 'Brilla de noche en el cielo' },
  { word: 'MESA', hint: 'Mueble para comer o escribir' },
  { word: 'LAPIZ', hint: 'Lo usas para escribir o dibujar' },
  { word: 'NUBE', hint: 'Es blanca o gris y flota en el cielo' },
];

const WORDS_MEDIUM = [
  { word: 'ESCUELA', hint: 'Lugar donde aprendemos y jugamos' },
  { word: 'JIRAFA', hint: 'Animal de cuello muy largo y manchas' },
  { word: 'PELOTA', hint: 'Objeto redondo para patear o lanzar' },
  { word: 'PLATANO', hint: 'Fruta amarilla que le gusta a los monos' },
  { word: 'DRAGON', hint: 'Criatura mítica que vuela y escupe fuego' },
  { word: 'ESTRELLA', hint: 'Cuerpo celeste que brilla de noche' },
  { word: 'VENTANA', hint: 'Abertura en la pared para ver afuera' },
  { word: 'ZAPATO', hint: 'Prenda para proteger el pie al caminar' },
];

const WORDS_HARD = [
  { word: 'BICICLETA', hint: 'Vehículo de dos ruedas con pedales' },
  { word: 'ELEFANTE', hint: 'Animal terrestre muy grande con trompa' },
  { word: 'MARIPOSA', hint: 'Insecto volador con alas coloridas' },
  { word: 'CASTILLO', hint: 'Fortaleza antigua donde vivían reyes' },
  { word: 'DURAZNO', hint: 'Fruta dulce con piel aterciopelada' },
  { word: 'ASTRONAUTA', hint: 'Persona que viaja al espacio exterior' },
  { word: 'BIBLIOTECA', hint: 'Lugar donde hay muchos libros' },
  { word: 'DINOSAURIO', hint: 'Reptil gigante extinto hace millones de años' },
];

const getWordForLevel = (level) => {
  let pool = WORDS_EASY;
  if (level === 3 || level === 4) {
    pool = WORDS_MEDIUM;
  } else if (level === 5 || level === 6) {
    pool = WORDS_HARD;
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').filter((v, i, a) => a.indexOf(v) === i);
const MAX_FAILS = 6;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const LetterBlock = (props) => {
  const { letter, position, isUsed, isCorrect, onClick } = filterProps(props);
  const meshRef = useRef();
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && !isUsed) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.15;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isUsed && onClick) {
      onClick(letter);
      setIsHovered(false);
      document.body.style.cursor = 'default';
    }
  };

  // Space theme colors: Unused purple, Correct emerald, Incorrect rose
  const standardColor = isUsed ? (isCorrect ? '#10b981' : '#f43f5e') : '#8b5cf6';
  const color = (isHovered && !isUsed) ? '#a78bfa' : standardColor;
  const emissive = (isHovered && !isUsed) ? '#22d3ee' : '#000000';
  const emissiveIntensity = (isHovered && !isUsed) ? 1.5 : 0;
  const scale = (isHovered && !isUsed) ? [1.1, 1.1, 1.1] : [1, 1, 1];

  return (
    <group 
      ref={groupRef} 
      position={position} 
      onClick={handleClick}
      scale={scale}
      onPointerOver={(e) => {
        if (!isUsed) {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.12, 1.12, 0.48]} />
        <meshLambertMaterial 
          color={color} 
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          opacity={isUsed ? 0.5 : 1} 
          transparent 
        />
      </mesh>
      <Text position={[0, 0, 0.25]} fontSize={0.64} color={isHovered && !isUsed ? "#0c0c2e" : "#ffffff"} anchorX="center" anchorY="middle" fontWeight="bold">
        {letter}
      </Text>
    </group>
  );
};

const HangmanStructure = (props) => {
  const { fails } = filterProps(props);
  const structureColor = '#6366f1'; // Indigo structure
  const ropeColor = '#a78bfa';

  return (
    <group position={[-5, 0, 0]} scale={[1.3, 1.3, 1.3]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 1]} />
        <meshLambertMaterial color={structureColor} />
      </mesh>
      {/* Vertical pole */}
      {fails >= 1 && (
        <mesh position={[-1, 2.2, 0]}>
          <boxGeometry args={[0.25, 4, 0.25]} />
          <meshLambertMaterial color={structureColor} />
        </mesh>
      )}
      {/* Horizontal beam */}
      {fails >= 2 && (
        <mesh position={[0, 4.1, 0]}>
          <boxGeometry args={[2.2, 0.25, 0.25]} />
          <meshLambertMaterial color={structureColor} />
        </mesh>
      )}
      {/* Rope */}
      {fails >= 3 && (
        <mesh position={[1, 3.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshLambertMaterial color={ropeColor} />
        </mesh>
      )}
      {/* Head */}
      {fails >= 4 && (
        <mesh position={[1, 3.1, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshLambertMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={0.2} />
        </mesh>
      )}
      {/* Body */}
      {fails >= 5 && (
        <mesh position={[1, 2.2, 0]}>
          <boxGeometry args={[0.4, 1.2, 0.3]} />
          <meshLambertMaterial color="#38bdf8" />
        </mesh>
      )}
      {/* Arms + Legs */}
      {fails >= 6 && (
        <>
          <mesh position={[0.6, 2.3, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshLambertMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[1.4, 2.3, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshLambertMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0.8, 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
          <mesh position={[1.2, 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
        </>
      )}
    </group>
  );
};

// Asteroid component
const Asteroid = ({ position, size = 0.5, speed = 0.5 }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += speed * 0.01;
      ref.current.rotation.y += speed * 0.015;
      // Floating animation
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <dodecahedronGeometry args={[size, 1]} />
      <meshLambertMaterial color="#55556a" roughness={0.9} />
    </mesh>
  );
};

// Saturn Planet component
const SaturnPlanet = ({ position, size = 1.2 }) => {
  const groupRef = useRef();
  const bodyRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });
  return (
    <group ref={groupRef} position={position}>
      {/* Planet body */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color="#f59e0b" 
          roughness={0.5} 
          emissive="#78350f" 
          emissiveIntensity={0.3} 
        />
      </mesh>
      {/* Rings */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[size * 1.3, size * 2.2, 64]} />
        <meshStandardMaterial 
          color="#d97706" 
          side={2} 
          transparent 
          opacity={0.7} 
          roughness={0.8} 
        />
      </mesh>
    </group>
  );
};

// Sub-component for spinning hologram core
const HologramCore = ({ position }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2.0;
      ref.current.rotation.x = state.clock.elapsedTime * 1.0;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial color="#06b6d4" wireframe />
    </mesh>
  );
};

// Control Console component
const ControlConsole = ({ position }) => {
  return (
    <group position={position}>
      {/* Main Desk */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.8, 1.2]} />
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Console keyboard area */}
      <mesh position={[0, 0.81, 0.1]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[2.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#1a202c" roughness={0.4} />
      </mesh>
      
      {/* Interactive buttons */}
      <mesh position={[-0.8, 0.84, 0.2]}>
        <boxGeometry args={[0.15, 0.03, 0.15]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[-0.5, 0.84, 0.2]}>
        <boxGeometry args={[0.15, 0.03, 0.15]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.2, 0.84, 0.2]}>
        <boxGeometry args={[0.15, 0.03, 0.15]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[0.2, 0.84, 0.2]}>
        <boxGeometry args={[0.25, 0.03, 0.15]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
      <mesh position={[0.6, 0.84, 0.2]}>
        <boxGeometry args={[0.3, 0.03, 0.2]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
      
      {/* Angled screen panel back */}
      <mesh position={[0, 1.2, -0.3]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.7, 0.15]} />
        <meshStandardMaterial color="#1a202c" metalness={0.7} roughness={0.4} />
      </mesh>
      
      {/* Screen displays */}
      <mesh position={[-0.5, 1.2, -0.21]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>
      <Text position={[-0.5, 1.2, -0.19]} rotation={[0.15, 0, 0]} fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle">
        SYS_OK
      </Text>
      
      <mesh position={[0.5, 1.2, -0.21]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial color="#059669" emissive="#059669" emissiveIntensity={0.6} />
      </mesh>
      <Text position={[0.5, 1.2, -0.19]} rotation={[0.15, 0, 0]} fontSize={0.07} color="#ffffff" anchorX="center" anchorY="middle">
        LAUNCH_RDY
      </Text>
      
      {/* Hologram emitter */}
      <mesh position={[0, 0.83, -0.1]}>
        <cylinderGeometry args={[0.15, 0.2, 0.05, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, -0.1]} transparent>
        <coneGeometry args={[0.3, 0.7, 16, 1, true]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} side={2} />
      </mesh>
      <HologramCore position={[0, 1.2, -0.1]} />
    </group>
  );
};

// Crystal Cluster component
const CrystalCluster = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.1, 16]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[-0.2, 0.6, -0.1]} rotation={[0.1, 0.05, -0.08]} castShadow>
        <cylinderGeometry args={[0, 0.18, 1.1, 5]} />
        <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={1.2} roughness={0.1} />
      </mesh>
      <mesh position={[0.25, 0.45, 0.15]} rotation={[-0.15, -0.05, 0.1]} castShadow>
        <cylinderGeometry args={[0, 0.15, 0.8, 4]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.2} roughness={0.1} />
      </mesh>
      <mesh position={[0.05, 0.3, 0.4]} rotation={[0.2, 0.1, 0.15]} castShadow>
        <cylinderGeometry args={[0, 0.12, 0.5, 6]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.0} roughness={0.1} />
      </mesh>
      <mesh position={[-0.35, 0.35, 0.35]} rotation={[0.1, -0.2, -0.2]} castShadow>
        <cylinderGeometry args={[0, 0.13, 0.6, 5]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.0} roughness={0.1} />
      </mesh>
      
      <pointLight color="#d946ef" intensity={1.5} distance={4} position={[0, 0.5, 0]} />
    </group>
  );
};

// Alien Plant component
const AlienPlant = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.5, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.43, 0.43, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      
      <mesh position={[-0.1, 0.75, 0.05]} rotation={[0.2, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#047857" roughness={0.6} />
      </mesh>
      <mesh position={[-0.17, 1.05, 0.07]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.0} />
      </mesh>
      
      <mesh position={[0.15, 0.8, -0.1]} rotation={[-0.15, 0.1, 0.2]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#047857" roughness={0.6} />
      </mesh>
      <mesh position={[0.25, 1.15, -0.13]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.0} />
      </mesh>
      
      <mesh position={[0.0, 0.65, 0.2]} rotation={[0.1, -0.15, 0.05]} castShadow>
        <cylinderGeometry args={[0.03, 0.045, 0.35, 8]} />
        <meshStandardMaterial color="#059669" roughness={0.6} />
      </mesh>
      <mesh position={[0.0, 0.85, 0.23]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

// Energy Pylon component
const EnergyPylon = ({ position, lightColor = "#ec4899" }) => {
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 1.5;
      ringRef.current.position.y = 3.2 + Math.sin(state.clock.elapsedTime * 2.0) * 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.7, 0.4, 8]} />
        <meshStandardMaterial color="#3f3f5f" metalness={0.7} roughness={0.4} />
      </mesh>
      
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.18, 3.0, 8]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {[-0.25, 0.25].map((xOffset, idx) => (
        <mesh key={idx} position={[xOffset, 1.4, 0]} castShadow>
          <boxGeometry args={[0.08, 2.0, 0.15]} />
          <meshStandardMaterial color="#3f3f5f" metalness={0.7} />
        </mesh>
      ))}
      
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.08, 12, 1, true]} />
        <meshBasicMaterial color={lightColor} />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 12, 1, true]} />
        <meshBasicMaterial color={lightColor} />
      </mesh>
      
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.2, 0.2, 8]} />
        <meshStandardMaterial color="#3f3f5f" metalness={0.7} />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      
      <group ref={ringRef} position={[0, 3.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color={lightColor} />
        </mesh>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.35, 0.04, 8, 24]} />
          <meshBasicMaterial color={lightColor} />
        </mesh>
      </group>
      
      <pointLight color={lightColor} intensity={1.8} distance={8} position={[0, 3.2, 0]} />
    </group>
  );
};

// SpaceScenery replaces DungeonScene
const SpaceScenery = () => {
  return (
    <group>
      {/* Main floor plate */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[24, 0.1, 16]} />
        <meshStandardMaterial color="#131326" metalness={0.8} roughness={0.4} />
      </mesh>
      
      {/* Floor outer border wireframe */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[23.8, 0.02, 15.8]} />
        <meshStandardMaterial color="#1a1a36" metalness={0.6} roughness={0.5} wireframe />
      </mesh>
      
      {/* Decorative neon paths on the floor */}
      <mesh position={[0, 0.015, -6.5]}>
        <boxGeometry args={[23.5, 0.01, 0.06]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <mesh position={[0, 0.015, 6.5]}>
        <boxGeometry args={[23.5, 0.01, 0.06]} />
        <meshBasicMaterial color="#ff007f" />
      </mesh>
      {[-11.5, -4, 4, 11.5].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, 0.015, 0]}>
          <boxGeometry args={[0.06, 0.01, 13.0]} />
          <meshBasicMaterial color={idx % 2 === 0 ? "#00f0ff" : "#ff007f"} />
        </mesh>
      ))}

      {/* Back Wall */}
      <mesh position={[0, 3, -8]} receiveShadow>
        <boxGeometry args={[24, 6, 0.4]} />
        <meshStandardMaterial color="#0d0d21" metalness={0.85} roughness={0.3} />
      </mesh>
      
      {/* Metallic structural columns on the back wall */}
      {[-11.8, -6, 6, 11.8].map((xOffset, idx) => (
        <mesh key={idx} position={[xOffset, 3, -7.7]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 6, 0.35]} />
          <meshStandardMaterial color="#2d2d48" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      
      {/* Diagonal brace beams on back wall */}
      <mesh position={[-8.9, 3, -7.68]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[4.2, 0.2, 0.1]} />
        <meshStandardMaterial color="#1e1e35" metalness={0.8} />
      </mesh>
      <mesh position={[8.9, 3, -7.68]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[4.2, 0.2, 0.1]} />
        <meshStandardMaterial color="#1e1e35" metalness={0.8} />
      </mesh>
      
      {/* Glowing wall stripes */}
      <mesh position={[-8.9, 3, -7.65]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[4.0, 0.05, 0.02]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <mesh position={[8.9, 3, -7.65]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[4.0, 0.05, 0.02]} />
        <meshBasicMaterial color="#ff007f" />
      </mesh>
      
      {/* Glowing logo / core in center wall */}
      <group position={[0, 4.2, -7.7]}>
        <mesh>
          <torusGeometry args={[1.0, 0.08, 8, 48]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>
      </group>

      {/* Floating Elements (Space Background) */}
      <SaturnPlanet position={[9, 7.2, -12.5]} size={1.3} />
      
      <Asteroid position={[-9, 6.8, -11]} size={0.65} speed={0.4} />
      <Asteroid position={[-11.5, 5.2, -10]} size={0.45} speed={-0.6} />
      <Asteroid position={[6.5, 8.2, -13.5]} size={0.35} speed={0.3} />

      {/* Control Console on Far Left */}
      <ControlConsole position={[-9.5, 0, -4.5]} />

      {/* Crystals and Plants on Far Right */}
      <CrystalCluster position={[9.8, 0, -4]} />
      <AlienPlant position={[10.5, 0, -2.0]} />

      {/* Energy Pylons */}
      <EnergyPylon position={[-11.0, 0, -7.0]} lightColor="#ff007f" />
      <EnergyPylon position={[11.0, 0, -7.0]} lightColor="#00f0ff" />
      <EnergyPylon position={[0.0, 0, -7.5]} lightColor="#a855f7" />
    </group>
  );
};

const Game3Hangman = ({ player, onFinish }) => {

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
  const [currentWord, setCurrentWord] = useState(() => getWordForLevel(1));
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [fails, setFails] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [feedback, setFeedback] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const wordLetters = useMemo(() => currentWord.word.split(''), [currentWord]);
  const correctLetters = useMemo(() => new Set(wordLetters), [wordLetters]);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'hangman',
          game_number: 5,
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

  const handleLetterClick = (letter) => {
    if (gameState !== 'playing' || guessedLetters.has(letter)) return;
    const newGuessed = new Set([...guessedLetters, letter]);
    setGuessedLetters(newGuessed);

    if (correctLetters.has(letter)) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      playCorrectSound();;
      playCorrectSound();
      setFeedback(`¡Correcto! "${letter}" está en la palabra.`);
      
      const allRevealed = wordLetters.every(l => newGuessed.has(l));
      if (allRevealed) {
        if (currentLevel < 6) {
          // Go to next level
          const nextLvl = currentLevel + 1;
          setFeedback(`¡Nivel ${currentLevel} Completado! Avanzando al nivel ${nextLvl}...`);
          setTimeout(() => {
            setCurrentLevel(nextLvl);
            setCurrentWord(getWordForLevel(nextLvl));
            setGuessedLetters(new Set());
            setFails(0);
            setFeedback('');
          }, 1500);
        } else {
          // Won the final level
          setGameState('won');
          const finalScore = newCorrectCount * 150;
          finishGame(newCorrectCount, incorrectCount, newCorrectCount + incorrectCount, finalScore, 6);
        }
      }
    } else {
      const newFails = fails + 1;
      setFails(newFails);
      const newIncorrectCount = incorrectCount + 1;
      setIncorrectCount(newIncorrectCount);
      setFeedback(`¡Fallo! "${letter}" no está en la palabra.`);
      if (newFails >= MAX_FAILS) {
        setGameState('lost');
        finishGame(correctCount, newIncorrectCount, correctCount + newIncorrectCount, correctCount * 100, currentLevel);
      }
    }

    const allRevealed = wordLetters.every(l => newGuessed.has(l));
    if (!allRevealed && fails < MAX_FAILS) {
      setTimeout(() => setFeedback(''), 1500);
    }
  };

  const restart = () => {
    setCurrentLevel(1);
    setCurrentWord(getWordForLevel(1));
    setGuessedLetters(new Set());
    setFails(0);
    setGameState('playing');
    setFeedback('');
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  const displayWord = wordLetters.map(l => guessedLetters.has(l) ? l : '_').join(' ');

  const letterPositions = useMemo(() => {
    const cols = 9;
    const rows = Math.ceil(ALPHABET.length / cols);
    return ALPHABET.map((letter, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        letter,
        position: [
          (col - cols / 2 + 0.5) * 1.6 + 4.5,
          0.7,
          (row - rows / 2 + 0.5) * 1.9 + 2.0,
        ],
      };
    });
  }, []);

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 9.6, 13.2]} fov={55} />
          <OrbitControls enablePan={false} minDistance={10} maxDistance={24} maxPolarAngle={Math.PI / 2.2} />
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 8, 5]} intensity={1.0} color="#f3e8ff" />
          <directionalLight position={[5, 10, 5]} intensity={0.9} castShadow />
          {/* Scaled entire 3D content by 1.2 to make it 20% larger */}
          <group scale={1.2}>
            <SpaceScenery />
            <HangmanStructure fails={fails} />
            {letterPositions.map(({ letter, position }) => (
              <LetterBlock
                key={letter}
                letter={letter}
                position={position}
                isUsed={guessedLetters.has(letter)}
                isCorrect={correctLetters.has(letter)}
                onClick={handleLetterClick}
              />
            ))}
          </group>
        </Suspense>
      </Canvas>

      {/* HUD - Glassmorphic */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10">
        <div className="font-sans text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Rescate de Letras</div>
          <div className="text-base font-extrabold text-purple-300">Nivel: {currentLevel} / 6</div>
          <div className="text-xs font-semibold text-indigo-300">Dificultad: {currentLevel <= 2 ? 'Fácil' : currentLevel <= 4 ? 'Medio' : 'Difícil'}</div>
          <div className="text-sm font-medium text-rose-400">Fallos: {fails} / {MAX_FAILS}</div>
          <div className="text-xs text-emerald-400">Puntaje Total: {correctCount * 150}</div>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-4 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-xs text-center z-10 flex flex-col items-center gap-3">
        <div className="w-18 h-18 bg-slate-950/40 rounded-xl flex items-center justify-center border border-indigo-500/10 p-2 shadow-inner">
          <DrawingSVG type={currentWord.word} />
        </div>
        <div className="font-sans text-sm flex flex-col items-center">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> PISTA
          </div>
          <div className="text-indigo-200 font-semibold text-xs leading-relaxed">{currentWord.hint}</div>
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
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Word display */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl text-4xl tracking-widest font-black uppercase text-center select-none z-10 font-mono">
        {displayWord}
      </div>

      {/* Feedback de la acción */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl z-20 text-white font-sans text-lg font-bold shadow-2xl text-center select-none animate-pulse">
          {feedback}
        </div>
      )}

      {/* Help Modal Overlay */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#131238] to-[#080a1c] border-2 border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Rescate de las Letras?
            </h3>
            
            <div className="space-y-4 text-sm text-gray-200">
              <p>
                Rescata al astronauta adivinando las letras ocultas antes de que se complete el soporte de lanzamiento.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-200 text-xs">Pasos para jugar:</h4>
                <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                  <li>Lee la <b>pista central</b> arriba (ej. <i>PISTA: Animal gigante con trompa</i>).</li>
                  <li>Haz clic sobre las letras en 3D flotantes en el espacio.</li>
                  <li>Las letras correctas completan los espacios vacíos del astronauta abajo.</li>
                  <li>Las letras incorrectas construyen una parte del soporte. ¡Evita llegar a 6 fallos!</li>
                </ul>
              </div>
              
              <div className="border border-indigo-500/20 rounded-2xl p-4 bg-slate-950/40 space-y-3">
                <h4 className="font-bold text-center text-indigo-200 text-[10px] tracking-wider uppercase">Indicadores Visuales</h4>
                
                {/* Visual indicator of correct */}
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
                  <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-xs font-black text-white shadow">A</div>
                  <div className="text-xs">
                    <strong className="text-emerald-400 text-xs">¡LETRA CORRECTA! 🟢</strong>
                    <p className="text-[10px] text-gray-300">Se volverá verde, se colocará en la palabra y sumarás progreso.</p>
                  </div>
                </div>

                {/* Visual indicator of incorrect */}
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
                  <div className="w-6 h-6 bg-rose-500 rounded flex items-center justify-center text-xs font-black text-white shadow">X</div>
                  <div className="text-xs">
                    <strong className="text-rose-400 text-xs">¡LETRA INCORRECTA! 🔴</strong>
                    <p className="text-[10px] text-gray-300">Se volverá roja, se sumará 1 fallo y aparecerá una pieza del ahorcado.</p>
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

export default Game3Hangman;
