# language: es
@Caso13_EnlacesRotos
Característica: Verificación de Enlaces Rotos
  Como administrador de calidad de Neurogym
  Quiero escanear los enlaces hipervínculos de la página
  Para certificar que no haya páginas caídas (404) que dañen la experiencia

  @no-funcional
  Escenario: Escaneo de enlaces en el portal
    Dado que el usuario navega a la página de inicio
    Cuando el sistema escanea todos los enlaces de la página
    Entonces ningún enlace de la aplicación debería retornar un código de error HTTP
