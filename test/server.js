import express from "express";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import os from "os";
import nodemailer from "nodemailer";


// Obtener rutas relativas en formato ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del panel de control
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Servir los archivos de la carpeta reports para visualización directa
app.use("/reports", express.static(path.join(__dirname, "reports")));

/**
 * API Endpoint: Lista todos los tests del subsistema
 */
app.get("/api/tests", (req, res) => {
  const featuresDir = path.join(__dirname, "src/bdd/features");
  try {
    const files = fs.readdirSync(featuresDir)
      .filter(file => file.endsWith(".feature"))
      .map(file => {
        const id = file.replace(".feature", "");
        return { id, file };
      });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "No se pudo leer la carpeta de features." });
  }
});

/**
 * API Endpoint: Ejecuta las pruebas seleccionadas por SSE (Server-Sent Events)
 * Filtra de forma real y dinámica utilizando los tags de Cucumber correspondientes.
 */
app.get("/api/run-tests", (req, res) => {
  const { url, tags } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Se requiere la URL/Host objetivo." });
  }

  // Configurar headers para Server-Sent Events (SSE)
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  res.write(`data: ${JSON.stringify({ type: "stdout", text: `[Server] Levantando suite contra URL: ${url}\n` })}\n\n`);

  // Construir argumentos limpios para Cucumber
  // Ejecutamos siempre en modo headed (navegador visible) para la interactividad de los prompts
  const cucumberArgs = ["--world-parameters", '{"headed": true}'];
  
  if (tags) {
    // tags viene como cadena separada por comas, ej: "@Caso1_LoginExitoso,@Caso16_RegistroPacienteMenor"
    // Los agrupamos bajo la condición lógica "or" que entiende Cucumber: "@Caso1_LoginExitoso or @Caso16_RegistroPacienteMenor"
    const logicalExpression = tags.split(",").join(" or ");
    cucumberArgs.push("--tags", logicalExpression);
    res.write(`data: ${JSON.stringify({ type: "stdout", text: `[Server] Filtrando escenarios por tags: ${logicalExpression}\n` })}\n\n`);
  } else {
    // Si no se especifican tags, corremos todas las features del directorio por defecto
    cucumberArgs.push("src/bdd/features/**/*.feature");
    res.write(`data: ${JSON.stringify({ type: "stdout", text: `[Server] Ejecutando todos los casos por defecto...\n` })}\n\n`);
  }

  // Inyectamos la URL objetivo como variable de entorno TEST_BASE_URL
  // En Windows se requiere { shell: true } para que npx/cucumber-js se resuelva correctamente
  const cucumberProcess = spawn("npx", ["cucumber-js", ...cucumberArgs], {
    env: { 
      ...process.env, 
      TEST_BASE_URL: url 
    },
    shell: true
  });

  // Capturar stdout y enviarlo en vivo al cliente
  cucumberProcess.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      if (line.trim()) {
        res.write(`data: ${JSON.stringify({ type: "stdout", text: line })}\n\n`);
      }
    });
  });

  // Capturar stderr
  cucumberProcess.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      if (line.trim()) {
        res.write(`data: ${JSON.stringify({ type: "stdout", text: `[Error] ${line}` })}\n\n`);
      }
    });
  });

  // Capturar finalización del proceso
  cucumberProcess.on("close", (code) => {
    res.write(`data: ${JSON.stringify({ type: "done", code })}\n\n`);
    res.end();
  });

  // Si la conexión del cliente se interrumpe, matar el proceso de Cucumber
  req.on("close", () => {
    console.log("[Server] El cliente cerró la conexión, deteniendo el proceso de pruebas...");
    cucumberProcess.kill();
  });
});

/**
 * API Endpoint: Descargar Reporte PDF
 * Configura explícitamente los headers HTTP de respuesta para forzar descarga correcta del PDF.
 */
app.get("/api/download-pdf", (req, res) => {
  const pdfPath = path.join(__dirname, "reports/pdf/reporte_ejecucion.pdf");
  if (fs.existsSync(pdfPath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_ejecucion.pdf");
    res.sendFile(pdfPath);
  } else {
    res.status(404).json({ error: "El archivo de reporte PDF no existe. Ejecuta las pruebas primero." });
  }
});

/**
 * API Endpoint: Visualizar el Reporte HTML
 * Sirve directamente el archivo de reporte HTML intermedio en una pestaña nueva.
 */
app.get("/api/view-html", (req, res) => {
  const htmlPath = path.join(__dirname, "reports/pdf/reporte_ejecucion.html");
  if (fs.existsSync(htmlPath)) {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(htmlPath);
  } else {
    res.status(404).send("El reporte HTML no existe. Ejecuta las pruebas primero.");
  }
});

// Helper para calcular uso de CPU
function cpuAverage() {
  let totalIdle = 0;
  let totalTick = 0;
  const cpus = os.cpus();
  if (!cpus) return { idle: 0, total: 0 };
  for (let i = 0, len = cpus.length; i < len; i++) {
    const cpu = cpus[i];
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

let startMeasure = cpuAverage();

/**
 * API Endpoint: Obtener el uso en tiempo real de CPU y RAM
 */
app.get("/api/resources", (req, res) => {
  const endMeasure = cpuAverage();
  const idleDifference = endMeasure.idle - startMeasure.idle;
  const totalDifference = endMeasure.total - startMeasure.total;
  
  let cpuPercentage = 0;
  if (totalDifference > 0) {
    cpuPercentage = 100 - Math.round((100 * idleDifference) / totalDifference);
  }
  
  startMeasure = endMeasure;

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramPercentage = Math.round((usedMem / totalMem) * 100);

  res.json({
    cpu: Math.max(0, Math.min(100, cpuPercentage)),
    ram: ramPercentage,
    ramUsedGb: (usedMem / (1024 * 1024 * 1024)).toFixed(2),
    ramTotalGb: (totalMem / (1024 * 1024 * 1024)).toFixed(2)
  });
});

/**
 * API Endpoint: Enviar reporte de ejecución por correo SMTP
 */
app.post("/api/send-email", async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPass, toEmail, useTls } = req.body;
  const pdfPath = path.join(__dirname, "reports/pdf/reporte_ejecucion.pdf");

  if (!fs.existsSync(pdfPath)) {
    return res.status(400).json({ error: "El archivo de reporte PDF no existe. Ejecuta las pruebas primero." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost || "smtp.gmail.com",
      port: parseInt(smtpPort) || 465,
      secure: useTls !== false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: smtpUser,
      to: toEmail,
      subject: "Reporte de QA Automatizado - Neurogym",
      text: "Estimado Usuario,\n\nSe adjunta el reporte de la ejecución de pruebas del portal de Neurogym en formato PDF.\n\nAtentamente,\nSubsistema de QA Inteligente",
      attachments: [
        {
          filename: "reporte_ejecucion.pdf",
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "El reporte PDF ha sido enviado por correo exitosamente." });
  } catch (err) {
    console.error("[SMTP Error] No se pudo enviar el correo:", err.message);
    res.status(500).json({ error: `Error al enviar correo: ${err.message}` });
  }
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`[QA Control Panel] Servidor Express corriendo en:`);
  console.log(`   --> http://localhost:${PORT}`);
  console.log(`================================================================`);
});
