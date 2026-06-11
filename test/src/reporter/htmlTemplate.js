/**
 * Plantilla HTML Premium para el Reporte de Pruebas.
 * Optimizado para ser legible por todo público (resumen ejecutivo visual)
 * y muestra el flujo cronológico paso a paso con capturas de pantalla integradas.
 */
export function generateReportHTML(summary, testCases) {
  const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
  const dateStr = new Date(summary.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
  const isSuiteSuccessful = summary.failed === 0;
  
  // Banner de Resumen Ejecutivo
  const executiveBannerHTML = isSuiteSuccessful
    ? `<div class="exec-banner exec-success">
         <div class="exec-icon">✓</div>
         <div class="exec-text">
           <h2>¡Suite de Pruebas Exitosa!</h2>
           <p>Todas las pruebas funcionales y no funcionales pasaron correctamente. El sistema está estable y verificado.</p>
         </div>
       </div>`
    : `<div class="exec-banner exec-failure">
         <div class="exec-icon">⚠️</div>
         <div class="exec-text">
           <h2>Atención: Se detectaron fallas</h2>
           <p>Se encontraron errores en ${summary.failed} caso(s) de prueba. Revisa la secuencia de pasos y las capturas abajo.</p>
         </div>
       </div>`;

  // Construcción de la lista de casos de uso
  const casesHTML = testCases.map((tc, index) => {
    const statusClass = tc.status === 'passed' ? 'status-passed' : 'status-failed';
    const statusText = tc.status === 'passed' ? 'PASÓ' : 'FALLÓ';
    
    // Identificar si hay algún paso fallido para el resumen no técnico
    const failedStep = tc.steps.find(s => s.status === 'failed');
    const failureSummaryHTML = failedStep
      ? `<div class="case-failure-summary">
           <strong>Fallo en el paso:</strong> <span>${failedStep.keyword} ${escapeHTML(failedStep.text)}</span>
         </div>`
      : '';

    const stepsHTML = tc.steps.map(step => {
      let stepStatusIcon = '✓';
      let stepClass = 'step-passed';
      if (step.status === 'failed') {
        stepStatusIcon = '✗';
        stepClass = 'step-failed';
      } else if (step.status === 'skipped') {
        stepStatusIcon = '○';
        stepClass = 'step-skipped';
      }
      
      let errorSummary = '';
      let technicalDetail = '';
      if (step.error) {
        const lines = step.error.split('\n');
        errorSummary = lines[0]; // Ej: "Error: No se pudo localizar el elemento..."
        technicalDetail = lines.slice(1).join('\n'); // Stacktrace restante
      }
      
      // Captura de pantalla por cada paso individual (Trazabilidad Total)
      const stepScreenshotHTML = step.screenshotBase64 
        ? `<div class="step-screenshot-container">
             <img src="data:image/png;base64,${step.screenshotBase64}" alt="Paso: ${escapeHTML(step.text)}" />
           </div>`
        : '';
      
      return `
        <div class="step-row ${stepClass}">
          <div class="step-meta">
            <span class="step-icon">${stepStatusIcon}</span>
            <span class="step-keyword">${step.keyword}</span>
            <span class="step-text">${escapeHTML(step.text)}</span>
          </div>
          ${step.error ? `
            <div class="step-error-box">
              <div class="error-msg-summary"><strong>Causa del fallo:</strong> ${escapeHTML(errorSummary)}</div>
              <details class="technical-details">
                <summary>Ver log técnico de la consola (desarrolladores)</summary>
                <pre>${escapeHTML(technicalDetail)}</pre>
              </details>
            </div>
          ` : ''}
          ${stepScreenshotHTML}
        </div>
      `;
    }).join('');

    // Captura de pantalla fallback global (si no hay por paso)
    const fallbackScreenshotSection = (!tc.steps.some(s => s.screenshotBase64) && tc.screenshotBase64)
      ? `<div class="screenshot-container ${tc.status === 'failed' ? 'screenshot-failed-border' : ''}">
           <h4>Evidencia final del caso de prueba:</h4>
           <img src="data:image/png;base64,${tc.screenshotBase64}" alt="Captura final" />
         </div>`
      : '';

    const performanceSection = tc.metrics 
      ? `<div class="metrics-container">
           <strong>Métricas obtenidas:</strong>
           <ul>
             ${tc.metrics.loadTime ? `<li>Tiempo de respuesta de la página: <code>${tc.metrics.loadTime} ms</code></li>` : ''}
             ${tc.metrics.brokenLinksCount !== undefined ? `<li>Enlaces rotos detectados: <code>${tc.metrics.brokenLinksCount}</code></li>` : ''}
             ${tc.metrics.accessibilityIssues !== undefined ? `<li>Fallas de accesibilidad (contraste/ARIA): <code>${tc.metrics.accessibilityIssues}</code></li>` : ''}
           </ul>
         </div>`
      : '';

    return `
      <div class="card test-case-card page-break-avoid">
        <div class="card-header">
          <div class="header-left">
            <span class="badge type-badge">${tc.type.toUpperCase()}</span>
            <h3>#${index + 1}: ${escapeHTML(tc.name)}</h3>
          </div>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        
        <div class="card-body">
          ${failureSummaryHTML}
          
          <div class="steps-section">
            <h4>Trazabilidad Visual del Flujo</h4>
            <div class="steps-timeline">
              ${stepsHTML}
            </div>
          </div>
          
          ${performanceSection}
          ${fallbackScreenshotSection}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de QA Inteligente - Neurogym</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        
        :root {
          --primary-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          --bg-light: #f8fafc;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --success: #10b981;
          --success-bg: #ecfdf5;
          --error: #ef4444;
          --error-bg: #fef2f2;
          --warning: #f59e0b;
          --card-bg: #ffffff;
          --border: #e2e8f0;
        }

        body {
          font-family: 'Outfit', sans-serif;
          background-color: var(--bg-light);
          color: var(--text-main);
          margin: 0;
          padding: 40px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        header {
          background: var(--primary-gradient);
          color: white;
          padding: 30px 40px;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.15);
          margin-bottom: 25px;
          position: relative;
          overflow: hidden;
        }

        header::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        header h1 {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        header p.subtitle {
          margin: 5px 0 0 0;
          font-size: 1rem;
          opacity: 0.9;
        }

        /* Banner Ejecutivo */
        .exec-banner {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 25px 30px;
          border-radius: 16px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .exec-success {
          background-color: #ecfdf5;
          border: 2px solid #a7f3d0;
          color: #065f46;
        }
        
        .exec-failure {
          background-color: #fef2f2;
          border: 2px solid #fecaca;
          color: #991b1b;
        }

        .exec-icon {
          font-size: 2.5rem;
          font-weight: bold;
          line-height: 1;
        }

        .exec-text h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .exec-text p {
          margin: 5px 0 0 0;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: var(--card-bg);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .summary-card .value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
        }

        .summary-card .value.success { color: var(--success); }
        .summary-card .value.error { color: var(--error); }

        .summary-card .label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 5px;
          font-weight: 600;
        }

        .host-banner {
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          color: #4338ca;
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          font-size: 0.95rem;
        }

        .host-banner code {
          background: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 600;
          border: 1px solid #e0e7ff;
        }

        .card {
          background: var(--card-bg);
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          overflow: hidden;
        }

        .test-case-card .card-header {
          padding: 20px 25px;
          background: #fafafa;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .type-badge {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .test-case-card h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
          color: #1e293b;
        }

        .status-badge {
          font-size: 0.85rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 30px;
          letter-spacing: 0.5px;
        }

        .status-passed {
          background-color: var(--success-bg);
          color: var(--success);
          border: 1px solid #a7f3d0;
        }

        .status-failed {
          background-color: var(--error-bg);
          color: var(--error);
          border: 1px solid #fecaca;
        }

        .card-body {
          padding: 25px;
        }

        /* Resumen de fallo del caso */
        .case-failure-summary {
          background-color: #fff5f5;
          border-left: 4px solid var(--error);
          padding: 12px 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }
        .case-failure-summary strong {
          color: #c53030;
        }
        .case-failure-summary span {
          color: #742a2a;
          font-weight: 600;
        }

        .steps-section h4, .screenshot-container h4 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Línea de tiempo de pasos */
        .steps-timeline {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .step-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background-color: #ffffff;
        }

        .step-passed { 
          border-left: 4px solid var(--success); 
          background: #fcfdfd;
        }
        
        .step-failed { 
          border-left: 4px solid var(--error); 
          background: var(--error-bg); 
          color: #991b1b; 
        }
        
        .step-skipped { 
          border-left: 4px solid #cbd5e1; 
          background: #f8fafc; 
          color: #64748b; 
          opacity: 0.65; 
        }

        .step-meta {
          display: flex;
          align-items: center;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .step-icon {
          font-weight: bold;
          font-size: 1.1rem;
          margin-right: 10px;
        }
        .step-passed .step-icon { color: var(--success); }
        .step-failed .step-icon { color: var(--error); }

        .step-keyword {
          font-weight: 700;
          margin-right: 5px;
        }

        /* Captura de pantalla por cada paso */
        .step-screenshot-container {
          margin-top: 5px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          max-width: 100%;
        }

        .step-screenshot-container img {
          width: 100%;
          max-height: 250px;
          object-fit: contain;
          background: #f1f5f9;
          display: block;
        }

        /* Caja de error formateada */
        .step-error-box {
          margin-top: 5px;
          background: white;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 15px;
        }

        .error-msg-summary {
          color: #b91c1c;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .technical-details {
          margin-top: 8px;
          font-size: 0.8rem;
          color: #4b5563;
        }

        .technical-details summary {
          cursor: pointer;
          font-weight: 600;
          color: #4f46e5;
          outline: none;
        }

        .technical-details pre {
          background: #0f172a;
          color: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin-top: 8px;
          font-family: monospace;
          white-space: pre-wrap;
        }

        .metrics-container {
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 15px;
          margin-top: 20px;
          font-size: 0.9rem;
        }

        .metrics-container ul {
          margin: 5px 0 0 0;
          padding-left: 20px;
        }

        .metrics-container li {
          margin-bottom: 4px;
        }

        .screenshot-container {
          margin-top: 20px;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }

        .screenshot-failed-border {
          border: 2px dashed var(--error);
          border-radius: 12px;
          padding: 15px;
          background: #fff5f5;
        }

        .screenshot-container img {
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          background: #eaeaea;
        }

        footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }

        /* Estilos de impresión para PDF */
        @media print {
          body {
            padding: 0;
            background-color: white;
          }
          .page-break-avoid {
            page-break-inside: avoid;
          }
          header {
            box-shadow: none;
            border: 1px solid #4f46e5;
          }
          .summary-card {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Reporte de QA Automatizado</h1>
          <p class="subtitle">Subsistema de Pruebas Inteligentes para Neurogym</p>
        </header>

        <div class="host-banner">
          Host / Entorno Objetivo Probado: <code>${escapeHTML(summary.targetUrl)}</code>
        </div>

        ${executiveBannerHTML}

        <div class="summary-grid">
          <div class="summary-card">
            <div class="value">${summary.total}</div>
            <div class="label">Total Casos</div>
          </div>
          <div class="summary-card">
            <div class="value success">${summary.passed}</div>
            <div class="label">Pruebas Exitosas</div>
          </div>
          <div class="summary-card">
            <div class="value error">${summary.failed}</div>
            <div class="label">Pruebas Fallidas</div>
          </div>
          <div class="summary-card">
            <div class="value">${successRate}%</div>
            <div class="label">Tasa Éxito</div>
          </div>
        </div>

        <div class="test-cases-list">
          ${casesHTML}
        </div>

        <footer>
          <p>Generado automáticamente el ${dateStr} por el Módulo de Automatización de Pruebas Inteligentes.</p>
          <p>Proyecto Integrador - Neurogym Test Suite</p>
        </footer>
      </div>
    </body>
    </html>
  `;
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
