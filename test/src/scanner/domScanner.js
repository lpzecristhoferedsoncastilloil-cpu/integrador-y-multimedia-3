/**
 * Escáner dinámico e inteligente de DOM.
 * Utiliza heurísticas para identificar y mapear elementos de la interfaz de usuario
 * de forma tolerante a fallos y cambios estructurales.
 */

// Heurísticas de palabras clave en español e inglés
const KEYWORDS = {
  email: [/correo/i, /email/i, /usuario/i, /user/i, /login/i],
  password: [/contrase/i, /password/i, /clave/i, /pass/i],
  confirmPassword: [/confirm/i, /repetir/i, /repita/i, /retype/i],
  firstName: [/nombre/i, /first.*name/i, /name/i],
  lastName: [/apellido/i, /last.*name/i],
  phone: [/tel/i, /cel/i, /phone/i, /m[oó]vil/i],
  
  submitLogin: [/iniciar.*sesi[oó]n/i, /login/i, /entrar/i, /ingresar/i, /sign.*in/i],
  submitRegister: [/registrar/i, /crear.*cuenta/i, /sign.*up/i, /enviar/i, /submit/i],
  forgotPassword: [/olvid/i, /recuperar/i, /forgot/i, /restaurar/i],
  logout: [/cerrar.*sesi[oó]n/i, /logout/i, /salir/i, /sign.*out/i]
};

/**
 * Escanea el DOM activo en la página actual y devuelve un mapa de selectores recomendados
 * para campos y botones críticos.
 */
export async function scanPage(page) {
  // Ejecutamos código directamente en el contexto del navegador para inspeccionar el DOM
  const elementsMap = await page.evaluate(() => {
    const map = {};

    // Helper para verificar texto o atributos contra regex
    function matches(text, regexPattern) {
      if (!text) return false;
      const flags = regexPattern.flags || 'i';
      const source = regexPattern.source;
      const regex = new RegExp(source, flags);
      return regex.test(text);
    }

    // Helper para obtener un selector XPath único y robusto
    function getXPath(element) {
      if (element.id) {
        return `//*[@id="${element.id}"]`;
      }
      if (element === document.body) {
        return '/html/body';
      }
      
      let ix = 0;
      const siblings = element.parentNode ? element.parentNode.childNodes : [];
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
          return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          ix++;
        }
      }
      return '';
    }

    // Helper para buscar labels asociados a un input
    function getLabelText(input) {
      if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label && label.innerText) return label.innerText.trim();
      }
      let parent = input.parentElement;
      while (parent) {
        if (parent.tagName === 'LABEL') {
          return parent.innerText.trim();
        }
        parent = parent.parentElement;
      }
      return '';
    }

    // 1. Escanear INPUTS (Campos de formulario)
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    inputs.forEach(input => {
      const id = input.id || '';
      const name = input.getAttribute('name') || '';
      const placeholder = input.getAttribute('placeholder') || '';
      const labelText = getLabelText(input);
      const type = input.getAttribute('type') || '';
      
      const searchString = `${id} ${name} ${placeholder} ${labelText}`.toLowerCase();

      // Heurística para campos de contraseña
      if (type === 'password') {
        // ¿Es confirmación?
        if (matches(searchString, /confirm|repetir|repita|retype/i)) {
          map.confirmPassword = getXPath(input);
        } else {
          map.password = getXPath(input);
        }
        return;
      }

      // Heurística para email/usuario
      if (type === 'email' || matches(searchString, /correo|email|usuario|user|login/i)) {
        if (!map.email) {
          map.email = getXPath(input);
        }
        return;
      }

      // Heurística para nombres y apellidos
      if (matches(searchString, /nombre|first.*name/i)) {
        if (!map.firstName) map.firstName = getXPath(input);
        return;
      }
      if (matches(searchString, /apellido|last.*name/i)) {
        if (!map.lastName) map.lastName = getXPath(input);
        return;
      }

      // Heurística para teléfono
      if (type === 'tel' || matches(searchString, /tel|cel|phone|m[oó]vil/i)) {
        if (!map.phone) map.phone = getXPath(input);
        return;
      }
    });

    // 2. Escanear BOTONES y ENLACES accionables
    const clickables = Array.from(document.querySelectorAll('button, input[type="submit"], a, [role="button"]'));
    clickables.forEach(elem => {
      const text = elem.innerText ? elem.innerText.trim() : '';
      const id = elem.id || '';
      const name = elem.getAttribute('name') || '';
      const role = elem.getAttribute('role') || '';
      const ariaLabel = elem.getAttribute('aria-label') || '';
      
      const searchString = `${text} ${id} ${name} ${role} ${ariaLabel}`.toLowerCase();

      // Heurística para Login
      if (matches(searchString, /iniciar.*sesi[oó]n|login|entrar|ingresar|sign.*in/i)) {
        if (!map.submitLogin) map.submitLogin = getXPath(elem);
        return;
      }

      // Heurística para Registro
      if (matches(searchString, /registrar|crear.*cuenta|sign.*up|enviar|submit/i)) {
        if (!map.submitRegister) map.submitRegister = getXPath(elem);
        return;
      }

      // Heurística para Olvido de Contraseña
      if (matches(searchString, /olvid|recuperar|forgot|restaurar/i)) {
        if (!map.forgotPassword) map.forgotPassword = getXPath(elem);
        return;
      }

      // Heurística para Logout
      if (matches(searchString, /cerrar.*sesi[oó]n|logout|salir|sign.*out/i)) {
        if (!map.logout) map.logout = getXPath(elem);
        return;
      }
    });

    return map;
  });

  return elementsMap;
}

/**
 * Obtiene de forma tolerante a fallos un elemento de la página.
 * Si el selector mapeado no responde o no existe, escanea la página de nuevo.
 * Si aún así no se encuentra por xpath físico, intenta buscar utilizando locators nativos de Playwright basados en texto y roles.
 */
export async function getLocator(page, elementKey, activeMap = {}) {
  // 1. Intentar con el mapa activo si existe
  let xpath = activeMap[elementKey];
  
  if (xpath) {
    const locator = page.locator(xpath);
    // Verificar si el elemento está visible con un timeout corto
    try {
      await locator.waitFor({ state: "visible", timeout: 1000 });
      return locator;
    } catch (e) {
      // Si falla, procedemos al re-escaneo
    }
  }

  // 2. Escaneo en caliente si falló o no estaba mapeado
  const freshMap = await scanPage(page);
  Object.assign(activeMap, freshMap); // Actualizar mapa activo
  xpath = freshMap[elementKey];

  if (xpath) {
    const locator = page.locator(xpath);
    try {
      await locator.waitFor({ state: "visible", timeout: 1500 });
      return locator;
    } catch (e) {
      // Continuar al plan de contingencia (locators semánticos nativos)
    }
  }

  // 3. Fallback: Localizadores Semánticos basados en patrones del framework
  const regexPatterns = KEYWORDS[elementKey];
  if (!regexPatterns) {
    throw new Error(`Clave de elemento desconocida para el escaneo: ${elementKey}`);
  }

  // Iterar sobre las expresiones regulares asociadas
  for (const regex of regexPatterns) {
    // Intentar buscar por rol de botón si la clave es de submit/action
    if (elementKey.startsWith("submit") || elementKey === "logout") {
      const loc = page.getByRole("button", { name: regex });
      if (await loc.isVisible().catch(() => false)) return loc;

      const locLink = page.getByRole("link", { name: regex });
      if (await locLink.isVisible().catch(() => false)) return locLink;

      // Buscar por texto general
      const locText = page.locator(`text=${regex.source}`);
      if (await locText.isVisible().catch(() => false)) return locText;
    } 
    // Si es un campo de formulario
    else if (elementKey === "email" || elementKey === "username") {
      const locPl = page.getByPlaceholder(regex);
      if (await locPl.isVisible().catch(() => false)) return locPl;

      const locLbl = page.getByLabel(regex);
      if (await locLbl.isVisible().catch(() => false)) return locLbl;

      const locText = page.locator("input").filter({ hasText: regex });
      if (await locText.isVisible().catch(() => false)) return locText;
    } 
    else if (elementKey === "password" || elementKey === "confirmPassword") {
      const locPl = page.getByPlaceholder(regex);
      if (await locPl.isVisible().catch(() => false)) return locPl;
      
      const locPass = page.locator('input[type="password"]');
      if (await locPass.count() > 0) {
        if (elementKey === "confirmPassword" && await locPass.count() > 1) {
          return locPass.nth(1); // El segundo input de contraseña suele ser confirmación
        }
        return locPass.first();
      }
    }
    else {
      // General input fallback
      const locPl = page.getByPlaceholder(regex);
      if (await locPl.isVisible().catch(() => false)) return locPl;

      const locLbl = page.getByLabel(regex);
      if (await locLbl.isVisible().catch(() => false)) return locLbl;
    }
  }

  // Si llegamos aquí, no pudimos identificar el elemento automáticamente
  throw new Error(`No se pudo localizar de forma inteligente el elemento para la clave: "${elementKey}". Por favor revisa la estructura de la página.`);
}
