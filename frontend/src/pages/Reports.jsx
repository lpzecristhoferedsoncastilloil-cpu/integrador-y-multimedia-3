// ============================================================
// pages/Reports.jsx — Reportes e Informes del sistema
// Genera reportes de pacientes, citas y evolución
// ============================================================

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const REPORT_TYPES = [
  { value:'patients',    label:'Pacientes Registrados', icon:'👥', color:'#1a56db', bg:'#eff6ff' },
  { value:'appointments',label:'Citas Atendidas',       icon:'📅', color:'#059669', bg:'#ecfdf5' },
  { value:'patient_progress', label:'Progreso de Paciente', icon:'📈', color:'#7c3aed', bg:'#f5f3ff' },
  { value:'general',     label:'Informe General',       icon:'📊', color:'#d97706', bg:'#fffbeb' },
];

export default function Reports() {
  const [form, setForm] = useState({ report_type:'patients', date_from:'', date_to:'', patient_id:'' });
  const [patients, setPatients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get('/pacientes/');
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setPatients(data);
    } catch (e) { console.error(e); }
  };

  // Calcular últimos 6 meses por defecto
  const getLast6Months = () => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 6);
    return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/reportes/', { params: form });
      setResult(res.data);
    } catch (e) {
      alert(e.response?.data?.error || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <Layout titulo="Reportes e Informes">

      {/* Selector de tipo de reporte */}
      <div style={styles.typeGrid}>
        {REPORT_TYPES.map(t => (
          <button key={t.value} onClick={() => setForm({...form, report_type: t.value})}
            style={{
              ...styles.typeCard,
              background: form.report_type === t.value ? t.color : t.bg,
              border: `2px solid ${form.report_type === t.value ? t.color : 'transparent'}`,
            }}>
            <span style={styles.typeIcon}>{t.icon}</span>
            <span style={{...styles.typeLabel, color: form.report_type === t.value ? '#fff' : t.color}}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

        {/* Filtros de fecha con botón últimos 6 meses */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Configurar Reporte</h3>
        <form onSubmit={handleGenerate} style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha desde</label>
            <input type="date" style={styles.input} value={form.date_from} onChange={e => setForm({...form, date_from: e.target.value})} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha hasta</label>
            <input type="date" style={styles.input} value={form.date_to} onChange={e => setForm({...form, date_to: e.target.value})} />
          </div>
          {/* Selector de paciente para informe de progreso */}
          {form.report_type === 'patient_progress' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Paciente</label>
              <select style={styles.input} value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}>
                <option value="">Seleccionar paciente...</option>
                {patients.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombre_completo}</option>)}
              </select>
            </div>
          )}
          <button type="button" onClick={() => { const r = getLast6Months(); setForm(f=>({...f, date_from:r.from, date_to:r.to})); }}
            style={styles.btnLast6}>
            📅 Últimos 6 meses
          </button>
          <button type="submit" disabled={loading} style={styles.btnGenerate}>
            {loading ? 'Generando...' : '📊 Generar Reporte'}
          </button>
        </form>
      </div>

      {/* Resultado del reporte */}
      {result && (
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <h3 style={styles.resultTitle}>
              {REPORT_TYPES.find(t => t.value === form.report_type)?.icon} Resultado del Reporte
            </h3>
            <button onClick={handlePrint} style={styles.btnPrint}>🖨️ Imprimir</button>
          </div>

          <div style={styles.resultStats}>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{result.total}</div>
              <div style={styles.statLbl}>Total registros</div>
            </div>
          </div>

          {/* Tabla de datos */}
          {result.data && result.data.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  {Object.keys(result.data[0]).map(k => (
                    <th key={k} style={styles.th}>{k.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, i) => (
                  <tr key={i} style={styles.tr}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} style={styles.td}>{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Layout>
  );
}

const styles = {
  typeGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' },
  typeCard: { borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', cursor:'pointer', transition:'all 0.15s' },
  typeIcon: { fontSize:'32px' },
  typeLabel: { fontSize:'13px', fontWeight:'700', textAlign:'center' },
  formCard: { background:'#fff', borderRadius:'12px', padding:'24px', marginBottom:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  formTitle: { fontSize:'16px', fontWeight:'700', color:'#1e3a8a', margin:'0 0 16px' },
  formRow: { display:'flex', gap:'16px', alignItems:'flex-end' },
  formGroup: { display:'flex', flexDirection:'column', gap:'6px' },
  label: { fontSize:'13px', fontWeight:'600', color:'#374151' },
  input: { height:'42px', border:'1.5px solid #e5e7eb', borderRadius:'8px', padding:'0 12px', fontSize:'14px', outline:'none' },
  btnLast6: { height:'42px', padding:'0 16px', background:'#eff6ff', color:'#1a56db', border:'1.5px solid #bfdbfe', borderRadius:'8px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap', fontSize:'13px' },
  btnGenerate: { height:'42px', padding:'0 24px', background:'#1a56db', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
  resultCard: { background:'#fff', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  resultHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  resultTitle: { fontSize:'16px', fontWeight:'700', color:'#1e3a8a', margin:0 },
  btnPrint: { height:'38px', padding:'0 16px', background:'#f3f4f6', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'13px' },
  resultStats: { display:'flex', gap:'16px', marginBottom:'20px' },
  statBox: { background:'#eff6ff', borderRadius:'10px', padding:'16px 24px', textAlign:'center' },
  statNum: { fontSize:'32px', fontWeight:'800', color:'#1a56db' },
  statLbl: { fontSize:'12px', color:'#6b7280', marginTop:'4px' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#f8fafc' },
  th: { padding:'10px 14px', textAlign:'left', fontSize:'12px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', borderBottom:'1px solid #e5e7eb' },
  tr: { borderBottom:'1px solid #f3f4f6' },
  td: { padding:'12px 14px', fontSize:'14px', color:'#374151' },
};
