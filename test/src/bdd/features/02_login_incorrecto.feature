# language: es
@Caso2_LoginIncorrecto
Característica: Inicio de Sesión Fallido por Credenciales Incorrectas
  Como usuario del portal Neurogym
  Quiero intentar ingresar con una contraseña incorrecta
  Para verificar que el sistema rechace el acceso y muestre un aviso

  Escenario: Inicio de sesión con contraseña errónea
    Dado que el usuario navega a la página de inicio
    Cuando escribe "usuario.demo@neurogym.com" en el campo "email"
    Y escribe "ContrasenaEquivocada123" en el campo "password"
    Y hace clic en el botón o enlace "submitLogin"
    Entonces el sistema debería mostrar un mensaje de error que contiene "incorrecta"
