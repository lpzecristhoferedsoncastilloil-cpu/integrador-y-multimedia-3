# language: es
@Caso14_AccesibilidadBasica
Característica: Verificación de Accesibilidad Básica
  Como administrador de calidad de Neurogym
  Quiero auditar elementos del DOM relacionados con la accesibilidad
  Para garantizar la inclusión de usuarios con discapacidades visuales

  @no-funcional @accesibilidad
  Escenario: Auditoría básica de tags e imágenes
    Dado que el usuario navega a la página de inicio
    Cuando el sistema valida la accesibilidad básica del DOM
    Entonces se verifica la existencia de atributos alt en imágenes y etiquetas correctas en inputs
