import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { Info, Bell, Trophy, HelpCircle, Heart, Star } from 'lucide-react';
import api from '../../services/api';

// ─── Level Bank ──────────────────────────────────────────────────────────────
// 10 levels × 3 rounds each
// Each round has 5 words. Simple words for 7yo – only LLANA and AGUDA (2 choices)
// Focus: detect confusion between stressed-last (aguda) vs stressed-2nd-to-last (llana)
// This mirrors reading patterns kids with dyslexia struggle with.
const LEVELS_ROUNDS = [
  // Level 1 – 2-syllable words, big beat difference
  [
    { words: [
      { word: 'MAMÁ', syllables: ['MA', 'MÁ'], tonicIndex: 1, type: 'aguda', emoji: '👩' },
      { word: 'PAPÁ', syllables: ['PA', 'PÁ'], tonicIndex: 1, type: 'aguda', emoji: '👨' },
      { word: 'CASA', syllables: ['CA', 'SA'], tonicIndex: 0, type: 'llana', emoji: '🏠' },
      { word: 'MESA', syllables: ['ME', 'SA'], tonicIndex: 0, type: 'llana', emoji: '🪑' },
      { word: 'SOL', syllables: ['SOL'], tonicIndex: 0, type: 'aguda', emoji: '☀️' },
    ]},
    { words: [
      { word: 'BEBÉ', syllables: ['BE', 'BÉ'], tonicIndex: 1, type: 'aguda', emoji: '👶' },
      { word: 'MANO', syllables: ['MA', 'NO'], tonicIndex: 0, type: 'llana', emoji: '✋' },
      { word: 'PIE', syllables: ['PIE'], tonicIndex: 0, type: 'aguda', emoji: '🦶' },
      { word: 'LUNA', syllables: ['LU', 'NA'], tonicIndex: 0, type: 'llana', emoji: '🌙' },
      { word: 'CAFÉ', syllables: ['CA', 'FÉ'], tonicIndex: 1, type: 'aguda', emoji: '☕' },
    ]},
    { words: [
      { word: 'BOCA', syllables: ['BO', 'CA'], tonicIndex: 0, type: 'llana', emoji: '👄' },
      { word: 'MAMÁ', syllables: ['MA', 'MÁ'], tonicIndex: 1, type: 'aguda', emoji: '👩' },
      { word: 'PERRO', syllables: ['PE', 'RRO'], tonicIndex: 0, type: 'llana', emoji: '🐶' },
      { word: 'PATO', syllables: ['PA', 'TO'], tonicIndex: 0, type: 'llana', emoji: '🦆' },
      { word: 'COTÉ', syllables: ['CO', 'TÉ'], tonicIndex: 1, type: 'aguda', emoji: '🌿' },
    ]},
  ],
  // Level 2 – similar words, 2–3 syllables
  [
    { words: [
      { word: 'ARBOL', syllables: ['ÁR', 'BOL'], tonicIndex: 0, type: 'llana', emoji: '🌳' },
      { word: 'CIUDAD', syllables: ['CIU', 'DAD'], tonicIndex: 1, type: 'aguda', emoji: '🏙️' },
      { word: 'GATO', syllables: ['GA', 'TO'], tonicIndex: 0, type: 'llana', emoji: '🐱' },
      { word: 'CAMION', syllables: ['CA', 'MIÓN'], tonicIndex: 1, type: 'aguda', emoji: '🚛' },
      { word: 'NUBE', syllables: ['NU', 'BE'], tonicIndex: 0, type: 'llana', emoji: '☁️' },
    ]},
    { words: [
      { word: 'ROSA', syllables: ['RO', 'SA'], tonicIndex: 0, type: 'llana', emoji: '🌹' },
      { word: 'MELON', syllables: ['ME', 'LÓN'], tonicIndex: 1, type: 'aguda', emoji: '🍈' },
      { word: 'LIBRO', syllables: ['LI', 'BRO'], tonicIndex: 0, type: 'llana', emoji: '📚' },
      { word: 'SALON', syllables: ['SA', 'LÓN'], tonicIndex: 1, type: 'aguda', emoji: '🏛️' },
      { word: 'FLOR', syllables: ['FLOR'], tonicIndex: 0, type: 'aguda', emoji: '🌸' },
    ]},
    { words: [
      { word: 'MOTO', syllables: ['MO', 'TO'], tonicIndex: 0, type: 'llana', emoji: '🏍️' },
      { word: 'AVION', syllables: ['A', 'VIÓN'], tonicIndex: 1, type: 'aguda', emoji: '✈️' },
      { word: 'TIGRE', syllables: ['TI', 'GRE'], tonicIndex: 0, type: 'llana', emoji: '🐯' },
      { word: 'TREN', syllables: ['TREN'], tonicIndex: 0, type: 'aguda', emoji: '🚂' },
      { word: 'POLLO', syllables: ['PO', 'LLO'], tonicIndex: 0, type: 'llana', emoji: '🐔' },
    ]},
  ],
  // Level 3 – 3-syllable words introduced
  [
    { words: [
      { word: 'PELOTA', syllables: ['PE', 'LO', 'TA'], tonicIndex: 1, type: 'llana', emoji: '⚽' },
      { word: 'COLORES', syllables: ['CO', 'LO', 'RES'], tonicIndex: 2, type: 'aguda', emoji: '🎨' },
      { word: 'CAMINO', syllables: ['CA', 'MI', 'NO'], tonicIndex: 1, type: 'llana', emoji: '🛤️' },
      { word: 'LIMON', syllables: ['LI', 'MÓN'], tonicIndex: 1, type: 'aguda', emoji: '🍋' },
      { word: 'VENTANA', syllables: ['VEN', 'TA', 'NA'], tonicIndex: 1, type: 'llana', emoji: '🪟' },
    ]},
    { words: [
      { word: 'BOTELLA', syllables: ['BO', 'TE', 'LLA'], tonicIndex: 1, type: 'llana', emoji: '🍶' },
      { word: 'CANCION', syllables: ['CAN', 'CIÓN'], tonicIndex: 1, type: 'aguda', emoji: '🎵' },
      { word: 'PALOMA', syllables: ['PA', 'LO', 'MA'], tonicIndex: 1, type: 'llana', emoji: '🕊️' },
      { word: 'PARED', syllables: ['PA', 'RED'], tonicIndex: 1, type: 'aguda', emoji: '🧱' },
      { word: 'COHETE', syllables: ['CO', 'HE', 'TE'], tonicIndex: 1, type: 'llana', emoji: '🚀' },
    ]},
    { words: [
      { word: 'NARANJA', syllables: ['NA', 'RAN', 'JA'], tonicIndex: 1, type: 'llana', emoji: '🍊' },
      { word: 'BALCON', syllables: ['BAL', 'CÓN'], tonicIndex: 1, type: 'aguda', emoji: '🏰' },
      { word: 'ZAPATO', syllables: ['ZA', 'PA', 'TO'], tonicIndex: 1, type: 'llana', emoji: '👟' },
      { word: 'PAPEL', syllables: ['PA', 'PEL'], tonicIndex: 1, type: 'aguda', emoji: '📄' },
      { word: 'TOMATE', syllables: ['TO', 'MA', 'TE'], tonicIndex: 1, type: 'llana', emoji: '🍅' },
    ]},
  ],
  // Level 4
  [
    { words: [
      { word: 'NACION', syllables: ['NA', 'CIÓN'], tonicIndex: 1, type: 'aguda', emoji: '🌍' },
      { word: 'SOMBRA', syllables: ['SOM', 'BRA'], tonicIndex: 0, type: 'llana', emoji: '🌑' },
      { word: 'CAMARA', syllables: ['CÁ', 'MA', 'RA'], tonicIndex: 0, type: 'esdrujula', emoji: '📷' },
      { word: 'CARTEL', syllables: ['CAR', 'TEL'], tonicIndex: 1, type: 'aguda', emoji: '🪧' },
      { word: 'AMIGO', syllables: ['A', 'MI', 'GO'], tonicIndex: 1, type: 'llana', emoji: '🤝' },
    ]},
    { words: [
      { word: 'CORAZON', syllables: ['CO', 'RA', 'ZÓN'], tonicIndex: 2, type: 'aguda', emoji: '❤️' },
      { word: 'LAPIZ', syllables: ['LÁ', 'PIZ'], tonicIndex: 0, type: 'llana', emoji: '✏️' },
      { word: 'FLECHA', syllables: ['FLE', 'CHA'], tonicIndex: 0, type: 'llana', emoji: '🏹' },
      { word: 'QUESO', syllables: ['QUE', 'SO'], tonicIndex: 0, type: 'llana', emoji: '🧀' },
      { word: 'CUADRO', syllables: ['CUA', 'DRO'], tonicIndex: 0, type: 'llana', emoji: '🖼️' },
    ]},
    { words: [
      { word: 'PINCEL', syllables: ['PIN', 'CEL'], tonicIndex: 1, type: 'aguda', emoji: '🖌️' },
      { word: 'PUERTA', syllables: ['PUER', 'TA'], tonicIndex: 0, type: 'llana', emoji: '🚪' },
      { word: 'BOTON', syllables: ['BO', 'TÓN'], tonicIndex: 1, type: 'aguda', emoji: '🔘' },
      { word: 'OVEJA', syllables: ['O', 'VE', 'JA'], tonicIndex: 1, type: 'llana', emoji: '🐑' },
      { word: 'JUEGO', syllables: ['JUE', 'GO'], tonicIndex: 0, type: 'llana', emoji: '🎮' },
    ]},
  ],
  // Level 5
  [
    { words: [
      { word: 'VOLCAN', syllables: ['VOL', 'CÁN'], tonicIndex: 1, type: 'aguda', emoji: '🌋' },
      { word: 'MUSICO', syllables: ['MÚ', 'SI', 'CO'], tonicIndex: 0, type: 'esdrujula', emoji: '🎼' },
      { word: 'FRIJOL', syllables: ['FRI', 'JOL'], tonicIndex: 1, type: 'aguda', emoji: '🫘' },
      { word: 'CUENTO', syllables: ['CUEN', 'TO'], tonicIndex: 0, type: 'llana', emoji: '📖' },
      { word: 'PALETA', syllables: ['PA', 'LE', 'TA'], tonicIndex: 1, type: 'llana', emoji: '🍭' },
    ]},
    { words: [
      { word: 'RATON', syllables: ['RA', 'TÓN'], tonicIndex: 1, type: 'aguda', emoji: '🐭' },
      { word: 'PIEDRA', syllables: ['PIE', 'DRA'], tonicIndex: 0, type: 'llana', emoji: '🪨' },
      { word: 'PARQUE', syllables: ['PAR', 'QUE'], tonicIndex: 0, type: 'llana', emoji: '🏞️' },
      { word: 'SALON', syllables: ['SA', 'LÓN'], tonicIndex: 1, type: 'aguda', emoji: '🏛️' },
      { word: 'PERICO', syllables: ['PE', 'RI', 'CO'], tonicIndex: 1, type: 'llana', emoji: '🦜' },
    ]},
    { words: [
      { word: 'DRAGON', syllables: ['DRA', 'GÓN'], tonicIndex: 1, type: 'aguda', emoji: '🐉' },
      { word: 'ESPADA', syllables: ['ES', 'PA', 'DA'], tonicIndex: 1, type: 'llana', emoji: '⚔️' },
      { word: 'CASTILLO', syllables: ['CAS', 'TI', 'LLO'], tonicIndex: 1, type: 'llana', emoji: '🏰' },
      { word: 'LEON', syllables: ['LE', 'ÓN'], tonicIndex: 1, type: 'aguda', emoji: '🦁' },
      { word: 'LOBO', syllables: ['LO', 'BO'], tonicIndex: 0, type: 'llana', emoji: '🐺' },
    ]},
  ],
  // Level 6
  [
    { words: [
      { word: 'SORTIJA', syllables: ['SOR', 'TI', 'JA'], tonicIndex: 1, type: 'llana', emoji: '💍' },
      { word: 'CAPITAN', syllables: ['CA', 'PI', 'TÁN'], tonicIndex: 2, type: 'aguda', emoji: '⚓' },
      { word: 'PLANETA', syllables: ['PLA', 'NE', 'TA'], tonicIndex: 1, type: 'llana', emoji: '🪐' },
      { word: 'FAVOR', syllables: ['FA', 'VOR'], tonicIndex: 1, type: 'aguda', emoji: '🙏' },
      { word: 'CAMELLO', syllables: ['CA', 'ME', 'LLO'], tonicIndex: 1, type: 'llana', emoji: '🐪' },
    ]},
    { words: [
      { word: 'HELADO', syllables: ['HE', 'LA', 'DO'], tonicIndex: 1, type: 'llana', emoji: '🍦' },
      { word: 'RINCÓN', syllables: ['RIN', 'CÓN'], tonicIndex: 1, type: 'aguda', emoji: '🔍' },
      { word: 'PÁJARO', syllables: ['PÁ', 'JA', 'RO'], tonicIndex: 0, type: 'esdrujula', emoji: '🐦' },
      { word: 'FUERZA', syllables: ['FUER', 'ZA'], tonicIndex: 0, type: 'llana', emoji: '💪' },
      { word: 'VISION', syllables: ['VI', 'SIÓN'], tonicIndex: 1, type: 'aguda', emoji: '👁️' },
    ]},
    { words: [
      { word: 'COMETA', syllables: ['CO', 'ME', 'TA'], tonicIndex: 1, type: 'llana', emoji: '☄️' },
      { word: 'VAPOR', syllables: ['VA', 'POR'], tonicIndex: 1, type: 'aguda', emoji: '♨️' },
      { word: 'SOMBRERO', syllables: ['SOM', 'BRE', 'RO'], tonicIndex: 1, type: 'llana', emoji: '🎩' },
      { word: 'SALON', syllables: ['SA', 'LÓN'], tonicIndex: 1, type: 'aguda', emoji: '🏛️' },
      { word: 'LADRILLO', syllables: ['LA', 'DRI', 'LLO'], tonicIndex: 1, type: 'llana', emoji: '🧱' },
    ]},
  ],
  // Level 7
  [
    { words: [
      { word: 'TECLADO', syllables: ['TEC', 'LA', 'DO'], tonicIndex: 1, type: 'llana', emoji: '⌨️' },
      { word: 'VALIENTE', syllables: ['VA', 'LIEN', 'TE'], tonicIndex: 1, type: 'llana', emoji: '🦸' },
      { word: 'PANTALLA', syllables: ['PAN', 'TA', 'LLA'], tonicIndex: 1, type: 'llana', emoji: '📺' },
      { word: 'CIUDAD', syllables: ['CIU', 'DAD'], tonicIndex: 1, type: 'aguda', emoji: '🏙️' },
      { word: 'ACUARIO', syllables: ['A', 'CUA', 'RIO'], tonicIndex: 1, type: 'llana', emoji: '🐠' },
    ]},
    { words: [
      { word: 'MANTEL', syllables: ['MAN', 'TEL'], tonicIndex: 1, type: 'aguda', emoji: '🍽️' },
      { word: 'ESPEJO', syllables: ['ES', 'PE', 'JO'], tonicIndex: 1, type: 'llana', emoji: '🪞' },
      { word: 'JAMON', syllables: ['JA', 'MÓN'], tonicIndex: 1, type: 'aguda', emoji: '🥓' },
      { word: 'CEBOLLA', syllables: ['CE', 'BO', 'LLA'], tonicIndex: 1, type: 'llana', emoji: '🧅' },
      { word: 'COLMILLO', syllables: ['COL', 'MI', 'LLO'], tonicIndex: 1, type: 'llana', emoji: '🦷' },
    ]},
    { words: [
      { word: 'GLOBO', syllables: ['GLO', 'BO'], tonicIndex: 0, type: 'llana', emoji: '🎈' },
      { word: 'ELEFANTE', syllables: ['E', 'LE', 'FAN', 'TE'], tonicIndex: 2, type: 'llana', emoji: '🐘' },
      { word: 'CARACOL', syllables: ['CA', 'RA', 'COL'], tonicIndex: 2, type: 'aguda', emoji: '🐌' },
      { word: 'CONEJO', syllables: ['CO', 'NE', 'JO'], tonicIndex: 1, type: 'llana', emoji: '🐰' },
      { word: 'ORQUESTA', syllables: ['OR', 'QUES', 'TA'], tonicIndex: 1, type: 'llana', emoji: '🎻' },
    ]},
  ],
  // Level 8
  [
    { words: [
      { word: 'GIRASOL', syllables: ['GI', 'RA', 'SOL'], tonicIndex: 2, type: 'aguda', emoji: '🌻' },
      { word: 'BICICLETA', syllables: ['BI', 'CI', 'CLE', 'TA'], tonicIndex: 2, type: 'llana', emoji: '🚲' },
      { word: 'COLUMPIO', syllables: ['CO', 'LUM', 'PIO'], tonicIndex: 1, type: 'llana', emoji: '🎠' },
      { word: 'FESTIVAL', syllables: ['FES', 'TI', 'VAL'], tonicIndex: 2, type: 'aguda', emoji: '🎪' },
      { word: 'MARIPOSA', syllables: ['MA', 'RI', 'PO', 'SA'], tonicIndex: 2, type: 'llana', emoji: '🦋' },
    ]},
    { words: [
      { word: 'CALAMAR', syllables: ['CA', 'LA', 'MAR'], tonicIndex: 2, type: 'aguda', emoji: '🦑' },
      { word: 'VENTISCA', syllables: ['VEN', 'TIS', 'CA'], tonicIndex: 1, type: 'llana', emoji: '🌨️' },
      { word: 'HORMIGA', syllables: ['HOR', 'MI', 'GA'], tonicIndex: 1, type: 'llana', emoji: '🐜' },
      { word: 'TORNILLO', syllables: ['TOR', 'NI', 'LLO'], tonicIndex: 1, type: 'llana', emoji: '🔩' },
      { word: 'CARNAVAL', syllables: ['CAR', 'NA', 'VAL'], tonicIndex: 2, type: 'aguda', emoji: '🎭' },
    ]},
    { words: [
      { word: 'SUBMARINO', syllables: ['SUB', 'MA', 'RI', 'NO'], tonicIndex: 2, type: 'llana', emoji: '🤿' },
      { word: 'TORPEDO', syllables: ['TOR', 'PE', 'DO'], tonicIndex: 1, type: 'llana', emoji: '💥' },
      { word: 'HOSPITAL', syllables: ['HOS', 'PI', 'TAL'], tonicIndex: 2, type: 'aguda', emoji: '🏥' },
      { word: 'CASCADA', syllables: ['CAS', 'CA', 'DA'], tonicIndex: 1, type: 'llana', emoji: '💧' },
      { word: 'PAÑUELO', syllables: ['PA', 'ÑUE', 'LO'], tonicIndex: 1, type: 'llana', emoji: '🧣' },
    ]},
  ],
  // Level 9
  [
    { words: [
      { word: 'ESCALERA', syllables: ['ES', 'CA', 'LE', 'RA'], tonicIndex: 2, type: 'llana', emoji: '🪜' },
      { word: 'DINOSAURIO', syllables: ['DI', 'NO', 'SAU', 'RIO'], tonicIndex: 2, type: 'llana', emoji: '🦕' },
      { word: 'BOMBERO', syllables: ['BOM', 'BE', 'RO'], tonicIndex: 1, type: 'llana', emoji: '🚒' },
      { word: 'TEMPORAL', syllables: ['TEM', 'PO', 'RAL'], tonicIndex: 2, type: 'aguda', emoji: '⛈️' },
      { word: 'CAÑAVERAL', syllables: ['CA', 'ÑA', 'VE', 'RAL'], tonicIndex: 3, type: 'aguda', emoji: '🌿' },
    ]},
    { words: [
      { word: 'VOLANTE', syllables: ['VO', 'LAN', 'TE'], tonicIndex: 1, type: 'llana', emoji: '🪁' },
      { word: 'ALCANTARILLA', syllables: ['AL', 'CAN', 'TA', 'RI', 'LLA'], tonicIndex: 3, type: 'llana', emoji: '🔧' },
      { word: 'TEMPORAL', syllables: ['TEM', 'PO', 'RAL'], tonicIndex: 2, type: 'aguda', emoji: '⛈️' },
      { word: 'FLAMENCO', syllables: ['FLA', 'MEN', 'CO'], tonicIndex: 1, type: 'llana', emoji: '🦩' },
      { word: 'ESTACION', syllables: ['ES', 'TA', 'CIÓN'], tonicIndex: 2, type: 'aguda', emoji: '🚉' },
    ]},
    { words: [
      { word: 'CAMALEÓN', syllables: ['CA', 'MA', 'LE', 'ÓN'], tonicIndex: 3, type: 'aguda', emoji: '🦎' },
      { word: 'TELESCOPIO', syllables: ['TE', 'LES', 'CO', 'PIO'], tonicIndex: 2, type: 'llana', emoji: '🔭' },
      { word: 'MACARRON', syllables: ['MA', 'CA', 'RRÓN'], tonicIndex: 2, type: 'aguda', emoji: '🍝' },
      { word: 'MONTAÑA', syllables: ['MON', 'TA', 'ÑA'], tonicIndex: 1, type: 'llana', emoji: '⛰️' },
      { word: 'PRIMAVERA', syllables: ['PRI', 'MA', 'VE', 'RA'], tonicIndex: 2, type: 'llana', emoji: '🌷' },
    ]},
  ],
  // Level 10
  [
    { words: [
      { word: 'COCCODRILO', syllables: ['CO', 'CO', 'DRI', 'LO'], tonicIndex: 2, type: 'llana', emoji: '🐊' },
      { word: 'INVESTIGAR', syllables: ['IN', 'VES', 'TI', 'GAR'], tonicIndex: 3, type: 'aguda', emoji: '🔬' },
      { word: 'CALENDARIO', syllables: ['CA', 'LEN', 'DA', 'RIO'], tonicIndex: 2, type: 'llana', emoji: '📅' },
      { word: 'SERPENTÍN', syllables: ['SER', 'PEN', 'TÍN'], tonicIndex: 2, type: 'aguda', emoji: '🎉' },
      { word: 'VOLCANICO', syllables: ['VOL', 'CÁ', 'NI', 'CO'], tonicIndex: 1, type: 'esdrujula', emoji: '🌋' },
    ]},
    { words: [
      { word: 'CAPRICHOSO', syllables: ['CA', 'PRI', 'CHO', 'SO'], tonicIndex: 2, type: 'llana', emoji: '😤' },
      { word: 'GLOBETROTTER', syllables: ['GLO', 'BE', 'TRO', 'TTER'], tonicIndex: 3, type: 'aguda', emoji: '🌐' },
      { word: 'TELETRANSPORTE', syllables: ['TE', 'LE', 'TRANS', 'POR', 'TE'], tonicIndex: 3, type: 'llana', emoji: '🚀' },
      { word: 'COCODRILO', syllables: ['CO', 'CO', 'DRI', 'LO'], tonicIndex: 2, type: 'llana', emoji: '🐊' },
      { word: 'COMPOSITOR', syllables: ['COM', 'PO', 'SI', 'TOR'], tonicIndex: 3, type: 'aguda', emoji: '🎼' },
    ]},
    { words: [
      { word: 'PERIODICO', syllables: ['PE', 'RIÓ', 'DI', 'CO'], tonicIndex: 1, type: 'esdrujula', emoji: '📰' },
      { word: 'DESCUBRIDOR', syllables: ['DES', 'CU', 'BRI', 'DOR'], tonicIndex: 3, type: 'aguda', emoji: '🗺️' },
      { word: 'NAVEGACION', syllables: ['NA', 'VE', 'GA', 'CIÓN'], tonicIndex: 3, type: 'aguda', emoji: '⛵' },
      { word: 'HORIZONTE', syllables: ['HO', 'RI', 'ZON', 'TE'], tonicIndex: 2, type: 'llana', emoji: '🌅' },
      { word: 'EQUILIBRIO', syllables: ['E', 'QUI', 'LI', 'BRIO'], tonicIndex: 2, type: 'llana', emoji: '⚖️' },
    ]},
  ],
];

const SYLLABLE_BEAT_MS = 750; // slightly slower for 7yo

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

// Simplified statue with bigger, friendlier appearance and emoji
const Statue = (props) => {
  const { position, label, emoji, color, isHighlighted, onClick } = filterProps(props);
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick && onClick(label); }}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2, 1.6, 1]} />
        <meshLambertMaterial color={isHighlighted ? color : '#334155'} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshLambertMaterial color={isHighlighted ? color : '#475569'} />
      </mesh>
      <mesh position={[-0.22, 2.1, 0.62]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={isHighlighted ? '#06b6d4' : '#1e293b'} />
      </mesh>
      <mesh position={[0.22, 2.1, 0.62]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={isHighlighted ? '#06b6d4' : '#1e293b'} />
      </mesh>
      <Text position={[0, -0.15, 0.62]} fontSize={0.32} color="#e9d5ff" anchorX="center" anchorY="middle" fontWeight="bold">
        {label.toUpperCase()}
      </Text>
      <Text position={[0, 0.5, 0.62]} fontSize={0.38} anchorX="center" anchorY="middle">
        {emoji}
      </Text>
    </group>
  );
};

const Gong = (props) => {
  const { onClick, isPulsing } = filterProps(props);
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      const s = isPulsing ? 1 + Math.sin(state.clock.elapsedTime * 8) * 0.08 : 1;
      ringRef.current.scale.set(s, s, s);
    }
  });
  return (
    <group position={[0, 0.6, 2.5]} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.4, 0.15, 12, 32]} />
        <meshLambertMaterial color="#fbbf24" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.28, 32]} />
        <meshLambertMaterial color="#d97706" />
      </mesh>
      <mesh position={[-1.8, -0.3, 0]}>
        <boxGeometry args={[0.18, 1.2, 0.18]} />
        <meshLambertMaterial color="#312e81" />
      </mesh>
      <mesh position={[1.8, -0.3, 0]}>
        <boxGeometry args={[0.18, 1.2, 0.18]} />
        <meshLambertMaterial color="#312e81" />
      </mesh>
    </group>
  );
};

const TempleScene = () => (
  <group>
    <mesh position={[0, -0.05, 0]} receiveShadow>
      <boxGeometry args={[20, 0.1, 18]} />
      <meshLambertMaterial color="#0b0f19" />
    </mesh>
    {[[-6, -6], [6, -6], [-6, 6], [6, 6]].map((p, i) => (
      <mesh key={i} position={[p[0], 2.5, p[1]]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 5, 12]} />
        <meshLambertMaterial color="#1e1b4b" />
      </mesh>
    ))}
    <mesh position={[0, 3, -7]}>
      <boxGeometry args={[18, 6, 0.4]} />
      <meshLambertMaterial color="#0f172a" />
    </mesh>
    <mesh position={[0, 0.01, 0]}>
      <boxGeometry args={[10, 0.02, 10]} />
      <meshLambertMaterial color="#312e81" />
    </mesh>
  </group>
);

const Game7_1Temple = ({ player, onFinish }) => {

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
  const [roundIndex, setRoundIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [currentSyllable, setCurrentSyllable] = useState(0);
  const [phase, setPhase] = useState('listening');
  const [lives, setLives] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [gongPulse, setGongPulse] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  // track which words in the current round have been completed
  const [completedWordIndices, setCompletedWordIndices] = useState(new Set());

  const roundData = useMemo(() => LEVELS_ROUNDS[currentLevel - 1][roundIndex], [currentLevel, roundIndex]);
  const word = roundData.words[wordIndex];

  // Types that appear in the current round (used to determine which statue buttons to show)
  const presentTypes = useMemo(() => {
    const types = new Set(roundData.words.map(w => w.type));
    return Array.from(types);
  }, [roundData]);

  const statueConfig = useMemo(() => {
    const all = [
      { label: 'aguda', emoji: '🔔', color: '#ef4444', hint: 'última sílaba' },
      { label: 'llana', emoji: '🎵', color: '#f59e0b', hint: 'penúltima sílaba' },
      { label: 'esdrujula', emoji: '🌟', color: '#10b981', hint: 'antepenúltima sílaba' },
    ];
    // Level 1-3: only show aguda and llana to keep it simple for 7yo
    if (currentLevel <= 3) return all.filter(s => s.label !== 'esdrujula');
    // Level 4+: show all three if esdrujula appears
    if (presentTypes.includes('esdrujula')) return all;
    return all.filter(s => s.label !== 'esdrujula');
  }, [currentLevel, presentTypes]);

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'temple',
          game_number: 10,
          level: 1,
        });
        setSessionId(res.data.id);
      } catch (e) {
        console.error('Error al iniciar sesión:', e);
      }
    };
    startSession();
  }, [player]);

  const finishGame = async (correct, incorrect, total, finalScore, finalLevel = currentLevel) => {
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
        console.error('Error al guardar:', e);
      }
    }
    onFinish({ score: finalScore, level: finalLevel, sessionId });
  };

  // Rhythm beat
  useEffect(() => {
    if (gameState !== 'playing' || phase !== 'listening') return;
    const tick = setInterval(() => {
      setCurrentSyllable(prev => (prev + 1) % word.syllables.length);
    }, SYLLABLE_BEAT_MS);
    return () => clearInterval(tick);
  }, [gameState, phase, word]);

  const loadNextWordOrRound = (newCompleted) => {
    // Find next uncompleted word index in this round
    const allIndices = roundData.words.map((_, i) => i);
    const next = allIndices.find(i => !newCompleted.has(i));

    if (next === undefined) {
      // Round complete
      setTimeout(() => {
        if (roundIndex < 2) {
          setRoundIndex(r => r + 1);
          setCompletedWordIndices(new Set());
          setWordIndex(0);
          setCurrentSyllable(0);
          setPhase('listening');
          setFeedback(`¡Mini-ronda ${roundIndex + 1} superada! Siguiente... 🌟`);
          setTimeout(() => setFeedback(''), 2000);
        } else {
          // Level complete
          if (currentLevel < 10) {
            const nextLvl = currentLevel + 1;
            setCurrentLevel(nextLvl);
            setRoundIndex(0);
            setCompletedWordIndices(new Set());
            setWordIndex(0);
            setCurrentSyllable(0);
            setPhase('listening');
            setLives(5); // reset lives every level for 7yo
            setFeedback(`¡Nivel ${currentLevel} completado! 🎉 Nivel ${nextLvl}...`);
            setTimeout(() => setFeedback(''), 2500);
          } else {
            setGameState('won');
            finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 200, 10);
          }
        }
      }, 1000);
    } else {
      setTimeout(() => {
        setWordIndex(next);
        setCurrentSyllable(0);
        setPhase('listening');
      }, 700);
    }
  };

  const handleGongClick = () => {
    if (gameState !== 'playing' || phase !== 'listening') return;
    if (currentSyllable === word.tonicIndex) {
      setCorrectCount(c => c + 1);
      playCorrectSound();
      setPhase('captured');
      setGongPulse(true);
      setTimeout(() => setGongPulse(false), 800);
      setFeedback(`¡Bien! Ahora elige la estatua correcta 🎯`);
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setIncorrectCount(i => i + 1);
      setFeedback(`😕 La sílaba fuerte era: "${word.syllables[word.tonicIndex]}"`);
      setTimeout(() => setFeedback(''), 2500);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setGameState('lost');
        }
        return next;
      });
      setTimeout(() => {
        if (lives > 1) {
          setCurrentSyllable(0);
          setPhase('listening');
        }
      }, 2700);
    }
  };

  const handleStatueClick = (statueType) => {
    if (gameState !== 'playing' || phase !== 'captured') return;
    if (statueType === word.type) {
      setCorrectCount(c => c + 1);
      playCorrectSound();
      setFeedback(`¡CORRECTO! "${word.word}" – ${statueType.toUpperCase()} ✅`);
      setTimeout(() => setFeedback(''), 2000);
      const newCompleted = new Set([...completedWordIndices, wordIndex]);
      setCompletedWordIndices(newCompleted);
      loadNextWordOrRound(newCompleted);
    } else {
      setIncorrectCount(i => i + 1);
      setFeedback(`❌ "${word.word}" es ${word.type.toUpperCase()}, no ${statueType}`);
      setTimeout(() => setFeedback(''), 2500);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setGameState('lost');
        }
        return next;
      });
      setTimeout(() => {
        if (lives > 1) {
          setCurrentSyllable(0);
          setPhase('listening');
        }
      }, 2700);
    }
  };

  const restart = () => {
    setCurrentLevel(1);
    setRoundIndex(0);
    setWordIndex(0);
    setCurrentSyllable(0);
    setPhase('listening');
    setLives(5);
    setGameState('playing');
    setFeedback('');
    setCorrectCount(0);
    setIncorrectCount(0);
    setCompletedWordIndices(new Set());
  };

  const statuePositions = statueConfig.length === 2
    ? [[-3.5, 0, -4], [3.5, 0, -4]]
    : [[-5, 0, -4], [0, 0, -4.5], [5, 0, -4]];

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 11]} fov={55} />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 6, 0]} intensity={1} color="#fbbf24" />
          <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />
          <TempleScene />
          {statueConfig.map((s, i) => (
            <Statue
              key={s.label}
              position={statuePositions[i]}
              label={s.label}
              emoji={s.emoji}
              color={s.color}
              isHighlighted={phase === 'captured'}
              onClick={handleStatueClick}
            />
          ))}
          <Gong onClick={handleGongClick} isPulsing={gongPulse} />

          {/* Floating syllable boxes */}
          {phase === 'listening' && word.syllables.map((syl, i) => (
            <group key={i} position={[(i - (word.syllables.length - 1) / 2) * 1.5, 3.8, 2.5]}>
              <mesh>
                <boxGeometry args={[1.3, 0.85, 0.2]} />
                <meshLambertMaterial color={i === currentSyllable ? '#fbbf24' : '#e2e8f0'} />
              </mesh>
              <Text position={[0, 0, 0.12]} fontSize={0.42} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="bold">
                {syl}
              </Text>
            </group>
          ))}
          {phase === 'captured' && (
            <group position={[0, 3.8, 2.5]}>
              <mesh>
                <boxGeometry args={[word.word.length * 0.48 + 0.7, 1.0, 0.3]} />
                <meshLambertMaterial color="#10b981" />
              </mesh>
              <Text position={[0, 0, 0.18]} fontSize={0.48} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
                {word.word}
              </Text>
            </group>
          )}
        </Suspense>
      </Canvas>

      {/* HUD – top left */}
      <div className="absolute top-4 left-4 p-4 bg-slate-900/85 backdrop-blur-md border border-cyan-500/20 rounded-2xl text-white shadow-xl z-10 min-w-[190px]">
        <div className="font-sans text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">El Eco (7 años)</div>
          <div className="text-base font-extrabold text-cyan-300">Nivel: {currentLevel} / 10</div>
          <div className="text-xs font-semibold text-indigo-300">Ronda: {roundIndex + 1} / 3</div>
          <div className="text-xs text-emerald-400">Palabras: {completedWordIndices.size} / {roundData.words.length}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-rose-400 font-bold">Vidas:</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className={`w-3.5 h-3.5 ${i < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center guide – top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-4 bg-slate-900/85 backdrop-blur-md border border-cyan-500/20 rounded-2xl text-white shadow-xl max-w-sm text-center z-10">
        <div className="font-sans text-sm flex flex-col items-center gap-1">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> Pista de sílabas
          </div>
          <div className="text-xl font-black text-yellow-300">{word.emoji} {word.word}</div>
          <div className="grid gap-1 text-[10px] font-semibold text-indigo-200 mt-1" style={{ gridTemplateColumns: `repeat(${statueConfig.length}, 1fr)` }}>
            {statueConfig.map(s => (
              <div key={s.label} className="text-center">
                <span style={{ color: s.color }} className="font-black">{s.label.toUpperCase()}</span>
                <br />{s.hint}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help button */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="absolute top-4 right-28 p-2.5 bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 flex items-center justify-center pointer-events-auto"
        title="¿Cómo jugar?"
      >
        <HelpCircle className="w-5 h-5 text-cyan-300" />
      </button>

      {/* Exit button */}
      <button
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Gong button (listening phase) */}
      {phase === 'listening' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
          <button
            onClick={handleGongClick}
            className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl transition-all duration-200 shadow-2xl hover:scale-105 cursor-pointer flex items-center gap-2 text-lg uppercase"
          >
            <Bell className="w-6 h-6 text-slate-950 animate-bounce" /> ¡Golpear Gong!
          </button>
        </div>
      )}

      {/* Statue buttons (captured phase) */}
      {phase === 'captured' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-4 pointer-events-auto">
          {statueConfig.map(s => (
            <button
              key={s.label}
              onClick={() => handleStatueClick(s.label)}
              style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}
              className="px-6 py-4 text-white font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl cursor-pointer text-base flex flex-col items-center gap-1"
            >
              <span className="text-2xl">{s.emoji}</span>
              {s.label.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Feedback popup */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl z-20 text-white font-sans text-xl font-bold shadow-2xl text-center select-none animate-pulse">
          {feedback}
        </div>
      )}

      {/* Game Over screen */}
      {gameState === 'lost' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1c0d24] to-[#0a0512] border-2 border-red-500/40 rounded-3xl max-w-md w-full p-8 text-center text-white shadow-2xl font-sans">
            <Trophy className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-black text-rose-400 mb-2">¡Sin Vidas!</h2>
            <p className="text-sm text-gray-300 mb-6">¡Buen intento! Las vidas se recargan en cada nivel.</p>
            <div className="bg-slate-900/60 border border-red-500/25 rounded-2xl p-4 mb-6 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Nivel alcanzado:</span>
                <span className="font-bold text-white">{currentLevel} / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ronda:</span>
                <span className="font-bold text-white">{roundIndex + 1} / 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Respuestas correctas:</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={restart} className="py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase shadow-lg">
                Volver a Intentar
              </button>
              <button onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)} className="py-3 bg-slate-800 hover:bg-slate-700 text-gray-200 font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase">
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Won screen */}
      {gameState === 'won' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#0e2417] to-[#040f09] border-2 border-emerald-500/40 rounded-3xl max-w-md w-full p-8 text-center text-white shadow-2xl font-sans">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-emerald-400 mb-2">¡CAMPEÓN DEL ECO!</h2>
            <p className="text-sm text-gray-300 mb-6">¡Completaste los 10 niveles! Eres un maestro de las sílabas.</p>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />)}
            </div>
            <div className="bg-slate-900/60 border border-emerald-500/25 rounded-2xl p-4 mb-6 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Palabras correctas:</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Errores totales:</span>
                <span className="font-bold text-rose-400">{incorrectCount}</span>
              </div>
            </div>
            <button
              onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 200, 10)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase shadow-lg"
            >
              Ver mis Resultados
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#131238] to-[#080a1c] border-2 border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative font-sans">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer">✕</button>
            <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-cyan-400 animate-pulse" /> ¿Cómo jugar? (7 años)
            </h3>
            <div className="space-y-3 text-sm text-gray-200">
              <p>Escucha cómo suenan las sílabas de la palabra y toca el gong cuando escuches la sílaba MÁS FUERTE.</p>
              <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                <li>Mira las cajas con las sílabas que se iluminan, una por una.</li>
                <li>Cuando se ilumine la sílaba MÁS FUERTE (la tónica), presiona el botón <b>"¡Golpear Gong!"</b>.</li>
                <li>Luego elige la estatua correcta:
                  <ul className="list-disc list-inside pl-3 space-y-0.5 text-[11px] text-gray-300">
                    <li><b>🔔 AGUDA:</b> la fuerza está en la ÚLTIMA sílaba (ej: mamÁ).</li>
                    <li><b>🎵 LLANA:</b> la fuerza está en la PENÚLTIMA sílaba (ej: CASa).</li>
                    <li><b>🌟 ESDRÚJULA:</b> la fuerza está en la ANTEPENÚLTIMA (ej: MÚsica).</li>
                  </ul>
                </li>
                <li>Tienes <b>5 vidas por nivel</b>. ¡Se recargan cuando subes de nivel!</li>
                <li>Completa los 10 niveles (3 rondas cada uno) para ganar.</li>
              </ul>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer text-sm"
            >
              ¡Entendido, a Jugar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game7_1Temple;
