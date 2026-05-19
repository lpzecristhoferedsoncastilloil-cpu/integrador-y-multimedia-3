// ============================================================
// pages/games/GameLogin.jsx — Login del módulo de juegos
// El paciente entra con su apodo y contraseña simple
// Solo el psicólogo puede recuperar la contraseña
// ============================================================

import React, { useState } from 'react';
import API from '../../services/api';

export default function GameLogin({ onLogin }) {
  const [mode, setMode]       = useState('login');   // login | register
  const [form, setForm]       = useState({ nickname:'', password:'' });
  const [regForm, setRegForm] = useState({ patient_id:'', nickname:'', password:'', confirm:'', age:'', laterality:'right' });
  const [patients, setPatients] = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Cargar pacientes al abrir registro
  const openRegister = async () => {
    try {
      const res = await API.get('/patients/');
      setPatients(res.data);
      setMode('register');
    } catch { setError('Error al cargar pacientes'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/games/player/login', form);
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Apodo o contraseña incorrectos');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) return setError('Las contraseñas no coinciden');
    if (regForm.password.length < 4) return setError('La contraseña debe tener al menos 4 caracteres');
    setLoading(true); setError('');
    try {
      await API.post('/games/player/register', {
        patient_id: parseInt(regForm.patient_id),
        nickname: regForm.nickname,
        password: regForm.password,
        age: parseInt(regForm.age) || null,
        laterality: regForm.laterality,
      });
      setMode('login');
      setForm({ nickname: regForm.nickname, password:'' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>🧠</div>
        <h1 style={styles.title}>NeuroGym</h1>
        <p style={styles.subtitle}>Juegos de Aprendizaje</p>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.fg}>
              <label style={styles.label}>Tu apodo</label>
              <input required style={styles.input} placeholder="Ej: SuperHéroe123"
                value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} />
            </div>
            <div style={styles.fg}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.passWrap}>
                <input required type={showPass ? 'text':'password'} style={{...styles.input, paddingRight:'44px'}}
                  placeholder="Tu contraseña secreta"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? '🙈':'👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={styles.btnLogin}>
              {loading ? 'Entrando...' : '🚀 ¡Jugar!'}
            </button>
            <button type="button" onClick={openRegister} style={styles.btnRegister}>
              ¿Primera vez? Crear cuenta
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={styles.form}>
            <h3 style={styles.regTitle}>Crear cuenta de juego</h3>
            <div style={styles.fg}>
              <label style={styles.label}>Paciente *</label>
              <select required style={styles.input} value={regForm.patient_id}
                onChange={e => setRegForm({...regForm, patient_id: e.target.value})}>
                <option value="">Seleccionar paciente...</option>
                {patients.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombre_completo}</option>)}
              </select>
            </div>
            <div style={styles.fg}>
              <label style={styles.label}>Apodo / Nickname *</label>
              <input required style={styles.input} placeholder="Ej: SuperHéroe123"
                value={regForm.nickname} onChange={e => setRegForm({...regForm, nickname: e.target.value})} />
            </div>
            <div style={styles.fg}>
              <label style={styles.label}>Contraseña * (mínimo 4 caracteres)</label>
              <input required type="password" style={styles.input} placeholder="Contraseña fácil de recordar"
                value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
            </div>
            <div style={styles.fg}>
              <label style={styles.label}>Confirmar contraseña *</label>
              <input required type="password" style={styles.input} placeholder="Repite la contraseña"
                value={regForm.confirm} onChange={e => setRegForm({...regForm, confirm: e.target.value})} />
            </div>
            <div style={styles.fgRow}>
              <div style={styles.fg}>
                <label style={styles.label}>Edad</label>
                <input type="number" style={styles.input} placeholder="Edad"
                  value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} />
              </div>
              <div style={styles.fg}>
                <label style={styles.label}>Lateralidad</label>
                <select style={styles.input} value={regForm.laterality}
                  onChange={e => setRegForm({...regForm, laterality: e.target.value})}>
                  <option value="right">Diestro</option>
                  <option value="left">Zurdo</option>
                  <option value="both">Ambidiestro</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={styles.btnLogin}>
              {loading ? 'Creando...' : '✅ Crear Cuenta'}
            </button>
            <button type="button" onClick={() => setMode('login')} style={styles.btnRegister}>
              ← Volver al login
            </button>
          </form>
        )}

        <p style={styles.hint}>¿Olvidaste tu contraseña? Pídele ayuda a tu psicólogo 🧠</p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight:'100vh', background:'linear-gradient(135deg, #1e3a8a 0%, #1a56db 50%, #7c3aed 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  card: { background:'#fff', borderRadius:'24px', padding:'40px 36px', width:'100%', maxWidth:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center' },
  logo: { fontSize:'56px', marginBottom:'8px' },
  title: { fontSize:'28px', fontWeight:'800', color:'#1e3a8a', margin:'0 0 4px' },
  subtitle: { fontSize:'14px', color:'#6b7280', margin:'0 0 24px' },
  error: { background:'#fef2f2', border:'1px solid #fca5a5', color:'#dc2626', borderRadius:'8px', padding:'10px', fontSize:'13px', marginBottom:'16px', textAlign:'left' },
  form: { display:'flex', flexDirection:'column', gap:'14px', textAlign:'left' },
  regTitle: { fontSize:'15px', fontWeight:'700', color:'#1e3a8a', margin:'0 0 4px', textAlign:'center' },
  fg: { display:'flex', flexDirection:'column', gap:'5px' },
  fgRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  label: { fontSize:'13px', fontWeight:'600', color:'#374151' },
  input: { height:'44px', border:'1.5px solid #e5e7eb', borderRadius:'10px', padding:'0 14px', fontSize:'14px', outline:'none', width:'100%', boxSizing:'border-box' },
  passWrap: { position:'relative' },
  eyeBtn: { position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'18px', padding:0 },
  btnLogin: { height:'50px', background:'linear-gradient(135deg, #1a56db, #7c3aed)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:'800', cursor:'pointer', marginTop:'4px', letterSpacing:'0.5px' },
  btnRegister: { background:'none', border:'none', color:'#1a56db', fontSize:'13px', fontWeight:'600', cursor:'pointer', textDecoration:'underline' },
  hint: { fontSize:'11px', color:'#9ca3af', marginTop:'16px' },
};
