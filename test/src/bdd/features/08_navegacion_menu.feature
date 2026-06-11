# language: es
@Caso8_NavegacionMenu
Característica: Navegación del Menú Principal
  Como usuario autenticado de Neurogym
  Quiero navegar a través de las diferentes secciones del portal
  Para acceder a las distintas funcionalidades con facilidad

  Escenario: Transición entre páginas del panel principal
    Dado que el usuario navega a "/dashboard"
    Cuando hace clic en el botón o enlace "juegos"
    Entonces debería ser redirigido a la URL que contiene "/juegos"
    Cuando hace clic en el botón o enlace "perfil"
    Entonces debería ser redirigido a la URL que contiene "/perfil"
