/**
 * ElementMapper
 * Caché de selectores por URL para evitar re-escanear el DOM
 * en cada interacción, mejorando la velocidad de las pruebas.
 */
export class ElementMapper {
  constructor() {
    this.cache = {};
  }

  /**
   * Guarda un mapa de elementos para una URL dada.
   */
  saveMap(url, map) {
    const cleanUrl = this._cleanUrl(url);
    this.cache[cleanUrl] = {
      ...this.cache[cleanUrl],
      ...map,
      timestamp: Date.now()
    };
  }

  /**
   * Obtiene el mapa de elementos para una URL dada.
   */
  getMap(url) {
    const cleanUrl = this._cleanUrl(url);
    return this.cache[cleanUrl] || {};
  }

  /**
   * Limpia el caché de una URL o todo el caché.
   */
  clear(url = null) {
    if (url) {
      delete this.cache[this._cleanUrl(url)];
    } else {
      this.cache = {};
    }
  }

  /**
   * Normaliza la URL removiendo query strings y hashes para que el mapeo
   * funcione en la misma ruta lógica del sitio.
   */
  _cleanUrl(url) {
    try {
      const parsed = new URL(url);
      return `${parsed.origin}${parsed.pathname}`;
    } catch (e) {
      return url;
    }
  }
}

export const elementMapper = new ElementMapper();
