import { setWorldConstructor, World } from "@cucumber/cucumber";
import { chromium } from "playwright";
import fs from "fs";
import { config } from "../../../playwright.config.js";
import { settings } from "../../config/settings.js";
import { getLocator } from "../../scanner/domScanner.js";

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
    
    // Caché local del DOM escaneado durante el escenario
    this.activeMap = {};
    
    // Datos de auditoría para el reporte PDF de este escenario
    this.testCaseData = {
      name: "",
      type: "funcional",
      status: "passed",
      steps: [],
      screenshotBase64: null, // Captura de pantalla global fallback
      metrics: null
    };

    // Parámetros pasados por CLI o configuraciones
    this.targetUrl = settings.baseUrl;
    
    // Configuración de visualización headed opcional
    this.headed = options.parameters && options.parameters.headed || false;
  }

  /**
   * Inicializa el navegador y contexto para el escenario.
   * Carga la sesión guardada si aplica para evitar repetir el login interactivo.
   */
  async init(scenarioName = "") {
    this.browser = await chromium.launch({
      ...config.launchOptions,
      headless: !this.headed
    });

    const contextOptions = {
      viewport: config.defaultViewport
    };

    // Ruta de sesión guardada
    const storagePath = "reports/storageState.json";
    
    // No cargar la sesión para el test de Login, para forzar el prompt y guardar una nueva sesión fresca
    const isLoginTest = scenarioName.toLowerCase().includes("inicio de sesión") || 
                        scenarioName.toLowerCase().includes("login");

    if (!isLoginTest && fs.existsSync(storagePath)) {
      contextOptions.storageState = storagePath;
      console.log("    [Sesión] Cargando estado de autenticación guardado en reports/storageState.json");
    }

    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();
  }

  /**
   * Helper de espera condicionado a modo visible (headed)
   * emulando la lógica de time.sleep() de las tareas de testing.
   */
  async sleep(ms = 1000) {
    if (this.headed) {
      await this.page.waitForTimeout(ms);
    }
  }

  /**
   * Navega a la URL objetivo.
   */
  async goTo(url = this.targetUrl) {
    this.targetUrl = url;
    const response = await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await this.sleep(1500); // Pausa visual para observar la carga de la página
    
    // Si la URL destino requiere autenticación (no es /login ni /)
    // y nos encontramos en la página de login (redirigido), iniciamos sesión automáticamente.
    const urlActual = this.page.url();
    const isLoginRequired = !url.includes("/login") && 
                            url !== settings.baseUrl && 
                            (urlActual.includes("/login") || urlActual.includes("/auth"));
    
    if (isLoginRequired) {
      console.log("    [Auto-Login] Redirección a login detectada. Iniciando sesión con admin@neurogym.com...");
      try {
        await this.fill("email", "admin@neurogym.com");
        await this.fill("password", "admin123");
        await this.click("submitLogin");
        
        await this.page.waitForURL(new RegExp("/dashboard"), { timeout: 10000 });
        await this.page.waitForLoadState("networkidle");
        console.log("    [Auto-Login] Sesión iniciada con éxito. Continuando...");
        
        // Re-navegar a la URL original si no era el propio dashboard
        if (!url.includes("/dashboard")) {
          await this.page.goto(url, { waitUntil: "domcontentloaded" });
          await this.sleep(1500);
        }
      } catch (err) {
        console.warn("    [Auto-Login] Advertencia al iniciar sesión automáticamente:", err.message);
      }
    }
    
    return response;
  }

  /**
   * Escribe en un input de forma inteligente.
   * Utiliza el escáner para buscar el campo.
   */
  async fill(key, value) {
    const locator = await getLocator(this.page, key, this.activeMap);
    await locator.focus();
    await this.sleep(500); // Pausa antes de escribir
    await locator.fill(value);
    await this.sleep(1000); // Pausa después de escribir
  }

  /**
   * Hace click en un botón/enlace de forma inteligente.
   */
  async click(key) {
    const locator = await getLocator(this.page, key, this.activeMap);
    await this.sleep(500); // Pausa antes de hacer clic
    await locator.click();
    await this.sleep(1500); // Pausa después de hacer clic para ver la reacción
  }

  /**
   * Registra los datos de un paso ejecutado para el reporte final.
   * Ahora soporta almacenar una captura de pantalla por paso.
   */
  logStep(keyword, text, status = "passed", error = null, screenshotBase64 = null) {
    this.testCaseData.steps.push({
      keyword,
      text,
      status,
      screenshotBase64,
      error: error ? error.stack || error.message : null
    });
    if (status === "failed") {
      this.testCaseData.status = "failed";
    }
  }

  /**
   * Cierra las conexiones del navegador.
   */
  async destroy() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);
export { CustomWorld };
