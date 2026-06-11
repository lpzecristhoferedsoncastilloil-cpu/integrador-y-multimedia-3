# language: es
@Caso3_LoginCorreoInvalido
Característica: Inicio de Sesión Fallido por Correo Inválido
  Como usuario del portal Neurogym
  Quiero intentar ingresar con un correo mal estructurado
  Para verificar la validación del formato en el cliente o servidor

  Escenario: Inicio de sesión con correo sin formato válido
    Dado que el usuario navega a la página de inicio
    Cuando escribe "correo_sin_arroba" en el campo "email"
    Y escribe "Demo1234!" en el campo "password"
    Y hace clic en el botón o enlace "submitLogin"
    Entonces el sistema debería mostrar un mensaje de error que contiene "correo"
