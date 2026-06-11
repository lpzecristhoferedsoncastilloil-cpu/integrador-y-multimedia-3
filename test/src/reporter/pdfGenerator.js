import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { generateReportHTML } from "./htmlTemplate.js";

/**
 * Genera un reporte en PDF moderno a partir de los datos de ejecución.
 * Utiliza un proceso hijo aislado para evitar bloqueos con el loop de eventos de Cucumber.
 * 
 * @param {Object} summary Resumen de ejecución ({ total, passed, failed, duration, targetUrl, date })
 * @param {Array} testCases Lista de casos de prueba ejecutados
 * @param {string} pdfOutputPath Ruta final de guardado del PDF
 */
export async function generatePDFReport(summary, testCases, pdfOutputPath) {
  try {
    // 1. Generar HTML completo
    const htmlContent = generateReportHTML(summary, testCases);

    // Asegurar que el directorio de destino existe
    const pdfDir = path.dirname(pdfOutputPath);
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Guardar una copia temporal del reporte en formato HTML para auditorías rápidas
    const htmlOutputPath = pdfOutputPath.replace(/\.pdf$/, ".html");
    fs.writeFileSync(htmlOutputPath, htmlContent, "utf8");
    console.log("[Reporter] HTML guardado en:", htmlOutputPath);

    // 2. Crear un archivo temporal de worker
    const workerPath = path.join(pdfDir, "pdf_worker.js");
    const workerCode = `
import fs from 'fs';
import { chromium } from 'playwright';

async function run() {
  console.log("[Worker] Iniciando generación de PDF...");
  const htmlContent = fs.readFileSync(${JSON.stringify(htmlOutputPath)}, 'utf8');
  
  console.log("[Worker] Levantando Chromium...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("[Worker] Cargando HTML...");
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  
  console.log("[Worker] Imprimiendo PDF...");
  await page.pdf({
    path: ${JSON.stringify(pdfOutputPath)},
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    }
  });
  
  console.log("[Worker] Cerrando navegador...");
  await browser.close();
  console.log("[Worker] Proceso finalizado.");
}

run().catch(err => {
  console.error("[Worker] Error en el proceso hijo:", err);
  process.exit(1);
});
`;
    fs.writeFileSync(workerPath, workerCode, "utf8");

    // 3. Ejecutar el script en un proceso de Node independiente
    console.log("[Reporter] Iniciando renderizador en proceso hijo aislado...");
    execSync(`node ${JSON.stringify(workerPath)}`, { stdio: "inherit" });
    console.log("[Reporter] PDF generado exitosamente.");

    // Limpiar el script temporal de worker
    try {
      fs.unlinkSync(workerPath);
    } catch (e) {}
  } catch (error) {
    console.error("[Reporter] Error en la generación del PDF:", error);
    throw error;
  }
}
