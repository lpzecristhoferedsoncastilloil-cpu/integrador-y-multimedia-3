// ============================================================
// pages/games/RocketBuilder.jsx — Constructor de Cohetes
// Juego 1: Dislexia Fonológica
// El jugador arma palabras con sílabas correctas
// Niveles 1-10 con dificultad progresiva
// Usa Phaser para animaciones y sonidos
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import API from '../../services/api';

// ---- Palabras por nivel (DEFAULTS — se usan si el jugador no tiene config personalizada) ----
const DEFAULT_LEVELS = {
  1:  { words:[['CA','SA'],['ME','SA'],['PA','TO'],['SO','FA'],['LU','NA']], distractors:0, label:'Palabras simples' },
  2:  { words:[['CA','MA'],['PI','SO'],['BO','CA'],['MA','NO'],['PE','LO']], distractors:0, label:'Palabras simples' },
  3:  { words:[['CA','SA'],['ME','SA'],['PA','TO']], distractors:2, label:'Con distractores' },
  4:  { words:[['CO','MI','DA'],['PA','LA','BRA'],['VEN','TA','NA']], distractors:2, label:'Con distractores' },
  5:  { words:[['MU','ÑE','CA'],['CA','BA','LLO'],['PA','RA','GUA']], distractors:3, label:'Con distractores' },
  6:  { words:[['BRU','JA'],['TRE','NE'],['FLO','RES'],['PRUE','BA']], distractors:2, label:'Sílabas complejas' },
  7:  { words:[['BLAN','CO'],['PREN','DA'],['TRANS','TE'],['FRES','CO']], distractors:3, label:'Sílabas complejas' },
  8:  { words:[['MA','LU','CO'],['BI','FO','TE'],['SA','PU','LI']], distractors:3, label:'Pseudopalabras' },
  9:  { words:[['TRE','LU','PA'],['MO','CA','BI'],['FI','SA','TU']], distractors:4, label:'Pseudopalabras' },
  10: { words:[['CA','SA'],['ME','SA'],['PA','TO']], distractors:0, label:'¡Reconocimiento por voz!', voice:true },
};

const DISTRACTOR_SYLLABLES = ['TA','BI','RO','FU','ZE','KI','WA','NU','PO','GI','XA','YU'];

export default function RocketBuilder({ player, onFinish }) {
  const gameRef   = useRef(null);
  const phaserRef = useRef(null);
  const [levels, setLevels]   = useState(DEFAULT_LEVELS);
  const [level, setLevel]     = useState(1);
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentWordText, setCurrentWordText] = useState('');
  const [currentWordImage, setCurrentWordImage] = useState(null);
  const [currentWordHint, setCurrentWordHint] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState([]);
  const [availableSyllables, setAvailableSyllables] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalClicks, setTotalClicks] = useState(0);

  // Cargar config personalizada del jugador y luego iniciar sesión
  useEffect(() => {
    const init = async () => {
      try {
        const res = await API.get(`/games/config/${player.id}/rocket_builder`);
        const customData = res.data;
        if (customData && typeof customData === 'object' && Object.keys(customData).length > 0) {
          // Mezclar defaults con config personalizada del jugador
          const merged = { ...DEFAULT_LEVELS };
          Object.entries(customData).forEach(([lvl, cfg]) => {
            const levelNum = parseInt(lvl);
            const defaultLevel = DEFAULT_LEVELS[levelNum] || {};
            merged[levelNum] = {
              words: cfg.words || defaultLevel.words || [],
              distractors: cfg.distractors !== undefined ? cfg.distractors : (defaultLevel.distractors || 0),
              label: cfg.label || defaultLevel.label || `Nivel ${levelNum}`,
              voice: cfg.voice !== undefined ? cfg.voice : (defaultLevel.voice || false),
            };
          });
          console.log('[RocketBuilder] Config personalizada cargada:', Object.keys(customData).length, 'niveles personalizados');
          setLevels(merged);
        } else {
          console.log('[RocketBuilder] Sin config personalizada, usando defaults');
        }
      } catch (e) {
        console.log('[RocketBuilder] Error cargando config, usando defaults:', e.message);
      }
      startSession();
    };
    init();
  }, [player.id]);

  // Cargar palabra cuando cambia nivel, índice, o los niveles se actualizan (config personalizada)
  useEffect(() => {
    if (!gameOver) loadWord();
  }, [level, wordIndex, levels]);

  const startSession = async () => {
    setSessionStartTime(Date.now());
    try {
      const res = await API.post('/games/session/start', {
        player_id: player.id,
        game_type: 'fonologica',
        game_number: 1,
        level: 1,
      });
      setSessionId(res.data.id);
    } catch (e) { console.error('Error iniciando sesión de juego'); }
  };

  const loadWord = () => {
    const levelData = levels[level];
    if (!levelData) return;
    if (wordIndex >= levelData.words.length) {
      setLevelComplete(true);
      return;
    }
    const rawWord = levelData.words[wordIndex];
    let syllables = [];
    let fullWord = '';
    let distractors = [];
    let image = null;
    let hint = null;

    if (Array.isArray(rawWord)) {
      syllables = rawWord;
      fullWord = rawWord.join('');
      const numDistractors = levelData.distractors || 0;
      distractors = DISTRACTOR_SYLLABLES
        .filter(s => !syllables.includes(s))
        .sort(() => Math.random() - 0.5)
        .slice(0, numDistractors);
    } else if (rawWord && typeof rawWord === 'object') {
      syllables = rawWord.syllables || [];
      fullWord = rawWord.word || syllables.join('');
      
      if (Array.isArray(rawWord.distractors) && rawWord.distractors.length > 0) {
        distractors = rawWord.distractors;
      } else {
        const customDistList = typeof rawWord.distractors === 'string'
          ? rawWord.distractors.split(',').map(d => d.trim()).filter(d => d !== '')
          : [];
        if (customDistList.length > 0) {
          distractors = customDistList;
        } else {
          const numDistractors = levelData.distractors || 0;
          distractors = DISTRACTOR_SYLLABLES
            .filter(s => !syllables.includes(s))
            .sort(() => Math.random() - 0.5)
            .slice(0, numDistractors);
        }
      }
      image = rawWord.image || null;
      hint = rawWord.hint || null;
    }

    setCurrentWord(syllables);
    setCurrentWordText(fullWord);
    setCurrentWordImage(image);
    setCurrentWordHint(hint);
    setSelectedSyllables([]);
    setStartTime(Date.now());

    if (levelData.voice) {
      setVoiceMode(true);
      setAvailableSyllables([]);
    } else {
      setVoiceMode(false);
      const all = [...syllables, ...distractors].sort(() => Math.random() - 0.5);
      setAvailableSyllables(all);
    }
  };

  const handleSyllableClick = (syllable, idx) => {
    setTotalClicks(c => c + 1);
    if (selectedSyllables.includes(syllable + '_' + idx)) return;
    const newSelected = [...selectedSyllables, syllable + '_' + idx];
    setSelectedSyllables(newSelected);

    if (newSelected.length === currentWord.length) {
      const formed = newSelected.map(s => s.split('_')[0]).join('');
      const correct = currentWordText;
      const reactionTime = Date.now() - startTime;
      checkAnswer(formed, correct, reactionTime);
    }
  };

  const handleRemoveSyllable = (idx) => {
    setSelectedSyllables(prev => prev.filter((_,i) => i !== idx));
  };

  const checkAnswer = async (formed, correct, reactionTime) => {
    const isCorrect = formed === correct;
    const attempt = {
      word_shown: correct,
      answer_given: formed,
      is_correct: isCorrect,
      reaction_time_ms: reactionTime,
      error_type: isCorrect ? null : 'phonological',
      num_clicks: totalClicks,
      attempt_number: 1,
    };

    setAttempts(prev => [...prev, attempt]);

    // Guardar en backend
    if (sessionId) {
      try {
        await API.post('/games/attempt', { session_id: sessionId, ...attempt });
      } catch (e) { console.error(e); }
    }

    if (isCorrect) {
      setFeedback({ text: '¡Correcto! 🚀', ok: true });
      setScore(s => s + (10 * level));
      // Animación de cohete
      launchRocket();
    } else {
      setFeedback({ text: `Incorrecto 😔 Era: ${correct}`, ok: false });
      setLives(l => {
        if (l - 1 <= 0) { setGameOver(true); return 0; }
        return l - 1;
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedSyllables([]);
      setTotalClicks(0);
      setWordIndex(i => i + 1);
    }, 1500);
  };

  // Reconocimiento de voz (nivel 10)
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome.');
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
      const result = event.results[0][0];
      const transcript = result.transcript.toUpperCase().trim();
      const confidence = result.confidence;
      const correct = currentWordText;
      const reactionTime = Date.now() - startTime;

      // Guardar datos de voz
      if (sessionId) {
        try {
          const attRes = await API.post('/games/attempt', {
            session_id: sessionId,
            word_shown: correct,
            answer_given: transcript,
            is_correct: confidence >= 0.8 && transcript.includes(correct),
            reaction_time_ms: reactionTime,
            num_clicks: 0,
            attempt_number: 1,
          });
          await API.post('/games/voice', {
            attempt_id: attRes.data.id,
            confidence,
            num_attempts: 1,
            silence_time_ms: 0,
            recognized_text: transcript,
          });
        } catch (e) { console.error(e); }
      }

      setListening(false);
      if (confidence >= 0.8 && transcript.includes(correct)) {
        setFeedback({ text: `¡Perfecto! Dijiste: "${transcript}" 🎤`, ok: true });
        setScore(s => s + 20);
        launchRocket();
      } else {
        setFeedback({ text: `Escuché: "${transcript}" (confianza: ${Math.round(confidence*100)}%)`, ok: false });
        setLives(l => {
          if (l - 1 <= 0) { setGameOver(true); return 0; }
          return l - 1;
        });
      }
      setTimeout(() => { setFeedback(null); setWordIndex(i => i + 1); }, 2000);
    };

    recognition.onerror = () => { setListening(false); setFeedback({ text: 'Error de micrófono', ok: false }); };
  };

  // Animación del cohete con Phaser
  const launchRocket = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene.getScene('RocketScene');
      if (scene) scene.launchRocket();
    }
  };

  const handleNextLevel = () => {
    if (level >= 10) {
      finishGame();
      return;
    }
    setLevel(l => l + 1);
    setWordIndex(0);
    setLevelComplete(false);
    setSelectedSyllables([]);
  };

  const finishGame = async () => {
    if (sessionId) {
      try {
        await API.put(`/games/session/${sessionId}/complete`, {
          total_time_seconds: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0,
          final_score: score,
        });
      } catch (e) { console.error(e); }
    }
    onFinish({ score, level, attempts });
  };

  // Inicializar Phaser
  useEffect(() => {
    if (!gameRef.current || phaserRef.current) return;

    class RocketScene extends Phaser.Scene {
      constructor() { super({ key: 'RocketScene' }); }

      create() {
        this.cameras.main.setBackgroundColor('#0a0a2e');

        // Estrellas de fondo
        for (let i = 0; i < 160; i++) {
          const x = Phaser.Math.Between(0, 1200);
          const y = Phaser.Math.Between(0, 350);
          const star = this.add.circle(x, y, Phaser.Math.Between(1,3), 0xffffff, Phaser.Math.FloatBetween(0.3,1));
          this.tweens.add({ targets: star, alpha: 0.1, duration: Phaser.Math.Between(800,2000), yoyo:true, repeat:-1 });
        }

        // Cohete
        this.rocket = this.add.text(600, 270, '🚀', { fontSize:'72px' }).setOrigin(0.5);

        // Nubes/planetas decorativos
        this.add.text(150,  60, '🌙', { fontSize:'42px' });
        this.add.text(1000, 120, '⭐', { fontSize:'32px' });
        this.add.text(380,  50, '🪐', { fontSize:'52px' });
        this.add.text(850,  80, '🛸', { fontSize:'42px' });

        // Partículas de fuego (simuladas con texto)
        this.flames = [];
        for (let i = 0; i < 5; i++) {
          const f = this.add.text(600, 300, ['🔥','✨','💫'][i%3], { fontSize:'28px' }).setOrigin(0.5).setAlpha(0);
          this.flames.push(f);
        }
      }

      launchRocket() {
        // Animación de lanzamiento
        this.tweens.add({
          targets: this.rocket,
          y: -100,
          x: Phaser.Math.Between(450, 750),
          duration: 1400,
          ease: 'Power2',
          onComplete: () => {
            this.rocket.setPosition(600, 270);
            this.tweens.add({ targets: this.rocket, alpha: 1, duration: 300 });
          }
        });

        // Llamas
        this.flames.forEach((f, i) => {
          f.setPosition(600 + Phaser.Math.Between(-35,35), 310);
          this.tweens.add({
            targets: f, alpha: 1, y: f.y + 50, duration: 400,
            delay: i * 80, yoyo: true,
            onComplete: () => f.setAlpha(0)
          });
        });

        // Sonido (beep con AudioContext)
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(523, ctx.currentTime);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {}
      }
    }

    phaserRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: 1200,
      height: 350,
      parent: gameRef.current,
      backgroundColor: '#0a0a2e',
      scene: RocketScene,
      audio: { disableWebAudio: false },
    });

    return () => {
      if (phaserRef.current) { phaserRef.current.destroy(true); phaserRef.current = null; }
    };
  }, []);

  // ---- Pantalla Game Over ----
  if (gameOver) {
    return (
      <div style={styles.overlay}>
        <div style={styles.endCard}>
          <div style={{fontSize:'64px'}}>💥</div>
          <h2 style={{color:'#dc2626'}}>¡Se acabaron las vidas!</h2>
          <p style={styles.scoreText}>Puntaje final: <strong>{score}</strong></p>
          <p style={styles.scoreText}>Llegaste al nivel: <strong>{level}</strong></p>
          <button onClick={finishGame} style={styles.btnEnd}>Ver Resultados</button>
        </div>
      </div>
    );
  }

  // ---- Pantalla Nivel Completado ----
  if (levelComplete) {
    return (
      <div style={styles.overlay}>
        <div style={styles.endCard}>
          <div style={{fontSize:'64px'}}>🎉</div>
          <h2 style={{color:'#059669'}}>¡Nivel {level} completado!</h2>
          <p style={styles.scoreText}>Puntaje: <strong>{score}</strong></p>
          {level < 10
            ? <button onClick={handleNextLevel} style={styles.btnEnd}>Nivel {level+1} →</button>
            : <button onClick={finishGame} style={styles.btnEnd}>🏆 ¡Juego Completado!</button>
          }
        </div>
      </div>
    );
  }

  const levelData = levels[level];

  return (
    <div style={styles.gameWrapper}>
      {/* Canvas de Phaser de fondo */}
      <div ref={gameRef} style={styles.phaserCanvasContainer} />

      {/* Contenedor del juego encima */}
      <div style={styles.gameContent}>
        {/* HUD superior */}
        <div style={styles.hud}>
          <div style={styles.hudItem}>
            <span style={styles.hudLabel}>Nivel</span>
            <span style={styles.hudValue}>{level}/10</span>
          </div>
          <div style={styles.hudItem}>
            <span style={styles.hudLabel}>Puntaje</span>
            <span style={styles.hudValue}>{score}</span>
          </div>
          <div style={styles.hudItem}>
            <span style={styles.hudLabel}>Vidas</span>
            <span style={styles.hudValue}>{'❤️'.repeat(lives)}</span>
          </div>
          <div style={styles.hudItem}>
            <span style={styles.hudLabel}>Tipo</span>
            <span style={styles.hudValueSmall}>{levelData?.label}</span>
          </div>
          <button onClick={finishGame} style={styles.btnExit}>
            🚪 Salir del Juego
          </button>
        </div>

        {/* Área del juego */}
        <div style={styles.gameArea}>
          {/* Espaciador para no tapar el cohete en el fondo */}
          <div style={{ flex: 1, minHeight: currentWordImage ? '30px' : '100px' }} />

          {/* Instrucción */}
          <p style={styles.instruction}>
            {voiceMode ? '🎤 Di la palabra en voz alta' : '🚀 Toca las sílabas en el orden correcto para formar la palabra'}
          </p>

          {/* Imagen de la palabra y Pista */}
          {(currentWordImage || currentWordHint) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 12 }}>
              {currentWordImage && (
                <img src={currentWordImage} alt={currentWordText} style={styles.wordImage} />
              )}
              {currentWordHint && (
                <div style={styles.hintBubble}>
                  💡 Pista: {currentWordHint}
                </div>
              )}
            </div>
          )}

          {/* Palabra a formar (slots) */}
          {currentWord && (
            <div style={styles.wordSlots}>
              {currentWord.map((_, i) => (
                <div key={i} style={selectedSyllables[i]
                  ? {...styles.slot, ...styles.slotFilled}
                  : styles.slot}
                  onClick={() => selectedSyllables[i] && handleRemoveSyllable(i)}>
                  {selectedSyllables[i] ? selectedSyllables[i].split('_')[0] : '?'}
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{...styles.feedback, background: feedback.ok ? '#d1fae5' : '#fee2e2', color: feedback.ok ? '#065f46' : '#dc2626'}}>
              {feedback.text}
            </div>
          )}

          {/* Sílabas disponibles */}
          {!voiceMode && availableSyllables.length > 0 && (
            <div style={styles.syllables}>
              {availableSyllables.map((s, i) => {
                const isUsed = selectedSyllables.some(sel => sel === s + '_' + i);
                return (
                  <button key={i} onClick={() => !isUsed && handleSyllableClick(s, i)}
                    style={{...styles.syllableBtn, opacity: isUsed ? 0.3 : 1, transform: isUsed ? 'scale(0.9)' : 'scale(1)'}}>
                    {s}
                  </button>
                );
              })}
            </div>
          )}

          {/* Botón de voz (nivel 10) */}
          {voiceMode && (
            <button onClick={startVoiceRecognition} disabled={listening}
              style={{...styles.voiceBtn, background: listening ? '#dc2626' : '#1a56db'}}>
              {listening ? '🎤 Escuchando...' : '🎤 Hablar'}
            </button>
          )}

          {/* Progreso de palabras */}
          <div style={styles.progress}>
            Palabra {Math.min(wordIndex + 1, levelData?.words.length || 1)} de {levelData?.words.length || 1}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  gameWrapper: { 
    position: 'relative',
    display: 'flex', 
    flexDirection: 'column', 
    width: '100%', 
    height: '100%', 
    background: '#0a0a2e', 
    borderRadius: '0px', 
    overflow: 'hidden'
  },
  phaserCanvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden'
  },
  gameContent: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent'
  },
  hud: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '16px 24px', 
    background: 'rgba(255, 255, 255, 0.04)', 
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
  },
  hudItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  hudLabel: { 
    fontSize: '11px', 
    color: 'rgba(255, 255, 255, 0.5)', 
    textTransform: 'uppercase', 
    letterSpacing: '1.5px',
    fontWeight: '700'
  },
  hudValue: { 
    fontSize: '26px', 
    fontWeight: '900', 
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  hudValueSmall: { 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#93c5fd',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
  },
  gameArea: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '32px 24px', 
    gap: '24px' 
  },
  instruction: { 
    fontSize: '16px', 
    color: 'rgba(255, 255, 255, 0.9)', 
    textAlign: 'center', 
    margin: 0,
    fontWeight: '500'
  },
  wordSlots: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  slot: { 
    width: '85px', 
    height: '85px', 
    border: '2.5px dashed rgba(255, 255, 255, 0.3)', 
    borderRadius: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '26px', 
    fontWeight: '800', 
    color: 'rgba(255, 255, 255, 0.3)', 
    cursor: 'pointer', 
    transition: 'all 0.2s' 
  },
  slotFilled: { 
    background: 'linear-gradient(135deg, #1a56db, #7c3aed)', 
    border: '2px solid #60a5fa', 
    color: '#fff', 
    transform: 'scale(1.05)',
    boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)'
  },
  feedback: { padding: '14px 28px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', textAlign: 'center' },
  syllables: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '650px' },
  syllableBtn: { 
    padding: '16px 26px', 
    background: 'linear-gradient(135deg, #1e3a8a, #1a56db)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '16px', 
    fontSize: '22px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: 'all 0.15s', 
    boxShadow: '0 6px 16px rgba(26, 86, 219, 0.4)', 
    letterSpacing: '1px' 
  },
  voiceBtn: { 
    padding: '18px 48px', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '20px', 
    fontSize: '20px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    boxShadow: '0 8px 24px rgba(26, 86, 219, 0.5)' 
  },
  progress: { fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  endCard: { background: '#fff', borderRadius: '24px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  scoreText: { fontSize: '18px', color: '#374151', fontWeight: '500' },
  btnEnd: { height: '52px', padding: '0 40px', background: 'linear-gradient(135deg, #1a56db, #7c3aed)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginTop: '12px', boxShadow: '0 4px 14px rgba(26,86,219,0.4)' },
  wordImage: { width: '130px', height: '130px', objectFit: 'cover', borderRadius: '20px', border: '3px solid rgba(255, 255, 255, 0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  hintBubble: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '8px 16px', color: '#93c5fd', fontSize: '14px', fontWeight: '600', textShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnExit: { padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)', display: 'flex', alignItems: 'center', gap: '6px' },
};
