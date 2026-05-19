// ============================================================
// pages/games/GameLevelEditor.jsx
// Panel del psicólogo para editar niveles del Constructor de Cohetes
// por jugador. Los cambios se guardan en la DB y solo aplican
// al jugador seleccionado.
// ============================================================

import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const DEFAULT_LEVELS = {
  1:  { words:[['CA','SA'],['ME','SA'],['PA','TO'],['SO','FA'],['LU','NA']], distractors:0, label:'Palabras simples', voice:false },
  2:  { words:[['CA','MA'],['PI','SO'],['BO','CA'],['MA','NO'],['PE','LO']], distractors:0, label:'Palabras simples', voice:false },
  3:  { words:[['CA','SA'],['ME','SA'],['PA','TO']], distractors:2, label:'Con distractores', voice:false },
  4:  { words:[['CO','MI','DA'],['PA','LA','BRA'],['VEN','TA','NA']], distractors:2, label:'Con distractores', voice:false },
  5:  { words:[['MU','ÑE','CA'],['CA','BA','LLO'],['PA','RA','GUA']], distractors:3, label:'Con distractores', voice:false },
  6:  { words:[['BRU','JA'],['TRE','NE'],['FLO','RES'],['PRUE','BA']], distractors:2, label:'Sílabas complejas', voice:false },
  7:  { words:[['BLAN','CO'],['PREN','DA'],['TRANS','TE'],['FRES','CO']], distractors:3, label:'Sílabas complejas', voice:false },
  8:  { words:[['MA','LU','CO'],['BI','FO','TE'],['SA','PU','LI']], distractors:3, label:'Pseudopalabras', voice:false },
  9:  { words:[['TRE','LU','PA'],['MO','CA','BI'],['FI','SA','TU']], distractors:4, label:'Pseudopalabras', voice:false },
  10: { words:[['CA','SA'],['ME','SA'],['PA','TO']], distractors:0, label:'¡Reconocimiento por voz!', voice:true },
};

export default function GameLevelEditor({ patientId, onClose }) {
  const [players, setPlayers]       = useState([]);
  const [playerId, setPlayerId]     = useState(null);
  const [customConfig, setCustomConfig] = useState({});  // niveles con config guardada
  const [editLevel, setEditLevel]   = useState(null);    // nivel abierto en editor
  const [form, setForm]             = useState(null);    // config del nivel editando
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState('');

  // Cargar jugadores del paciente
  useEffect(() => {
    API.get(`/games/patient/${patientId}/players`)
      .then(r => {
        setPlayers(r.data);
        if (r.data.length > 0) setPlayerId(r.data[0].id);
      })
      .catch(() => {});
  }, [patientId]);

  // Cargar config personalizada cuando cambia el jugador
  useEffect(() => {
    if (!playerId) return;
    API.get(`/games/config/${playerId}/rocket_builder`)
      .then(r => setCustomConfig(r.data || {}))
      .catch(() => setCustomConfig({}));
  }, [playerId]);

  const [uploadingIdx, setUploadingIdx] = useState(null);

  const openLevel = (lvl) => {
    const base = customConfig[lvl] || DEFAULT_LEVELS[lvl];
    const mappedWords = base.words.map(w => {
      if (w && typeof w === 'object' && !Array.isArray(w)) {
        return {
          word: w.word || '',
          syllables: Array.isArray(w.syllables) ? w.syllables.join('-') : (w.syllables || ''),
          distractors: Array.isArray(w.distractors) ? w.distractors.join(',') : (w.distractors || ''),
          image: w.image || '',
          hint: w.hint || '',
        };
      } else {
        const syl = Array.isArray(w) ? w.join('-') : String(w);
        const wrd = Array.isArray(w) ? w.join('') : String(w);
        return {
          word: wrd,
          syllables: syl,
          distractors: '',
          image: '',
          hint: '',
        };
      }
    });

    setForm({
      words:       mappedWords,
      distractors: base.distractors,
      label:       base.label,
      voice:       base.voice || false,
    });
    setEditLevel(lvl);
    setMsg('');
  };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const words = form.words
        .filter(w => w.word.trim() !== '' || w.syllables.trim() !== '')
        .map(w => {
          const syllables = w.syllables.trim().toUpperCase().includes('-')
            ? w.syllables.trim().toUpperCase().split('-')
            : [w.syllables.trim().toUpperCase() || w.word.trim().toUpperCase()];
            
          const distractors = w.distractors.trim().toUpperCase()
            ? w.distractors.trim().toUpperCase().split(',').map(d => d.trim()).filter(d => d !== '')
            : [];
            
          return {
            word: w.word.trim().toUpperCase() || syllables.join(''),
            syllables: syllables,
            distractors: distractors,
            image: w.image,
            hint: w.hint.trim(),
          };
        });

      await API.put(`/games/config/${playerId}/rocket_builder/${editLevel}`, {
        words,
        distractors: parseInt(form.distractors) || 0,
        label: form.label,
        voice: form.voice,
      });

      setCustomConfig(prev => ({ ...prev, [editLevel]: { words, distractors: parseInt(form.distractors)||0, label: form.label, voice: form.voice } }));
      setMsg('✅ Guardado correctamente');
    } catch (e) {
      setMsg('❌ Error al guardar');
    } finally { setSaving(false); }
  };

  const handleReset = async (lvl) => {
    if (!window.confirm(`¿Restaurar nivel ${lvl} a los valores por defecto?`)) return;
    try {
      await API.delete(`/games/config/${playerId}/rocket_builder/${lvl}`);
      const updated = { ...customConfig };
      delete updated[lvl];
      setCustomConfig(updated);
      if (editLevel === lvl) setEditLevel(null);
      setMsg(`✅ Nivel ${lvl} restaurado`);
    } catch { setMsg('❌ Error al restaurar'); }
  };

  const handleImageUpload = async (index, file) => {
    setUploadingIdx(index);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await API.post('/games/upload_word_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateWordField(index, 'image', res.data.url);
    } catch (e) {
      alert('Error al subir la imagen');
    } finally {
      setUploadingIdx(null);
    }
  };

  const updateWordField = (index, field, value) => {
    setForm(f => {
      const updatedWords = f.words.map((w, idx) => {
        if (idx === index) {
          return { ...w, [field]: value };
        }
        return w;
      });
      return { ...f, words: updatedWords };
    });
  };

  const addWord = () => setForm(f => ({ ...f, words: [...f.words, { word:'', syllables:'', distractors:'', image:'', hint:'' }] }));
  const removeWord = (i) => setForm(f => ({ ...f, words: f.words.filter((_,idx) => idx !== i) }));

  if (players.length === 0) {
    return (
      <div style={s.overlay}>
        <div style={s.modal}>
          <h3 style={s.title}>⚙️ Editor de Niveles</h3>
          <p style={{color:'#6b7280', textAlign:'center', padding:'20px'}}>
            Este paciente no tiene cuenta de juego creada aún.
          </p>
          <button onClick={onClose} style={s.btnClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <h3 style={s.title}>⚙️ Editor de Niveles — Constructor de Cohetes</h3>
          <button onClick={onClose} style={s.btnX}>✕</button>
        </div>

        {/* Selector de jugador */}
        {players.length > 1 && (
          <div style={s.fg}>
            <label style={s.label}>Jugador</label>
            <select style={s.input} value={playerId} onChange={e => setPlayerId(parseInt(e.target.value))}>
              {players.map(p => <option key={p.id} value={p.id}>{p.nickname}</option>)}
            </select>
          </div>
        )}

        <div style={s.body}>

          {/* Lista de niveles */}
          <div style={s.levelList}>
            {[1,2,3,4,5,6,7,8,9,10].map(lvl => {
              const isCustom = !!customConfig[lvl];
              const isOpen   = editLevel === lvl;
              return (
                <div key={lvl} style={{...s.levelRow, background: isOpen ? '#eff6ff' : '#fff', borderColor: isOpen ? '#1a56db' : '#e5e7eb'}}>
                  <div style={s.levelInfo}>
                    <span style={s.levelNum}>Nivel {lvl}</span>
                    <span style={s.levelLabel}>{(customConfig[lvl] || DEFAULT_LEVELS[lvl]).label}</span>
                    {isCustom && <span style={s.badge}>Personalizado</span>}
                  </div>
                  <div style={s.levelActions}>
                    <button onClick={() => openLevel(lvl)} style={s.btnEdit}>✏️ Editar</button>
                    {isCustom && (
                      <button onClick={() => handleReset(lvl)} style={s.btnReset}>↩ Default</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editor del nivel seleccionado */}
          {editLevel && form && (
            <div style={s.editor}>
              <h4 style={s.editorTitle}>Editando Nivel {editLevel}</h4>
              <p style={s.hint}>
                Configura cada palabra con su separación de sílabas (guiones) y distractores (comas). Sube una imagen o añade una pista si lo deseas.
              </p>

              <div style={s.fg}>
                <label style={s.label}>Etiqueta del nivel</label>
                <input style={s.input} value={form.label}
                  onChange={e => setForm(f => ({...f, label: e.target.value}))} />
              </div>

              <div style={s.fgRow}>
                <div style={s.fg}>
                  <label style={s.label}>Nº Distractores (Automáticos si no hay personalizados)</label>
                  <input type="number" min="0" max="6" style={s.input} value={form.distractors}
                    onChange={e => setForm(f => ({...f, distractors: e.target.value}))} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Modo voz</label>
                  <select style={s.input} value={form.voice ? 'true' : 'false'}
                    onChange={e => setForm(f => ({...f, voice: e.target.value === 'true'}))}>
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
              </div>

              <div style={s.fg}>
                <label style={s.label}>Palabras y Configuración</label>
                {form.words.map((w, i) => (
                  <div key={i} style={s.wordCard}>
                    <div style={s.wordHeader}>
                      <span style={s.wordNum}>Palabra #{i + 1}</span>
                      <button type="button" onClick={() => removeWord(i)} style={s.btnDelWord} disabled={form.words.length <= 1}>Eliminar ✕</button>
                    </div>

                    <div style={s.fgRow}>
                      <div style={s.fg}>
                        <label style={s.subLabel}>Palabra completa</label>
                        <input style={s.input} value={w.word} placeholder="Ej: CASA"
                          onChange={e => updateWordField(i, 'word', e.target.value)} />
                      </div>
                      <div style={s.fg}>
                        <label style={s.subLabel}>Sílabas (ej: CA-SA)</label>
                        <input style={s.input} value={w.syllables} placeholder="Ej: CA-SA"
                          onChange={e => updateWordField(i, 'syllables', e.target.value)} />
                      </div>
                    </div>

                    <div style={s.fgRow}>
                      <div style={s.fg}>
                        <label style={s.subLabel}>Sílabas incorrectas (ej: MA,PE)</label>
                        <input style={s.input} value={w.distractors} placeholder="Ej: MA,PE"
                          onChange={e => updateWordField(i, 'distractors', e.target.value)} />
                      </div>
                      <div style={s.fg}>
                        <label style={s.subLabel}>Pista / Definición</label>
                        <input style={s.input} value={w.hint} placeholder="Ej: Lugar para vivir"
                          onChange={e => updateWordField(i, 'hint', e.target.value)} />
                      </div>
                    </div>

                    <div style={s.fgRow}>
                      <div style={s.fg}>
                        <label style={s.subLabel}>Imagen del objeto</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="file" accept="image/*" onChange={e => {
                            if (e.target.files[0]) handleImageUpload(i, e.target.files[0]);
                          }} style={{ display: 'none' }} id={`file-input-${i}`} />
                          <label htmlFor={`file-input-${i}`} style={s.btnUpload}>
                            {uploadingIdx === i ? 'Subiendo...' : w.image ? 'Cambiar Imagen 🖼️' : 'Subir Imagen 🖼️'}
                          </label>
                          {w.image && (
                            <button type="button" onClick={() => updateWordField(i, 'image', '')} style={s.btnDelImg}>✕</button>
                          )}
                        </div>
                      </div>
                      <div style={s.fg}>
                        {w.image && (
                          <div style={s.previewContainer}>
                            <img src={w.image} alt="Vista previa" style={s.previewImg} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addWord} style={s.btnAdd}>➕ Agregar Palabra</button>
              </div>

              {msg && (
                <div style={{...s.msg, background: msg.startsWith('✅') ? '#d1fae5' : '#fee2e2',
                  color: msg.startsWith('✅') ? '#065f46' : '#dc2626', marginBottom: '10px'}}>
                  {msg}
                </div>
              )}

              <div style={s.editorBtns}>
                <button onClick={handleSave} disabled={saving} style={s.btnSave}>
                  {saving ? 'Guardando...' : '💾 Guardar nivel'}
                </button>
                <button onClick={() => setEditLevel(null)} style={s.btnCancel}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  wordCard:     { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'14px', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'8px' },
  wordHeader:   { display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0', paddingBottom:'6px', marginBottom:'2px' },
  wordNum:      { fontSize:'12px', fontWeight:'700', color:'#475569' },
  subLabel:     { fontSize:'11px', fontWeight:'600', color:'#64748b' },
  btnDelWord:   { background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:'11px', fontWeight:'700' },
  btnUpload:    { display:'inline-flex', alignItems:'center', gap:'4px', background:'#eff6ff', color:'#1a56db', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'1px solid #bfdbfe' },
  btnDelImg:    { background:'#fee2e2', border:'none', color:'#dc2626', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer' },
  previewContainer: { display:'flex', alignItems:'center', gap:'8px' },
  previewImg:   { width:'42px', height:'42px', objectFit:'cover', borderRadius:'6px', border:'1px solid #cbd5e1' },
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  modal:        { background:'#fff', borderRadius:'16px', width:'100%', maxWidth:'850px', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' },
  header:       { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #e5e7eb' },
  title:        { fontSize:'16px', fontWeight:'700', color:'#1e3a8a', margin:0 },
  btnX:         { background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#6b7280', padding:'4px 8px' },
  body:         { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0', flex:1, overflow:'hidden' },
  levelList:    { borderRight:'1px solid #e5e7eb', overflowY:'auto', padding:'12px' },
  levelRow:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:'8px', border:'1px solid #e5e7eb', marginBottom:'6px', transition:'all 0.15s' },
  levelInfo:    { display:'flex', flexDirection:'column', gap:'2px' },
  levelNum:     { fontSize:'13px', fontWeight:'700', color:'#1f2937' },
  levelLabel:   { fontSize:'11px', color:'#6b7280' },
  badge:        { fontSize:'10px', background:'#dbeafe', color:'#1e40af', padding:'1px 6px', borderRadius:'10px', fontWeight:'600', alignSelf:'flex-start' },
  levelActions: { display:'flex', gap:'6px' },
  btnEdit:      { background:'#eff6ff', border:'none', color:'#1a56db', padding:'5px 10px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  btnReset:     { background:'#fef3c7', border:'none', color:'#92400e', padding:'5px 10px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  editor:       { overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'14px' },
  editorTitle:  { fontSize:'15px', fontWeight:'700', color:'#1e3a8a', margin:0 },
  hint:         { fontSize:'12px', color:'#6b7280', background:'#f8fafc', padding:'10px', borderRadius:'8px', lineHeight:'1.6', margin:0 },
  fg:           { display:'flex', flexDirection:'column', gap:'5px' },
  fgRow:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  label:        { fontSize:'12px', fontWeight:'600', color:'#374151' },
  input:        { height:'38px', border:'1.5px solid #e5e7eb', borderRadius:'8px', padding:'0 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', width:'100%' },
  wordRow:      { display:'flex', gap:'6px', alignItems:'center', marginBottom:'6px' },
  btnDel:       { height:'38px', width:'38px', background:'#fee2e2', border:'none', color:'#dc2626', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'700', flexShrink:0 },
  btnAdd:       { background:'none', border:'1.5px dashed #1a56db', color:'#1a56db', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  msg:          { padding:'10px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:'600' },
  editorBtns:   { display:'flex', gap:'10px' },
  btnSave:      { flex:1, height:'42px', background:'linear-gradient(135deg, #1a56db, #1e3a8a)', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer' },
  btnCancel:    { height:'42px', padding:'0 20px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
  btnClose:     { height:'42px', padding:'0 24px', background:'#1a56db', color:'#fff', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor:'pointer', margin:'0 auto', display:'block' },
};
