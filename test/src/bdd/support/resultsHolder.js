/**
 * Módulo para almacenar globalmente los resultados de las pruebas
 * durante la ejecución y consolidarlos en el reporte PDF.
 */
class ResultsHolder {
  constructor() {
    this.reset();
  }

  /**
   * Limpia y reinicia la memoria al inicio de cada ejecución para evitar la persistencia
   * de datos estáticos de ejecuciones previas.
   */
  reset() {
    this.testCases = [];
    this.currentSteps = []; // Evidencias temporales de pasos del escenario activo
    this.summary = {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0,
      targetUrl: "",
      date: null
    };
    this.startTime = null;
  }

  startTimer() {
    this.reset(); // Reiniciar memoria al iniciar
    this.startTime = Date.now();
    this.summary.date = new Date();
  }

  endTimer() {
    if (this.startTime) {
      this.summary.duration = Date.now() - this.startTime;
    }
  }

  /**
   * Agrega evidencias visuales y de estado por cada paso ejecutado de forma cronológica.
   */
  addStepEvidence(text, screenshotBase64, status) {
    this.currentSteps = this.currentSteps || [];
    
    // Cucumber puede pasar el status en mayúsculas, lo estandarizamos
    const cleanStatus = status.toLowerCase() === "passed" ? "passed" : 
                        status.toLowerCase() === "skipped" ? "skipped" : "failed";

    this.currentSteps.push({
      keyword: "Paso",
      text,
      status: cleanStatus,
      screenshotBase64,
      error: null
    });
  }

  addTestCase(testCase) {
    this.testCases.push(testCase);
    this.summary.total++;
    if (testCase.status === "passed") {
      this.summary.passed++;
    } else {
      this.summary.failed++;
    }
  }

  getResults() {
    return {
      summary: this.summary,
      testCases: this.testCases
    };
  }
}

export const resultsHolder = new ResultsHolder();
