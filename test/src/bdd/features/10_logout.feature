# language: es
@Caso10_Logout
Característica: Cierre de Sesión Seguro
  Como usuario de Neurogym
  Quiero cerrar mi sesión actual
  Para proteger la privacidad de mis datos

  Escenario: Cierre de sesión exitoso
    Dado que el usuario navega a "/dashboard"
    Cuando hace clic en el botón o enlace "logout"
    Entonces debería ser redirigido a la URL que contiene "/login"
