# language: es
@Caso15_ResponsividadMobile
Característica: Responsividad de la Interfaz
  Como usuario móvil de Neurogym
  Quiero que la interfaz se adapte de forma responsive al ancho de mi pantalla
  Para interactuar con la plataforma desde cualquier dispositivo celular

  @no-funcional @captura-final
  Escenario: Visualización móvil adaptativa
    Dado que el usuario navega a la página de inicio
    Cuando el usuario cambia el tamaño de la pantalla a modo móvil
    Entonces el menú hamburguesa debería ser visible o la navegación cambiar a colapsada
