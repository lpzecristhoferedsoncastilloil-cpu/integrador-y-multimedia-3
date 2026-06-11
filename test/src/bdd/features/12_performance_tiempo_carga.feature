# language: es
@Caso12_PerformanceTiempoCarga
Característica: Tiempo de Carga de la Página de Inicio
  Como administrador de calidad de Neurogym
  Quiero medir el tiempo de carga del portal principal
  Para garantizar una buena experiencia de usuario y rendimiento óptimo

  @no-funcional @rendimiento
  Escenario: Carga rápida de la landing page
    Dado que el usuario navega a la página de inicio
    Cuando el usuario mide el tiempo de carga de la página
    Entonces la página debería responder en menos de 3000 milisegundos
