# language: es
@Caso4_RegistroExitoso
Característica: Registro Exitoso de Nuevo Usuario
  Como nuevo usuario del portal Neurogym
  Quiero registrarme en la plataforma utilizando datos válidos
  Para poder iniciar sesión y comenzar las actividades de gimnasia cerebral

  @captura-final
  Escenario: Registro de usuario completo con datos válidos
    Dado que el usuario navega a "/registro"
    Cuando introduce datos de registro válidos generados dinámicamente
    Y hace clic en el botón o enlace "submitRegister"
    Entonces debería ser redirigido a la URL que contiene "/login"
    Y debería ver el texto "registrado" en la pantalla
