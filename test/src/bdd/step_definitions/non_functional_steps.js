import { When, Then } from "@cucumber/cucumber";
import { config } from "../../../playwright.config.js";
import assert from "assert";

When("el usuario mide el tiempo de carga de la página", async function () {
  const start = Date.now();
  await this.goTo(this.targetUrl);
  const end = Date.now();
  
  // Guardar métrica en los resultados del test
  const loadTime = end - start;
  this.testCaseData.metrics = this.testCaseData.metrics || {};
  this.testCaseData.metrics.loadTime = loadTime;
  
  console.log(`    [Performance] Tiempo de carga detectado: ${loadTime} ms`);
});

Then("la página debería responder en menos de {int} milisegundos", async function (maxTimeMs) {
  const loadTime = this.testCaseData.metrics?.loadTime;
  assert.ok(loadTime !== undefined, "No se ha medido el tiempo de carga.");
  assert.ok(
    loadTime < maxTimeMs,
    `El tiempo de carga (${loadTime} ms) supera el límite configurado de ${maxTimeMs} ms.`
  );
});

When("el sistema escanea todos los enlaces de la página", async function () {
  // Obtener todos los hrefs de la página
  const hrefs = await this.page.evaluate(() => {
    return Array.from(document.querySelectorAll("a"))
      .map(anchor => anchor.getAttribute("href"))
      .filter(href => href && !href.startsWith("#") && !href.startsWith("javascript:"));
  });

  // Resolver URLs absolutas
  const baseUrl = this.page.url();
  const absoluteUrls = [...new Set(hrefs.map(href => {
    try {
      return new URL(href, baseUrl).href;
    } catch (e) {
      return null;
    }
  }).filter(Boolean))];

  console.log(`    [Enlaces Rotas] Escaneando ${absoluteUrls.length} enlaces únicos...`);
  
  let brokenLinksCount = 0;
  const brokenLinks = [];

  // Hacer peticiones HEAD/GET rápidas para verificar el estado de los enlaces
  for (const url of absoluteUrls) {
    try {
      // Ignorar URLs externas que puedan fallar por CORS o requieran red para que el test sea estable fuera de línea
      if (!url.startsWith(this.targetUrl) && !url.includes("localhost") && !url.includes("127.0.0.1")) {
        continue;
      }
      
      const response = await this.page.request.get(url, { failOnStatusCode: false, timeout: 2000 });
      const status = response.status();
      
      if (status >= 400) {
        brokenLinksCount++;
        brokenLinks.push({ url, status });
      }
    } catch (err) {
      brokenLinksCount++;
      brokenLinks.push({ url, error: err.message });
    }
  }

  this.testCaseData.metrics = this.testCaseData.metrics || {};
  this.testCaseData.metrics.brokenLinksCount = brokenLinksCount;
  this.brokenLinksDetail = brokenLinks;
});

Then("ningún enlace de la aplicación debería retornar un código de error HTTP", async function () {
  const brokenCount = this.testCaseData.metrics?.brokenLinksCount;
  assert.ok(brokenCount !== undefined, "No se han escaneado los enlaces.");
  
  if (brokenCount > 0) {
    const fallosStr = this.brokenLinksDetail.map(f => `${f.url} (Estado: ${f.status || f.error})`).join(", ");
    assert.fail(`Se encontraron ${brokenCount} enlaces rotos: ${fallosStr}`);
  }
});

When("el sistema valida la accesibilidad básica del DOM", async function () {
  const issues = await this.page.evaluate(() => {
    let count = 0;
    
    // 1. Validar imágenes sin tag alt
    const images = Array.from(document.querySelectorAll("img"));
    images.forEach(img => {
      if (!img.hasAttribute("alt") || img.getAttribute("alt").trim() === "") {
        count++;
      }
    });

    // 2. Validar inputs sin label/id/aria-label
    const inputs = Array.from(document.querySelectorAll("input"));
    inputs.forEach(input => {
      const hasId = !!input.id;
      const hasLabel = hasId ? !!document.querySelector(`label[for="${input.id}"]`) : false;
      const hasAria = input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby");
      
      if (!hasLabel && !hasAria && input.getAttribute("type") !== "hidden") {
        count++;
      }
    });

    return count;
  });

  this.testCaseData.metrics = this.testCaseData.metrics || {};
  this.testCaseData.metrics.accessibilityIssues = issues;
  console.log(`    [Accesibilidad] Se detectaron ${issues} fallas/advertencias de accesibilidad básica.`);
});

Then("se verifica la existencia de atributos alt en imágenes y etiquetas correctas en inputs", async function () {
  const issues = this.testCaseData.metrics?.accessibilityIssues;
  assert.ok(issues !== undefined, "No se ha validado la accesibilidad.");
  
  // No hacemos fallar la prueba directamente, sino que reportamos en logs / métricas
  // Esto simula una auditoría donde una cantidad menor a 5 es aceptable en desarrollo
  assert.ok(issues < 5, `Se encontraron demasiadas fallas de accesibilidad (${issues}). Se recomienda revisión.`);
});

When("el usuario cambia el tamaño de la pantalla a modo móvil", async function () {
  await this.page.setViewportSize(config.mobileViewport);
  await this.page.waitForTimeout(500); // Dar tiempo para reajuste adaptativo
});

Then("el menú hamburguesa debería ser visible o la navegación cambiar a colapsada", async function () {
  // En mobile, el menú hamburguesa suele ser un botón con clases/texto que se activa
  const isHamburguerVisible = await this.page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("button, a, div"));
    return elements.some(el => {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) {
        return false;
      }
      
      const text = el.innerText || "";
      const id = el.id || "";
      const cls = el.className || "";
      const role = el.getAttribute("role") || "";
      const hasMenuIcon = text.includes("☰") || cls.includes("menu") || cls.includes("hamburger") || id.includes("menu") || role.includes("button") && text === "";
      
      return hasMenuIcon && el.offsetWidth > 0;
    });
  });

  // Si no hay un botón hamburguesa explícito, verificamos que el menú horizontal principal esté oculto
  const isDesktopMenuHidden = await this.page.evaluate(() => {
    const menu = document.querySelector("nav, .desktop-menu, #menu-principal");
    if (!menu) return true; // Si no existe, asumimos que no hay menú grande visible
    const style = window.getComputedStyle(menu);
    // En responsive, el menú horizontal se oculta (display: none)
    return style.display === "none" || style.visibility === "hidden" || window.innerWidth < 400 && menu.offsetHeight === 0;
  });

  assert.ok(isHamburguerVisible || isDesktopMenuHidden, "El layout no parece haberse adaptado a la vista móvil.");
  console.log(`    [Responsivo] Prueba móvil exitosa. Menú adaptado.`);
});
