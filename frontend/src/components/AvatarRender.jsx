import React from 'react';

export default function AvatarRender({ avatar, className = "w-24 h-24" }) {
  // Extract resource key from path (e.g. "/assets/avatar/ojos_felices.png" -> "ojos_felices")
  const getCleanKey = (val) => {
    if (!val) return val;
    if (typeof val === 'string' && (val.includes('/') || val.includes('.'))) {
      const parts = val.split('/');
      const filename = parts[parts.length - 1];
      return filename.replace(/\.[^/.]+$/, ""); // strip extension
    }
    return val;
  };

  // Use safe default parameters if avatar values are missing
  const rawAvatar = avatar || {};
  const color_piel = rawAvatar.color_piel || '#ffd8b3';
  const color_ojos = rawAvatar.color_ojos || '#4f46e5';
  const color_cabello = rawAvatar.color_cabello || '#1e1b4b';
  
  const getMappedRostro = (val) => {
    const key = getCleanKey(val);
    if (!key) return 'rostro_redondo';
    if (key.includes('ovalado') || key.includes('alargado') || key.includes('diamante') || key.includes('andromeda')) return 'rostro_ovalado';
    if (key.includes('cacheton') || key.includes('alien') || key.includes('robot') || key.includes('triangular') || key.includes('neon')) return 'rostro_cacheton';
    return 'rostro_redondo';
  };

  const getMappedOjos = (val) => {
    const key = getCleanKey(val);
    if (!key) return 'ojos_felices';
    if (key.includes('brillantes') || key.includes('laser') || key.includes('anime') || key.includes('creciente')) return 'ojos_brillantes';
    if (key.includes('guiño') || key.includes('gato') || key.includes('escaner') || key.includes('androide') || key.includes('holograficos')) return 'ojos_guiño';
    return 'ojos_felices';
  };

  const getMappedCabello = (val) => {
    const key = getCleanKey(val);
    if (!key) return 'cabello_corto';
    if (key.includes('rizado') || key.includes('afro') || key.includes('cyberpunk') || key.includes('gravedad')) return 'cabello_rizado';
    if (key.includes('coletas') || key.includes('cresta') || key.includes('trenzas')) return 'cabello_coletas';
    if (key.includes('largo') || key.includes('androide')) return 'cabello_largo';
    return 'cabello_corto';
  };

  const getMappedGorra = (val) => {
    const key = getCleanKey(val);
    if (!key) return null;
    if (key.includes('deportiva') || key.includes('minero') || key.includes('capitan') || key.includes('helice') || key.includes('visera') || key.includes('auriculares')) return 'gorra_deportiva';
    if (key.includes('lana') || key.includes('astronauta') || key.includes('boina') || key.includes('copa') || key.includes('antenas') || key.includes('panuelo') || key.includes('cyberpunk') || key.includes('diadema') || key.includes('samurai') || key.includes('rover')) return 'gorra_lana';
    if (key.includes('corona') || key.includes('rey') || key.includes('lunar') || key.includes('brujo') || key.includes('alien')) return 'corona_rey';
    return 'gorra_deportiva';
  };

  const getMappedLentes = (val) => {
    const key = getCleanKey(val);
    if (!key) return null;
    if (key.includes('redondos') || key.includes('monoculo') || key.includes('lectura') || key.includes('espejo') || key.includes('rejilla')) return 'lentes_redondos';
    if (key.includes('estrella') || key.includes('tactico') || key.includes('corazon') || key.includes('antifaz') || key.includes('hud') || key.includes('cat_eye')) return 'lentes_estrella';
    if (key.includes('sol') || key.includes('visor') || key.includes('vr') || key.includes('aviador') || key.includes('cientifico') || key.includes('proteccion') || key.includes('envolventes')) return 'lentes_sol';
    return 'lentes_redondos';
  };

  const rostro_recurso = getMappedRostro(rawAvatar.rostro_recurso || 'rostro_redondo');
  const ojos_recurso = getMappedOjos(rawAvatar.ojos_recurso || 'ojos_felices');
  const cabello_recurso = getMappedCabello(rawAvatar.cabello_recurso || 'cabello_corto');
  const gorra_recurso = getMappedGorra(rawAvatar.gorra_recurso || null);
  const lentes_recurso = getMappedLentes(rawAvatar.lentes_recurso || null);

  // Simple Javascript helper to calculate darker/lighter volumetric lighting shadows dynamically
  const adjustColor = (hex, percent) => {
    try {
      let num = parseInt(hex.replace("#",""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) + amt,
          G = (num >> 8 & 0x00FF) + amt,
          B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
    } catch(e) {
      return hex;
    }
  };

  // Generate unique IDs for SVG defs to avoid collisions when rendering multiple avatars
  const skinHash = color_piel.replace('#', '');
  const eyesHash = color_ojos.replace('#', '');
  const hairHash = color_cabello.replace('#', '');

  const pielGradId = `piel3d-${skinHash}`;
  const eyesGradId = `ojos3d-${eyesHash}`;
  const hairGradId = `cabello3d-${hairHash}`;
  const mouthGradId = `mouth3d`;

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`${className} select-none`}
      style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.35))' }}
    >
      <defs>
        {/* 3D Directional/Specular lighting gradients */}
        <radialGradient id={pielGradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="35%" stopColor={color_piel} />
          <stop offset="85%" stopColor={adjustColor(color_piel, -22)} />
          <stop offset="100%" stopColor={adjustColor(color_piel, -40)} />
        </radialGradient>

        <radialGradient id={eyesGradId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="30%" stopColor={color_ojos} />
          <stop offset="80%" stopColor={adjustColor(color_ojos, -35)} />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        <radialGradient id={hairGradId} cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor={adjustColor(color_cabello, 25)} />
          <stop offset="40%" stopColor={color_cabello} />
          <stop offset="90%" stopColor={adjustColor(color_cabello, -25)} />
          <stop offset="100%" stopColor="#080710" />
        </radialGradient>

        <linearGradient id={mouthGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2e0524" />
          <stop offset="100%" stopColor="#580816" />
        </linearGradient>

        {/* Filters for 3D cast shadows (depth layer separation) */}
        <filter id="3dCastShadow" x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="6" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>

        <filter id="accessoryShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>

        <filter id="noseShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
        </filter>

        {/* Glossy gradient for glasses reflection */}
        <linearGradient id="glassesGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
        </linearGradient>

        {/* Dynamic 3D Spherical Cap/Beanie/Crown Gradients */}
        <radialGradient id="gorraRedGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ff8a8a" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>

        <radialGradient id="gorraBlueGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="80%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>

        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="85%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>

      {/* Decorative Glow Ring representing Space Atmosphere */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(167, 139, 250, 0.18)" strokeWidth="1.5" strokeDasharray="6 4" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(167, 139, 250, 0.08)" strokeWidth="4" />

      {/* 1. LAYER: LONG HAIR BACK (Cast volumetric depth) */}
      {cabello_recurso === 'cabello_largo' && (
        <g style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.6))' }}>
          <path 
            d="M 46,80 L 40,165 C 40,165 96,182 160,165 L 154,80 Z" 
            fill={`url(#${hairGradId})`} 
            stroke={adjustColor(color_cabello, -40)} 
            strokeWidth="2.5" 
          />
        </g>
      )}

      {/* 2. LAYER: ROSTRO & OREJAS SILHOUETTE (3D VOLUMETRIC FACE & EARS WITH SPECULAR GLOW) */}
      <g style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.6))' }}>
        {/* Volumetric Ears with internal light shadows */}
        <circle cx="44" cy="105" r="11" fill={`url(#${pielGradId})`} stroke={adjustColor(color_piel, -35)} strokeWidth="2.5" />
        <circle cx="44" cy="105" r="5" fill={adjustColor(color_piel, -20)} opacity="0.6" />

        <circle cx="156" cy="105" r="11" fill={`url(#${pielGradId})`} stroke={adjustColor(color_piel, -35)} strokeWidth="2.5" />
        <circle cx="156" cy="105" r="5" fill={adjustColor(color_piel, -20)} opacity="0.6" />

        {rostro_recurso === 'rostro_ovalado' ? (
          <ellipse 
            cx="100" 
            cy="105" 
            rx="52" 
            ry="64" 
            fill={`url(#${pielGradId})`} 
            stroke={adjustColor(color_piel, -35)} 
            strokeWidth="3.5" 
          />
        ) : rostro_recurso === 'rostro_cacheton' ? (
          <g>
            <path 
              d="M 48,105 C 48,68 62,45 100,45 C 138,45 152,68 152,105 C 152,142 128,158 100,158 C 72,158 48,142 48,105 Z" 
              fill={`url(#${pielGradId})`} 
              stroke={adjustColor(color_piel, -35)} 
              strokeWidth="3.5" 
            />
            {/* 3D Soft Blush spheres */}
            <circle cx="68" cy="122" r="9" fill="#f43f5e" opacity="0.3" />
            <circle cx="132" cy="122" r="9" fill="#f43f5e" opacity="0.3" />
          </g>
        ) : (
          // rostro_redondo (default)
          <circle 
            cx="100" 
            cy="105" 
            r="56" 
            fill={`url(#${pielGradId})`} 
            stroke={adjustColor(color_piel, -35)} 
            strokeWidth="3.5" 
          />
        )}

        {/* Volumetric smiling mouth cavity & tongue */}
        <g>
          {/* Mouth Cavity */}
          <path 
            d="M 85,124 Q 100,140 115,124 Q 100,121 85,124 Z" 
            fill="url(#mouth3d)" 
            stroke={adjustColor(color_piel, -50)} 
            strokeWidth="2" 
          />
          {/* Volumetric Cute Pink Tongue */}
          <path 
            d="M 92,130 Q 100,126 108,130 Q 100,140 92,130 Z" 
            fill="#fb7185" 
          />
        </g>

        {/* Volumetric 3D Nose with cast shadow */}
        <path 
          d="M 97,112 Q 100,107 103,112" 
          fill="none" 
          stroke={adjustColor(color_piel, -45)} 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          filter="url(#noseShadow)"
        />
      </g>

      {/* 3. LAYER: OJOS & EYEBROWS (3D GLOSSY SPHERES WITH SPECULAR LIGHT HIGHLIGHTS) */}
      <g style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.5))' }}>
        {ojos_recurso === 'ojos_brillantes' ? (
          <g>
            {/* Left Eye */}
            <circle cx="78" cy="98" r="13" fill={`url(#${eyesGradId})`} />
            <circle cx="74" cy="94" r="5" fill="#ffffff" />
            <circle cx="82" cy="102" r="2.5" fill="#ffffff" />
            <path d="M 68,89 Q 78,85 88,89" fill="none" stroke="#000" strokeWidth="1" opacity="0.3" />
            {/* Right Eye */}
            <circle cx="122" cy="98" r="13" fill={`url(#${eyesGradId})`} />
            <circle cx="118" cy="94" r="5" fill="#ffffff" />
            <circle cx="126" cy="102" r="2.5" fill="#ffffff" />
            <path d="M 112,89 Q 122,85 132,89" fill="none" stroke="#000" strokeWidth="1" opacity="0.3" />
          </g>
        ) : ojos_recurso === 'ojos_guiño' ? (
          <g>
            {/* Left Eye (Normal 3D Sphere) */}
            <circle cx="78" cy="98" r="11" fill={`url(#${eyesGradId})`} />
            <circle cx="75" cy="95" r="4.2" fill="#ffffff" />
            <circle cx="81" cy="101" r="2" fill="#ffffff" />
            {/* Right Eye (3D Volumetric Winking Path) */}
            <path 
              d="M 112,98 Q 122,85 132,98" 
              fill="none" 
              stroke={color_ojos} 
              strokeWidth="5" 
              strokeLinecap="round" 
              filter="url(#noseShadow)"
            />
          </g>
        ) : (
          // ojos_felices (default 3D Spheres)
          <g>
            {/* Left Eye */}
            <circle cx="78" cy="98" r="11" fill={`url(#${eyesGradId})`} />
            <circle cx="75" cy="95" r="4.2" fill="#ffffff" />
            <circle cx="81" cy="101" r="2" fill="#ffffff" />
            {/* Right Eye */}
            <circle cx="122" cy="98" r="11" fill={`url(#${eyesGradId})`} />
            <circle cx="119" cy="95" r="4.2" fill="#ffffff" />
            <circle cx="125" cy="101" r="2" fill="#ffffff" />
          </g>
        )}

        {/* 3D Styled Eyebrows */}
        <path d="M 66,82 Q 78,76 88,82" fill="none" stroke={adjustColor(color_cabello, -15)} strokeWidth="3" strokeLinecap="round" />
        <path d="M 112,82 Q 122,76 134,82" fill="none" stroke={adjustColor(color_cabello, -15)} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* 4. LAYER: CABELLO FRONT (HAIR STYLE WITH LIGHTING RELIEF & DEEP CAST SHADOW) */}
      <g style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.6))' }}>
        {cabello_recurso === 'cabello_rizado' ? (
          <g fill={`url(#${hairGradId})`} stroke={adjustColor(color_cabello, -35)} strokeWidth="2.5">
            {/* Layered Spherical Bubble Curls */}
            <circle cx="66" cy="56" r="22" />
            <circle cx="90" cy="45" r="24" />
            <circle cx="114" cy="45" r="24" />
            <circle cx="134" cy="56" r="22" />
            <circle cx="48" cy="72" r="17" />
            <circle cx="152" cy="72" r="17" />
          </g>
        ) : cabello_recurso === 'cabello_coletas' ? (
          <g fill={`url(#${hairGradId})`} stroke={adjustColor(color_cabello, -35)} strokeWidth="2">
            {/* 3D Buns/Coletas */}
            <circle cx="44" cy="50" r="20" />
            <circle cx="156" cy="50" r="20" />
            {/* Volumetric Front Bangs */}
            <path d="M 44,72 C 60,54 85,42 100,54 C 115,42 140,54 156,72 C 145,50 120,40 100,42 C 80,40 55,50 44,72 Z" strokeWidth="2.5" />
          </g>
        ) : cabello_recurso === 'cabello_largo' ? (
          <g fill={`url(#${hairGradId})`} stroke={adjustColor(color_cabello, -35)} strokeWidth="2">
            {/* Volumetric Bangs framing forehead */}
            <path d="M 44,72 C 60,54 85,42 100,54 C 115,42 140,54 156,72 C 145,50 120,40 100,42 C 80,40 55,50 44,72 Z" strokeWidth="2.5" />
          </g>
        ) : (
          // cabello_corto (default cosmic spikes)
          <path 
            d="M 46,68 C 34,26 62,34 62,34 C 62,34 78,12 96,32 C 96,32 116,8 132,32 C 132,32 152,18 154,68 Z" 
            fill={`url(#${hairGradId})`} 
            stroke={adjustColor(color_cabello, -35)} 
            strokeWidth="2.5" 
            strokeLinejoin="round"
          />
        )}
      </g>

      {/* 5. LAYER: LENTES (3D GLASSES WITH GLOSSY REFLECTIONS & DEEP SHADOW) */}
      {lentes_recurso && (
        <g style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.6))' }}>
          {lentes_recurso === 'lentes_redondos' ? (
            <g>
              {/* Glass Lenses Glow */}
              <circle cx="78" cy="98" r="17" fill="url(#glassesGlow)" />
              <circle cx="122" cy="98" r="17" fill="url(#glassesGlow)" />
              {/* Volumetric Thick Circular Frames */}
              <circle cx="78" cy="98" r="17" fill="none" stroke="#1e293b" strokeWidth="4.5" />
              <circle cx="122" cy="98" r="17" fill="none" stroke="#1e293b" strokeWidth="4.5" />
              {/* Frame Highlights */}
              <circle cx="78" cy="98" r="17" fill="none" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="122" cy="98" r="17" fill="none" stroke="#64748b" strokeWidth="1.5" />
              {/* Connections */}
              <path d="M 95,98 L 105,98" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 61,98 L 48,100" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 139,98 L 152,100" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          ) : lentes_recurso === 'lentes_estrella' ? (
            <g>
              {/* Star Left Glass */}
              <polygon points="78,75 83,86 95,87 86,95 88,107 78,100 68,107 70,95 61,87 73,86" fill="url(#glassesGlow)" stroke="#f43f5e" strokeWidth="4" strokeLinejoin="round" />
              {/* Star Right Glass */}
              <polygon points="122,75 127,86 139,87 130,95 132,107 122,100 112,107 114,95 105,87 117,86" fill="url(#glassesGlow)" stroke="#f43f5e" strokeWidth="4" strokeLinejoin="round" />
              {/* Connection */}
              <path d="M 95,87 Q 100,85 105,87" fill="none" stroke="#f43f5e" strokeWidth="4" />
            </g>
          ) : lentes_recurso === 'lentes_sol' ? (
            <g>
              {/* Dark Sunglasses with realistic volumetric transparency gradient */}
              <path d="M 58,90 Q 78,82 93,90 L 93,107 Q 78,121 58,107 Z" fill="rgba(15, 23, 42, 0.93)" stroke="#020617" strokeWidth="4.5" strokeLinejoin="round" />
              <path d="M 107,90 Q 126,82 142,90 L 142,107 Q 126,121 107,107 Z" fill="rgba(15, 23, 42, 0.93)" stroke="#020617" strokeWidth="4.5" strokeLinejoin="round" />
              {/* Bridge */}
              <path d="M 93,95 L 107,95" stroke="#020617" strokeWidth="6" strokeLinecap="round" />
              {/* Glass glare highlight stripes */}
              <path d="M 62,94 L 75,108" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
              <path d="M 111,94 L 124,108" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : null}
        </g>
      )}

      {/* 6. LAYER: GORRA (3D SHINY HATS CASTING SHADOWS) */}
      {gorra_recurso && (
        <g style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.6))' }}>
          {gorra_recurso === 'gorra_deportiva' ? (
            <g>
              {/* Cap Base with 3D spherical gradient */}
              <path d="M 48,68 C 45,26 155,26 152,68 Z" fill="url(#gorraRedGrad)" />
              {/* Cap sports gradient overlay */}
              <path d="M 48,68 C 45,26 155,26 152,68 Z" fill="none" stroke="#b91c1c" strokeWidth="2" />
              {/* Cap Brim (Visera) with highlighted bevel */}
              <path d="M 46,63 C 46,63 100,81 154,63 C 154,63 164,84 142,84 C 102,84 46,84 46,63" fill="#dc2626" stroke="#991b1b" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Top Yellow Button */}
              <circle cx="100" cy="35" r="5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
            </g>
          ) : gorra_recurso === 'gorra_lana' ? (
            <g>
              {/* Beanie 3D body */}
              <path d="M 48,68 C 34,22 166,22 152,68 Z" fill="url(#gorraBlueGrad)" />
              <path d="M 48,68 C 34,22 166,22 152,68 Z" fill="none" stroke="#1d4ed8" strokeWidth="2" />
              {/* Knit lines texture simulation */}
              <path d="M 75,32 Q 78,55 78,68" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none" />
              <path d="M 100,28 Q 100,52 100,68" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none" />
              <path d="M 125,32 Q 122,55 122,68" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none" />
              {/* Beanie Fold (Doblez) with highlighted thickness */}
              <rect x="42" y="60" width="116" height="12" rx="6" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
              {/* Top White Fluffy Pom-Pom */}
              <circle cx="100" cy="18" r="11" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="96" cy="15" r="3" fill="#ffffff" />
            </g>
          ) : gorra_recurso === 'corona_rey' ? (
            <g fill="#facc15" stroke="#d97706" strokeWidth="2.5" strokeLinejoin="round">
              {/* Volumetric Shining Crown */}
              <polygon points="44,65 50,22 76,43 100,12 124,43 150,22 156,65" fill="url(#crownGrad)" />
              {/* Crown Base Bevel */}
              <rect x="42" y="58" width="116" height="8" rx="2" fill="#ca8a04" stroke="none" />
              {/* Spherical Ruby & Sapphire Jewels */}
              <circle cx="50" cy="22" r="5" fill="#f43f5e" stroke="none" />
              <circle cx="100" cy="12" r="5" fill="#3b82f6" stroke="none" />
              <circle cx="150" cy="22" r="5" fill="#f43f5e" stroke="none" />
              <circle cx="76" cy="62" r="2.5" fill="#ef4444" stroke="none" />
              <circle cx="100" cy="62" r="2.5" fill="#3b82f6" stroke="none" />
              <circle cx="124" cy="62" r="2.5" fill="#ef4444" stroke="none" />
            </g>
          ) : null}
        </g>
      )}
    </svg>
  );
}
