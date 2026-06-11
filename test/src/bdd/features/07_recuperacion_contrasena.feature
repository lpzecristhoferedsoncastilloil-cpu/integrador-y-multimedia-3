# language: es
@Caso7_RecuperacionContrasena
Característica: Recuperación de Contraseña
  Como usuario registrado de Neurogym que olvidó sus datos de acceso
  Quiero solicitar el restablecimiento de mi clave
  Para poder acceder a mi cuenta nuevamente

  Escenario: Solicitud de recuperación exitosa
    Dado que el usuario navega a "/login"
    Cuando hace clic en el botón o enlace "forgotPassword"
    Entonces debería ser redirigido a la URL que contiene "/forgot-password"
    Cuando escribe "usuario.demo@neurogym.com" en el campo "email"
    Y hace clic en el botón o enlace "submitRegister"
    Entonces el sistema debería mostrar un mensaje de error que contiene "enviado"
