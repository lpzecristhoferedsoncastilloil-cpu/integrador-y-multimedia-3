# language: es
@Caso1_LoginExitoso
Característica: Inicio de Sesión Exitoso (Credenciales Reales)
  Como usuario del portal Neurogym
  Quiero ingresar con mis credenciales reales a través de un diálogo interactivo
  Para acceder a mi panel principal y juegos

  Escenario: Inicio de sesión con pausa inteligente
    Dado que el usuario navega a la página de inicio
    Cuando el usuario introduce sus credenciales reales a través del diálogo interactivo
    Y hace clic en el botón o enlace "submitLogin"
    Entonces debería ser redirigido a la URL que contiene "/dashboard"
