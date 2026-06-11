import { BeforeAll, AfterAll, Before, After, AfterStep, setDefaultTimeout } from "@cucumber/cucumber";
import path from "path";
import fs from "fs";
import { resultsHolder } from "./resultsHolder.js";
import { generatePDFReport } from "../../reporter/pdfGenerator.js";
import { settings } from "../../config/settings.js";

// Establecer timeout global de 30 segundos para todos los pasos y hooks
setDefaultTimeout(30000);

// Helper para extraer la palabra clave real de un paso de Cucumber (ej. Dado, Cuando, Entonces, Y)
function getStepKeyword(stepResult) {
  try {
    const astNodeId = stepResult.pickleStep.astNodeIds[0];
    const gherkinDocument = stepResult.gherkinDocument;
    if (gherkinDocument && gherkinDocument.feature) {
      for (const child of gherkinDocument.feature.children) {
        const steps = (child.scenario && child.scenario.steps) || 
                      (child.background && child.background.steps) || [];
        const foundStep = steps.find(s => s.id === astNodeId);
        if (foundStep) {
          return foundStep.keyword.trim();
        }
      }
    }
  } catch (err) {
    // Silenciar
  }
  return "Paso"; // Fallback
}

// Inicialización global antes de todas las pruebas
BeforeAll(function () {
  console.log("[QA Runner] Iniciando Suite de Pruebas Automatizada...");
  resultsHolder.startTimer();
});

// Setup para cada escenario de prueba
Before(async function (scenario) {
  this.testCaseData.name = scenario.pickle.name;
  
  // Identificar si es una prueba no funcional buscando tags
  const tags = scenario.pickle.tags.map(t => t.name);
  if (tags.includes("@no-funcional") || tags.includes("@rendimiento") || tags.includes("@accesibilidad")) {
    this.testCaseData.type = "no funcional";
  }

  // Pre-cargar la lista de pasos completa del escenario en status "skipped" por defecto
  this.testCaseData.steps = scenario.pickle.steps.map(step => ({
    keyword: "Paso",
    text: step.text,
    status: "skipped",
    screenshotBase64: null,
    error: null
  }));
  this.currentStepIndex = 0;

  console.log(`\n[Test Case] Ejecutando: "${this.testCaseData.name}" (${this.testCaseData.type})`);
  
  // Inicializar Playwright pasando el nombre del escenario para gestionar la sesión
  await this.init(this.testCaseData.name);
});

// Post-procesamiento después de cada paso para auditorías visuales y capturas cronológicas
AfterStep(async function(stepResult) {
  const currentStep = this.testCaseData.steps[this.currentStepIndex];
  if (currentStep) {
    let screenshotBase64 = null;
    
    // Tomar captura del estado actual del viewport del navegador en formato Base64 de forma segura
    try {
      if (this.page) {
        screenshotBase64 = await this.page.screenshot({ encoding: "base64" });
      }
    } catch (err) {
      // Silenciar
    }

    try {
      const text = stepResult.pickleStep ? stepResult.pickleStep.text : currentStep.text;
      const rawStatus = stepResult.result ? stepResult.result.status : "FAILED";
      const status = rawStatus.toLowerCase() === "passed" ? "passed" : "failed";
      const keyword = getStepKeyword(stepResult);

      currentStep.keyword = keyword;
      currentStep.text = text;
      currentStep.status = status;
      currentStep.screenshotBase64 = screenshotBase64;

      // Si el paso falló, asociamos el error técnico
      if (status === "failed") {
        currentStep.error = stepResult.result?.error?.stack || stepResult.result?.error?.message || "Error desconocido";
      }
    } catch (err) {
      console.error("[QA Hooks] Error al procesar resultado de paso:", err);
    }
  }
  this.currentStepIndex++;
});

// Limpieza para cada escenario
After(async function (scenario) {
  // Determinar si hay alguna falla global en el escenario (ej. por timeout en un paso)
  const scenarioStatus = scenario.result ? scenario.result.status.toLowerCase() : "failed";
  if (scenarioStatus !== "passed") {
    this.testCaseData.status = "failed";
    
    // Si el paso actual no se llegó a procesar por AfterStep pero causó la falla (ej. timeout o error no atrapado)
    const currentStep = this.testCaseData.steps[this.currentStepIndex];
    if (currentStep && currentStep.status === "skipped") {
      currentStep.status = "failed";
      currentStep.error = scenario.result?.error?.stack || scenario.result?.error?.message || "Timeout u omisión en ejecución del escenario";
      
      try {
        if (this.page) {
          currentStep.screenshotBase64 = await this.page.screenshot({ encoding: "base64" });
        }
      } catch (err) {
        // Silenciar
      }
    }
  } else {
    this.testCaseData.status = "passed";
  }

  // Si el test de login interactivo fue exitoso, guardamos el estado de autenticación (cookies/localstorage)
  // de forma que los escenarios siguientes de administración o menú no requieran iniciar sesión de nuevo.
  const isLoginTest = this.testCaseData.name.toLowerCase().includes("inicio de sesión") || 
                      this.testCaseData.name.toLowerCase().includes("login");
                      
  if (isLoginTest && this.testCaseData.status === "passed" && this.context) {
    try {
      const storagePath = "reports/storageState.json";
      const dir = path.dirname(storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await this.context.storageState({ path: storagePath });
      console.log(`    [Sesión] Estado de autenticación exportado con éxito a: ${storagePath}`);
    } catch (err) {
      console.error("    [!] Error al exportar el estado de sesión:", err.message);
    }
  }

  // Guardar captura de pantalla de evidencia final del testcase en la carpeta reports/screenshots/
  if (this.page) {
    try {
      const screenshotDir = path.resolve("reports/screenshots");
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const safeName = this.testCaseData.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_");
      
      const screenshotPath = path.join(screenshotDir, `testcase_${safeName}.png`);
      await this.page.screenshot({ path: screenshotPath });
      console.log(`    [Captura] Evidencia final guardada físicamente en: ${screenshotPath}`);
    } catch (err) {
      console.warn("    [Captura] No se pudo guardar la captura física:", err.message);
    }
  }

  // Cerrar el navegador
  await this.destroy();
  
  // Almacenar el resultado de este caso de uso
  resultsHolder.addTestCase(this.testCaseData);
  console.log(`[Test Case Finished] Estado: ${this.testCaseData.status.toUpperCase()}`);
});

// Finalización global: Genera el PDF consolidador con un timeout extendido a 60 segundos
AfterAll({ timeout: 60000 }, async function () {
  resultsHolder.endTimer();
  
  const results = resultsHolder.getResults();
  results.summary.targetUrl = settings.baseUrl;
  
  const reportPath = path.resolve("reports/pdf/reporte_ejecucion.pdf");
  console.log("\n[QA Runner] Consolidando resultados en el reporte PDF...");
  
  await generatePDFReport(results.summary, results.testCases, reportPath);
  console.log(`[QA Runner] Suite finalizada con éxito. Reporte: ${reportPath}\n`);
});
