import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { Info, Bell, Trophy, HelpCircle, Heart, Award } from 'lucide-react';
import api from '../../services/api';

// ─── Level Bank (10 levels × 3 rounds × 5 words) ─────────────────────────────
const LEVELS_ROUNDS = [
  // Level 1 – Very easy words, 2 syllables, aguda/llana only
  [
    { words: [
      { word: 'CAFÉ', syllables: ['CA', 'FÉ'], tonicIndex: 1, type: 'aguda' },
      { word: 'CASA', syllables: ['CA', 'SA'], tonicIndex: 0, type: 'llana' },
      { word: 'SOFÁ', syllables: ['SO', 'FÁ'], tonicIndex: 1, type: 'aguda' },
      { word: 'MESA', syllables: ['ME', 'SA'], tonicIndex: 0, type: 'llana' },
      { word: 'MAMÁ', syllables: ['MA', 'MÁ'], tonicIndex: 1, type: 'aguda' },
    ]},
    { words: [
      { word: 'PAPÁ', syllables: ['PA', 'PÁ'], tonicIndex: 1, type: 'aguda' },
      { word: 'NUBE', syllables: ['NU', 'BE'], tonicIndex: 0, type: 'llana' },
      { word: 'BEBÉ', syllables: ['BE', 'BÉ'], tonicIndex: 1, type: 'aguda' },
      { word: 'GATO', syllables: ['GA', 'TO'], tonicIndex: 0, type: 'llana' },
      { word: 'AQUÍ', syllables: ['A', 'QUÍ'], tonicIndex: 1, type: 'aguda' },
    ]},
    { words: [
      { word: 'MANO', syllables: ['MA', 'NO'], tonicIndex: 0, type: 'llana' },
      { word: 'ESTÁS', syllables: ['ES', 'TÁS'], tonicIndex: 1, type: 'aguda' },
      { word: 'LUNA', syllables: ['LU', 'NA'], tonicIndex: 0, type: 'llana' },
      { word: 'AQUÍ', syllables: ['A', 'QUÍ'], tonicIndex: 1, type: 'aguda' },
      { word: 'PERRO', syllables: ['PE', 'RRO'], tonicIndex: 0, type: 'llana' },
    ]},
  ],
  // Level 2 – Introduce longer words
  [
    { words: [
      { word: 'ÁRBOL', syllables: ['ÁR', 'BOL'], tonicIndex: 0, type: 'llana' },
      { word: 'CANCIÓN', syllables: ['CAN', 'CIÓN'], tonicIndex: 1, type: 'aguda' },
      { word: 'LIBRO', syllables: ['LI', 'BRO'], tonicIndex: 0, type: 'llana' },
      { word: 'MELON', syllables: ['ME', 'LÓN'], tonicIndex: 1, type: 'aguda' },
      { word: 'TIGRE', syllables: ['TI', 'GRE'], tonicIndex: 0, type: 'llana' },
    ]},
    { words: [
      { word: 'NARIZ', syllables: ['NA', 'RIZ'], tonicIndex: 1, type: 'aguda' },
      { word: 'FALDA', syllables: ['FAL', 'DA'], tonicIndex: 0, type: 'llana' },
      { word: 'CIUDAD', syllables: ['CIU', 'DAD'], tonicIndex: 1, type: 'aguda' },
      { word: 'DIENTE', syllables: ['DIEN', 'TE'], tonicIndex: 0, type: 'llana' },
      { word: 'JAMÓN', syllables: ['JA', 'MÓN'], tonicIndex: 1, type: 'aguda' },
    ]},
    { words: [
      { word: 'PUERTA', syllables: ['PUER', 'TA'], tonicIndex: 0, type: 'llana' },
      { word: 'BOTÓN', syllables: ['BO', 'TÓN'], tonicIndex: 1, type: 'aguda' },
      { word: 'MUELA', syllables: ['MUE', 'LA'], tonicIndex: 0, type: 'llana' },
      { word: 'CAMIÓN', syllables: ['CA', 'MIÓN'], tonicIndex: 1, type: 'aguda' },
      { word: 'TROZO', syllables: ['TRO', 'ZO'], tonicIndex: 0, type: 'llana' },
    ]},
  ],
  // Level 3 – Esdrújulas introduced (3 types)
  [
    { words: [
      { word: 'MÚSICA', syllables: ['MÚ', 'SI', 'CA'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'COMIÓ', syllables: ['CO', 'MIÓ'], tonicIndex: 1, type: 'aguda' },
      { word: 'CAMINO', syllables: ['CA', 'MI', 'NO'], tonicIndex: 1, type: 'llana' },
      { word: 'PÁJARO', syllables: ['PÁ', 'JA', 'RO'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'COMEDOR', syllables: ['CO', 'ME', 'DOR'], tonicIndex: 2, type: 'aguda' },
    ]},
    { words: [
      { word: 'BRÚJULA', syllables: ['BRÚ', 'JU', 'LA'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'PELOTA', syllables: ['PE', 'LO', 'TA'], tonicIndex: 1, type: 'llana' },
      { word: 'SILLÓN', syllables: ['SI', 'LLÓN'], tonicIndex: 1, type: 'aguda' },
      { word: 'LÁMPARA', syllables: ['LÁM', 'PA', 'RA'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'AMIGOS', syllables: ['A', 'MI', 'GOS'], tonicIndex: 1, type: 'llana' },
    ]},
    { words: [
      { word: 'MÉDICO', syllables: ['MÉ', 'DI', 'CO'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'VENTANA', syllables: ['VEN', 'TA', 'NA'], tonicIndex: 1, type: 'llana' },
      { word: 'CARTÓN', syllables: ['CAR', 'TÓN'], tonicIndex: 1, type: 'aguda' },
      { word: 'PÁLIDO', syllables: ['PÁ', 'LI', 'DO'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'BOTELLA', syllables: ['BO', 'TE', 'LLA'], tonicIndex: 1, type: 'llana' },
    ]},
  ],
  // Level 4 – Medium complexity
  [
    { words: [
      { word: 'NÚMERO', syllables: ['NÚ', 'ME', 'RO'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'CORAZÓN', syllables: ['CO', 'RA', 'ZÓN'], tonicIndex: 2, type: 'aguda' },
      { word: 'PALOMA', syllables: ['PA', 'LO', 'MA'], tonicIndex: 1, type: 'llana' },
      { word: 'DIÁLOGO', syllables: ['DI', 'Á', 'LO', 'GO'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'ESTACIÓN', syllables: ['ES', 'TA', 'CIÓN'], tonicIndex: 2, type: 'aguda' },
    ]},
    { words: [
      { word: 'NARANJA', syllables: ['NA', 'RAN', 'JA'], tonicIndex: 1, type: 'llana' },
      { word: 'VOLCÁN', syllables: ['VOL', 'CÁN'], tonicIndex: 1, type: 'aguda' },
      { word: 'RÉGIMEN', syllables: ['RÉ', 'GI', 'MEN'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'CUMPLEA', syllables: ['CUM', 'PLE', 'A'], tonicIndex: 1, type: 'llana' },
      { word: 'CAMPEÓN', syllables: ['CAM', 'PE', 'ÓN'], tonicIndex: 2, type: 'aguda' },
    ]},
    { words: [
      { word: 'TRÁFICO', syllables: ['TRÁ', 'FI', 'CO'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'SOMBRERO', syllables: ['SOM', 'BRE', 'RO'], tonicIndex: 1, type: 'llana' },
      { word: 'JAMÓN', syllables: ['JA', 'MÓN'], tonicIndex: 1, type: 'aguda' },
      { word: 'ESPÍRITU', syllables: ['ES', 'PÍ', 'RI', 'TU'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'CARACOL', syllables: ['CA', 'RA', 'COL'], tonicIndex: 2, type: 'aguda' },
    ]},
  ],
  // Level 5 – Harder, longer words
  [
    { words: [
      { word: 'CAPÍTULO', syllables: ['CA', 'PÍ', 'TU', 'LO'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'EDUCACIÓN', syllables: ['E', 'DU', 'CA', 'CIÓN'], tonicIndex: 3, type: 'aguda' },
      { word: 'BICICLETA', syllables: ['BI', 'CI', 'CLE', 'TA'], tonicIndex: 2, type: 'llana' },
      { word: 'TECLADO', syllables: ['TEC', 'LA', 'DO'], tonicIndex: 1, type: 'llana' },
      { word: 'RELÁMPAGO', syllables: ['RE', 'LÁM', 'PA', 'GO'], tonicIndex: 1, type: 'esdrujula' },
    ]},
    { words: [
      { word: 'PIRÁMIDE', syllables: ['PI', 'RÁ', 'MI', 'DE'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'HOSPITAL', syllables: ['HOS', 'PI', 'TAL'], tonicIndex: 2, type: 'aguda' },
      { word: 'MARIPOSA', syllables: ['MA', 'RI', 'PO', 'SA'], tonicIndex: 2, type: 'llana' },
      { word: 'SÍLABA', syllables: ['SÍ', 'LA', 'BA'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'JARDÍN', syllables: ['JAR', 'DÍN'], tonicIndex: 1, type: 'aguda' },
    ]},
    { words: [
      { word: 'GEOGRAFÍA', syllables: ['GE', 'O', 'GRA', 'FÍ', 'A'], tonicIndex: 3, type: 'llana' },
      { word: 'COMPUTADOR', syllables: ['COM', 'PU', 'TA', 'DOR'], tonicIndex: 3, type: 'aguda' },
      { word: 'RÉCORD', syllables: ['RÉ', 'CORD'], tonicIndex: 0, type: 'esdrujula' },
      { word: 'TELEVISIÓN', syllables: ['TE', 'LE', 'VI', 'SIÓN'], tonicIndex: 3, type: 'aguda' },
      { word: 'PARAGUAS', syllables: ['PA', 'RA', 'GUAS'], tonicIndex: 1, type: 'llana' },
    ]},
  ],
  // Level 6 – Advanced
  [
    { words: [
      { word: 'GRAMÁTICA', syllables: ['GRA', 'MÁ', 'TI', 'CA'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'COMPASIÓN', syllables: ['COM', 'PA', 'SIÓN'], tonicIndex: 2, type: 'aguda' },
      { word: 'PANTALLA', syllables: ['PAN', 'TA', 'LLA'], tonicIndex: 1, type: 'llana' },
      { word: 'ELÉCTRICO', syllables: ['E', 'LÉC', 'TRI', 'CO'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'HABITACIÓN', syllables: ['HA', 'BI', 'TA', 'CIÓN'], tonicIndex: 3, type: 'aguda' },
    ]},
    { words: [
      { word: 'ELEFANTE', syllables: ['E', 'LE', 'FAN', 'TE'], tonicIndex: 2, type: 'llana' },
      { word: 'BIOLÓGICO', syllables: ['BIO', 'LÓ', 'GI', 'CO'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'UNIVERSIDAD', syllables: ['U', 'NI', 'VER', 'SI', 'DAD'], tonicIndex: 4, type: 'aguda' },
      { word: 'TORTUGA', syllables: ['TOR', 'TU', 'GA'], tonicIndex: 1, type: 'llana' },
      { word: 'POLÍTICA', syllables: ['PO', 'LÍ', 'TI', 'CA'], tonicIndex: 1, type: 'esdrujula' },
    ]},
    { words: [
      { word: 'DICCIONARIO', syllables: ['DIC', 'CIO', 'NA', 'RIO'], tonicIndex: 2, type: 'llana' },
      { word: 'ARMONÍA', syllables: ['AR', 'MO', 'NÍ', 'A'], tonicIndex: 2, type: 'llana' },
      { word: 'INTERJECCIÓN', syllables: ['IN', 'TER', 'JEC', 'CIÓN'], tonicIndex: 3, type: 'aguda' },
      { word: 'SEMÁFORO', syllables: ['SE', 'MÁ', 'FO', 'RO'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'RECICLADO', syllables: ['RE', 'CI', 'CLA', 'DO'], tonicIndex: 2, type: 'llana' },
    ]},
  ],
  // Level 7 – Expert
  [
    { words: [
      { word: 'MATEMÁTICA', syllables: ['MA', 'TE', 'MÁ', 'TI', 'CA'], tonicIndex: 2, type: 'esdrujula' },
      { word: 'DISTRIBUCIÓN', syllables: ['DIS', 'TRI', 'BU', 'CIÓN'], tonicIndex: 3, type: 'aguda' },
      { word: 'MICROSCOPIA', syllables: ['MIC', 'ROS', 'CO', 'PIA'], tonicIndex: 2, type: 'llana' },
      { word: 'TERMÓMETRO', syllables: ['TER', 'MÓ', 'ME', 'TRO'], tonicIndex: 1, type: 'esdrujula' },
      { word: 'CONCLUSIÓN', syllables: ['CON', 'CLU', 'SIÓN'], tonicIndex: 2, type: 'aguda' },
    ]},
    { words: [
      { word: 'BIBLIOGRAFÍA', syllables: ['BIB', 'LIO', 'GRA', 'FÍ', 'A'], tonicIndex: 3, type: 'llana' },
      { word: 'FARMACÉUTICO', syllables: ['FAR', 'MA', 'CÉU', 'TI', 'CO'], tonicIndex: 2, type: 'esdrujula' },
      { word: 'COMUNICACIÓN', syllables: ['CO', 'MU', 'NI', 'CA', 'CIÓN'], tonicIndex: 4, type: 'aguda' },
      { word: 'TELESCOPIO', syllables: ['TE', 'LES', 'CO', 'PIO'], tonicIndex: 2, type: 'llana' },
      { word: 'TÓXICO', syllables: ['TÓ', 'XI', 'CO'], tonicIndex: 0, type: 'esdrujula' },
    ]},
    { words: [
      { word: 'ARQUEOLOGÍA', syllables: ['AR', 'QUE', 'O', 'LO', 'GÍ', 'A'], tonicIndex: 4, type: 'llana' },
      { word: 'ESPECTÁCULO', syllables: ['ES', 'PEC', 'TÁ', 'CU', 'LO'], tonicIndex: 2, type: 'esdrujula' },
      { word: 'CLASIFICACIÓN', syllables: ['CLA', 'SI', 'FI', 'CA', 'CIÓN'], tonicIndex: 4, type: 'aguda' },
      { word: 'METEOROLÓGICO', syllables: ['ME', 'TE', 'O', 'RO', 'LÓ', 'GI', 'CO'], tonicIndex: 4, type: 'esdrujula' },
      { word: 'VOLUNTARIO', syllables: ['VO', 'LUN', 'TA', 'RIO'], tonicIndex: 2, type: 'llana' },
    ]},
  ],
  // Level 8 – Master
  [
    { words: [
      { word: 'FOTOGRAFÍA', syllables: ['FO', 'TO', 'GRA', 'FÍ', 'A'], tonicIndex: 3, type: 'llana' },
      { word: 'ORTOGRAFÍA', syllables: ['OR', 'TO', 'GRA', 'FÍ', 'A'], tonicIndex: 3, type: 'llana' },
      { word: 'SIGNIFICADO', syllables: ['SIG', 'NI', 'FI', 'CA', 'DO'], tonicIndex: 3, type: 'llana' },
      { word: 'EQUILIBRIO', syllables: ['E', 'QUI', 'LI', 'BRIO'], tonicIndex: 2, type: 'llana' },
      { word: 'PERJUDICIAL', syllables: ['PER', 'JU', 'DI', 'CIAL'], tonicIndex: 3, type: 'aguda' },
    ]},
    { words: [
      { word: 'REVOLUCIONARIO', syllables: ['RE', 'VO', 'LU', 'CIO', 'NA', 'RIO'], tonicIndex: 4, type: 'llana' },
      { word: 'RESPONSABILIDAD', syllables: ['RES', 'PON', 'SA', 'BI', 'LI', 'DAD'], tonicIndex: 5, type: 'aguda' },
      { word: 'HIPOCRESÍA', syllables: ['HI', 'PO', 'CRE', 'SÍ', 'A'], tonicIndex: 3, type: 'llana' },
      { word: 'EXTRAORDINARIO', syllables: ['EX', 'TRA', 'OR', 'DI', 'NA', 'RIO'], tonicIndex: 4, type: 'llana' },
      { word: 'TRANSFORMACIÓN', syllables: ['TRANS', 'FOR', 'MA', 'CIÓN'], tonicIndex: 3, type: 'aguda' },
    ]},
    { words: [
      { word: 'INCONDICIONAL', syllables: ['IN', 'CON', 'DI', 'CIO', 'NAL'], tonicIndex: 4, type: 'aguda' },
      { word: 'ELECTRÓNICO', syllables: ['E', 'LEC', 'TRÓ', 'NI', 'CO'], tonicIndex: 2, type: 'esdrujula' },
      { word: 'INDISPENSABLE', syllables: ['IN', 'DIS', 'PEN', 'SA', 'BLE'], tonicIndex: 3, type: 'llana' },
      { word: 'CALIFICACIÓN', syllables: ['CA', 'LI', 'FI', 'CA', 'CIÓN'], tonicIndex: 4, type: 'aguda' },
      { word: 'MICROSCOPIO', syllables: ['MIC', 'ROS', 'CO', 'PIO'], tonicIndex: 2, type: 'llana' },
    ]},
  ],
  // Level 9 – Grandmaster
  [
    { words: [
      { word: 'DOCUMENTACIÓN', syllables: ['DO', 'CU', 'MEN', 'TA', 'CIÓN'], tonicIndex: 4, type: 'aguda' },
      { word: 'PLANIFICACIÓN', syllables: ['PLA', 'NI', 'FI', 'CA', 'CIÓN'], tonicIndex: 4, type: 'aguda' },
      { word: 'BIODIVERSIDAD', syllables: ['BIO', 'DI', 'VER', 'SI', 'DAD'], tonicIndex: 4, type: 'aguda' },
      { word: 'PRONUNCIACIÓN', syllables: ['PRO', 'NUN', 'CIA', 'CIÓN'], tonicIndex: 3, type: 'aguda' },
      { word: 'CARACTERÍSTICO', syllables: ['CA', 'RAC', 'TE', 'RÍS', 'TI', 'CO'], tonicIndex: 3, type: 'esdrujula' },
    ]},
    { words: [
      { word: 'EPISTEMOLOGÍA', syllables: ['E', 'PIS', 'TE', 'MO', 'LO', 'GÍ', 'A'], tonicIndex: 5, type: 'llana' },
      { word: 'ESPECIFICACIÓN', syllables: ['ES', 'PE', 'CI', 'FI', 'CA', 'CIÓN'], tonicIndex: 5, type: 'aguda' },
      { word: 'PSICOFISIOLÓGICO', syllables: ['PSI', 'CO', 'FI', 'SIO', 'LÓ', 'GI', 'CO'], tonicIndex: 4, type: 'esdrujula' },
      { word: 'INTERMINABLE', syllables: ['IN', 'TER', 'MI', 'NA', 'BLE'], tonicIndex: 3, type: 'llana' },
      { word: 'RECONOCIMIENTO', syllables: ['RE', 'CO', 'NO', 'CI', 'MIEN', 'TO'], tonicIndex: 4, type: 'llana' },
    ]},
    { words: [
      { word: 'REPRESENTACIÓN', syllables: ['RE', 'PRE', 'SEN', 'TA', 'CIÓN'], tonicIndex: 4, type: 'aguda' },
      { word: 'ELECTRODOMÉSTICO', syllables: ['E', 'LEC', 'TRO', 'DO', 'MÉS', 'TI', 'CO'], tonicIndex: 4, type: 'esdrujula' },
      { word: 'ADMINISTRACIÓN', syllables: ['AD', 'MI', 'NIS', 'TRA', 'CIÓN'], tonicIndex: 4, type: 'aguda' },
      { word: 'TELECOMUNICACIONES', syllables: ['TE', 'LE', 'CO', 'MU', 'NI', 'CA', 'CIO', 'NES'], tonicIndex: 6, type: 'llana' },
      { word: 'DESCONCERTANTE', syllables: ['DES', 'CON', 'CER', 'TAN', 'TE'], tonicIndex: 3, type: 'llana' },
    ]},
  ],
  // Level 10 – Legendary
  [
    { words: [
      { word: 'CONSTITUCIONAL', syllables: ['CON', 'STI', 'TU', 'CIO', 'NAL'], tonicIndex: 4, type: 'aguda' },
      { word: 'NEUROPSICOLOGÍA', syllables: ['NEU', 'ROP', 'SI', 'CO', 'LO', 'GÍ', 'A'], tonicIndex: 5, type: 'llana' },
      { word: 'ELECTROMAGNÉTICO', syllables: ['E', 'LEC', 'TRO', 'MAG', 'NÉ', 'TI', 'CO'], tonicIndex: 4, type: 'esdrujula' },
      { word: 'INTERCOMUNICACIÓN', syllables: ['IN', 'TER', 'CO', 'MU', 'NI', 'CA', 'CIÓN'], tonicIndex: 6, type: 'aguda' },
      { word: 'PERSONALÍSIMO', syllables: ['PER', 'SO', 'NA', 'LÍ', 'SI', 'MO'], tonicIndex: 3, type: 'esdrujula' },
    ]},
    { words: [
      { word: 'INTERNACIONALIZACIÓN', syllables: ['IN', 'TER', 'NA', 'CIO', 'NA', 'LI', 'ZA', 'CIÓN'], tonicIndex: 7, type: 'aguda' },
      { word: 'DESCONSTITUCIONALIZAR', syllables: ['DES', 'CON', 'STI', 'TU', 'CIO', 'NA', 'LI', 'ZAR'], tonicIndex: 7, type: 'aguda' },
      { word: 'EXTRAORDINARIAMENTE', syllables: ['EX', 'TRA', 'OR', 'DI', 'NA', 'RIA', 'MEN', 'TE'], tonicIndex: 6, type: 'llana' },
      { word: 'PSICOLINGÜÍSTICA', syllables: ['PSI', 'CO', 'LIN', 'GÜÍS', 'TI', 'CA'], tonicIndex: 3, type: 'esdrujula' },
      { word: 'DESLOCALIZACIÓN', syllables: ['DES', 'LO', 'CA', 'LI', 'ZA', 'CIÓN'], tonicIndex: 5, type: 'aguda' },
    ]},
    { words: [
      { word: 'ELECTROENCEFALOGRAMA', syllables: ['E', 'LEC', 'TRO', 'EN', 'CE', 'FA', 'LO', 'GRA', 'MA'], tonicIndex: 7, type: 'llana' },
      { word: 'INCONSTITUCIONALIDAD', syllables: ['IN', 'CON', 'STI', 'TU', 'CIO', 'NA', 'LI', 'DAD'], tonicIndex: 7, type: 'aguda' },
      { word: 'HIPERSENSIBILIDAD', syllables: ['HI', 'PER', 'SEN', 'SI', 'BI', 'LI', 'DAD'], tonicIndex: 6, type: 'aguda' },
      { word: 'SUPRAINDIVIDUALISMO', syllables: ['SU', 'PRA', 'IN', 'DI', 'VI', 'DUA', 'LIS', 'MO'], tonicIndex: 6, type: 'llana' },
      { word: 'DESCATEGORIZACIÓN', syllables: ['DES', 'CA', 'TE', 'GO', 'RI', 'ZA', 'CIÓN'], tonicIndex: 6, type: 'aguda' },
    ]},
  ],
];

const SYLLABLE_BEAT_MS = 600;

const filterProps = (props) => {
  const f = { ...props };
  ['x-line-number', 'x-file-name', 'x-id', 'x-component'].forEach(k => delete f[k]);
  return f;
};

const Statue = (props) => {
  const { position, label, color, isHighlighted, onClick } = filterProps(props);
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick && onClick(label); }}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.6, 1.6, 1]} />
        <meshLambertMaterial color={isHighlighted ? color : '#334155'} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshLambertMaterial color={isHighlighted ? color : '#475569'} />
      </mesh>
      <mesh position={[-0.2, 2.05, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={isHighlighted ? '#06b6d4' : '#1e293b'} />
      </mesh>
      <mesh position={[0.2, 2.05, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={isHighlighted ? '#06b6d4' : '#1e293b'} />
      </mesh>
      <mesh position={[0, 1.7, 0.55]}>
        <boxGeometry args={[0.4, 0.15, 0.05]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <Text position={[0, -0.2, 0.55]} fontSize={0.3} color="#e9d5ff" anchorX="center" anchorY="middle" fontWeight="bold">
        {label.toUpperCase()}
      </Text>
    </group>
  );
};

const Gong = (props) => {
  const { onClick, isPulsing } = filterProps(props);
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      const s = isPulsing ? 1 + Math.sin(state.clock.elapsedTime * 8) * 0.06 : 1;
      ringRef.current.scale.set(s, s, s);
    }
  });
  return (
    <group position={[0, 0.6, 2.5]} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.2, 0.12, 12, 32]} />
        <meshLambertMaterial color="#fbbf24" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshLambertMaterial color="#d97706" />
      </mesh>
      <mesh position={[-1.5, -0.3, 0]}>
        <boxGeometry args={[0.15, 1, 0.15]} />
        <meshLambertMaterial color="#312e81" />
      </mesh>
      <mesh position={[1.5, -0.3, 0]}>
        <boxGeometry args={[0.15, 1, 0.15]} />
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
        <cylinderGeometry args={[0.4, 0.4, 5, 12]} />
        <meshLambertMaterial color="#1e1b4b" />
      </mesh>
    ))}
    <mesh position={[0, 3, -7]}>
      <boxGeometry args={[16, 6, 0.4]} />
      <meshLambertMaterial color="#0f172a" />
    </mesh>
    <mesh position={[0, 0.01, 0]}>
      <boxGeometry args={[8, 0.02, 8]} />
      <meshLambertMaterial color="#312e81" />
    </mesh>
  </group>
);

const Game7Temple = ({ player, onFinish }) => {

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
  const [completedWordIndices, setCompletedWordIndices] = useState(new Set());

  const roundData = useMemo(() => LEVELS_ROUNDS[currentLevel - 1][roundIndex], [currentLevel, roundIndex]);
  const word = roundData.words[wordIndex];

  useEffect(() => {
    const startSession = async () => {
      setSessionStartTime(Date.now());
      try {
        const res = await api.post('/games/session/start', {
          player_id: player.id || player.patient_id || player.id_paciente,
          game_type: 'temple',
          game_number: 9,
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

  useEffect(() => {
    if (gameState !== 'playing' || phase !== 'listening') return;
    const tick = setInterval(() => {
      setCurrentSyllable(prev => (prev + 1) % word.syllables.length);
    }, SYLLABLE_BEAT_MS);
    return () => clearInterval(tick);
  }, [gameState, phase, word]);

  const loadNextWordOrRound = (newCompleted) => {
    const allIndices = roundData.words.map((_, i) => i);
    const next = allIndices.find(i => !newCompleted.has(i));

    if (next === undefined) {
      setTimeout(() => {
        if (roundIndex < 2) {
          setRoundIndex(r => r + 1);
          setCompletedWordIndices(new Set());
          setWordIndex(0);
          setCurrentSyllable(0);
          setPhase('listening');
          setFeedback(`¡Ronda ${roundIndex + 1} completada! 🌟`);
          setTimeout(() => setFeedback(''), 2000);
        } else {
          if (currentLevel < 10) {
            const nextLvl = currentLevel + 1;
            // Reset lives only up to level 5, then persist
            const newLives = nextLvl <= 5 ? 5 : lives;
            setCurrentLevel(nextLvl);
            setRoundIndex(0);
            setCompletedWordIndices(new Set());
            setWordIndex(0);
            setCurrentSyllable(0);
            setPhase('listening');
            setLives(newLives);
            setFeedback(`¡Nivel ${currentLevel} completado! 🚀 Nivel ${nextLvl}...`);
            setTimeout(() => setFeedback(''), 2500);
          } else {
            setGameState('won');
            finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 250, 10);
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
      setFeedback(`¡Capturado! Elige la estatua correcta`);
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setIncorrectCount(i => i + 1);
      setFeedback(`¡FALLO! La sílaba tónica era: "${word.syllables[word.tonicIndex]}"`);
      setTimeout(() => setFeedback(''), 2500);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) setGameState('lost');
        return next;
      });
      setTimeout(() => {
        setCurrentSyllable(0);
        setPhase('listening');
      }, 2700);
    }
  };

  const handleStatueClick = (statueType) => {
    if (gameState !== 'playing' || phase !== 'captured') return;
    if (statueType === word.type) {
      setCorrectCount(c => c + 1);
      playCorrectSound();
      setFeedback(`¡CORRECTO! "${word.word}" es ${word.type.toUpperCase()} ✅`);
      setTimeout(() => setFeedback(''), 2000);
      const newCompleted = new Set([...completedWordIndices, wordIndex]);
      setCompletedWordIndices(newCompleted);
      loadNextWordOrRound(newCompleted);
    } else {
      setIncorrectCount(i => i + 1);
      setFeedback(`¡FALLO! "${word.word}" es ${word.type.toUpperCase()}, no ${statueType}`);
      setTimeout(() => setFeedback(''), 2500);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) setGameState('lost');
        return next;
      });
      setTimeout(() => {
        setCurrentSyllable(0);
        setPhase('listening');
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

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(135deg, #0c0c2e 0%, #1a0a3e 30%, #0d1b2a 60%, #0a0a2e 100%)', overflow: 'hidden' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 11]} fov={55} />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 6, 0]} intensity={1} color="#fbbf24" />
          <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />
          <TempleScene />
          <Statue position={[-5, 0, -4]} label="Aguda" color="#ef4444" isHighlighted={phase === 'captured'} onClick={handleStatueClick} />
          <Statue position={[0, 0, -4.5]} label="Llana" color="#f59e0b" isHighlighted={phase === 'captured'} onClick={handleStatueClick} />
          <Statue position={[5, 0, -4]} label="Esdrujula" color="#10b981" isHighlighted={phase === 'captured'} onClick={handleStatueClick} />
          <Gong onClick={handleGongClick} isPulsing={gongPulse} />

          {phase === 'listening' && word.syllables.map((syl, i) => (
            <group key={i} position={[(i - (word.syllables.length - 1) / 2) * 1.25, 3.5, 2.5]}>
              <mesh>
                <boxGeometry args={[1.1, 0.7, 0.2]} />
                <meshLambertMaterial color={i === currentSyllable ? '#fbbf24' : '#e2e8f0'} />
              </mesh>
              <Text position={[0, 0, 0.12]} fontSize={0.35} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="bold">
                {syl}
              </Text>
            </group>
          ))}
          {phase === 'captured' && (
            <group position={[0, 3.5, 2.5]}>
              <mesh>
                <boxGeometry args={[word.word.length * 0.45 + 0.6, 0.9, 0.3]} />
                <meshLambertMaterial color="#10b981" />
              </mesh>
              <Text position={[0, 0, 0.16]} fontSize={0.45} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
                {word.word}
              </Text>
            </group>
          )}
        </Suspense>
      </Canvas>

      {/* HUD – top left */}
      <div className="absolute top-4 left-4 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl z-10">
        <div className="font-sans text-sm space-y-1.5">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">El Eco de las Sílabas</div>
          <div className="text-base font-extrabold text-purple-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-400" /> Nivel: {currentLevel} / 10
          </div>
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

      {/* Guide – top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-white shadow-xl max-w-sm text-center z-10">
        <div className="font-sans text-sm flex flex-col items-center">
          <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-purple-400" /> Guía del Templo
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-indigo-200 mt-1">
            <div>AGUDA:<br />última</div>
            <div>LLANA:<br />penúltima</div>
            <div>ESDRÚJULA:<br />antepenúltima</div>
          </div>
        </div>
      </div>

      {/* Help button */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="absolute top-4 right-28 p-2.5 bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-400/40 text-white rounded-xl transition-all duration-300 shadow-lg cursor-pointer z-10 flex items-center justify-center pointer-events-auto"
        title="¿Cómo jugar?"
      >
        <HelpCircle className="w-5 h-5 text-indigo-300" />
      </button>

      {/* Exit */}
      <button
        onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)}
        className="absolute top-4 right-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/10 cursor-pointer z-10 text-sm"
      >
        SALIR
      </button>

      {/* Gong button */}
      {phase === 'listening' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
          <button
            onClick={handleGongClick}
            className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl transition-all duration-200 shadow-2xl hover:scale-105 cursor-pointer flex items-center gap-2 text-lg uppercase"
          >
            <Bell className="w-5 h-5 text-slate-950 animate-bounce" /> Golpear Gong
          </button>
        </div>
      )}

      {/* Statue buttons */}
      {phase === 'captured' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-4 pointer-events-auto">
          <button onClick={() => handleStatueClick('aguda')} className="px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl cursor-pointer">
            AGUDA
          </button>
          <button onClick={() => handleStatueClick('llana')} className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl cursor-pointer">
            LLANA
          </button>
          <button onClick={() => handleStatueClick('esdrujula')} className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl hover:scale-105 transition-all shadow-xl cursor-pointer">
            ESDRÚJULA
          </button>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl z-20 text-white font-sans text-lg font-bold shadow-2xl text-center select-none animate-pulse">
          {feedback}
        </div>
      )}

      {/* Game Over */}
      {gameState === 'lost' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1c0d24] to-[#0a0512] border-2 border-red-500/40 rounded-3xl max-w-md w-full p-8 text-center text-white shadow-2xl font-sans">
            <Trophy className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-black text-rose-400 mb-2">¡JUEGO TERMINADO!</h2>
            <p className="text-sm text-gray-300 mb-6">Te has quedado sin vidas. ¡Buen intento!</p>
            <div className="bg-slate-900/60 border border-red-500/25 rounded-2xl p-4 mb-6 space-y-2.5 text-left text-xs">
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
              <div className="flex justify-between">
                <span className="text-gray-400">Errores:</span>
                <span className="font-bold text-rose-400">{incorrectCount}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={restart} className="py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase shadow-lg">
                Volver a Intentar
              </button>
              <button onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 100)} className="py-3 bg-slate-800 hover:bg-slate-700 text-gray-200 font-extrabold rounded-xl transition-all duration-300 cursor-pointer text-sm uppercase">
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Won */}
      {gameState === 'won' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#0e2417] to-[#040f09] border-2 border-emerald-500/40 rounded-3xl max-w-md w-full p-8 text-center text-white shadow-2xl font-sans">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-emerald-400 mb-2">¡MAESTRO DEL ECO!</h2>
            <p className="text-sm text-gray-300 mb-6">¡Completaste los 10 niveles dominando la acentuación!</p>
            <div className="bg-slate-900/60 border border-emerald-500/25 rounded-2xl p-4 mb-6 space-y-2.5 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Nivel final:</span>
                <span className="font-bold text-white">10 / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Respuestas correctas:</span>
                <span className="font-bold text-emerald-400">{correctCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Intentos incorrectos:</span>
                <span className="font-bold text-rose-400">{incorrectCount}</span>
              </div>
            </div>
            <button
              onClick={() => finishGame(correctCount, incorrectCount, correctCount + incorrectCount, correctCount * 250, 10)}
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
          <div className="bg-gradient-to-b from-[#131238] to-[#080a1c] border-2 border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative font-sans">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer">✕</button>
            <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-400 animate-pulse" /> ¿Cómo jugar al Templo de la Acentuación?
            </h3>
            <div className="space-y-4 text-sm text-gray-200">
              <p>Identifica el ritmo de la palabra golpeando el gong en la sílaba tónica (acentuada), luego clasifica la palabra.</p>
              <ul className="list-decimal list-inside space-y-1.5 pl-1 text-xs">
                <li>Observa la secuencia de sílabas iluminadas flotando sobre el gong.</li>
                <li>Haz clic en <b>"Golpear Gong"</b> cuando se ilumine la sílaba TÓNICA (la más fuerte).</li>
                <li>Selecciona la estatua correcta:
                  <ul className="list-disc list-inside pl-3 space-y-0.5 text-[11px] text-gray-300">
                    <li><b>AGUDA:</b> acento en la última sílaba (ej. CAFÉ).</li>
                    <li><b>LLANA:</b> acento en la penúltima sílaba (ej. CASA).</li>
                    <li><b>ESDRÚJULA:</b> acento en la antepenúltima sílaba (ej. MÚSICA).</li>
                  </ul>
                </li>
                <li>Tienes <b>5 vidas</b>. Se resetean hasta el nivel 5, luego persisten hasta el final.</li>
                <li>Completa 10 niveles (con 3 rondas y 5 palabras cada uno) para ganar.</li>
              </ul>
            </div>
            <button onClick={() => setShowHelpModal(false)} className="mt-5 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 cursor-pointer text-sm">
              ¡Entendido, a Jugar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game7Temple;
