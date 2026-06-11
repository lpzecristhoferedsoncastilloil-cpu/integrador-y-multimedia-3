# language: es
@Caso9_InteraccionJuegos
Característica: Interacción con Sección de Juegos
  Como usuario de Neurogym
  Quiero ver la lista de juegos disponibles e iniciar uno
  Para ejercitar mis funciones cognitivas

  Escenario: Carga e inicio de juego
    Dado que el usuario navega a "/juegos"
    Entonces debería ver el texto "Juegos" en la pantalla
    Cuando hace clic en el botón o enlace "juego-memoria"
    Entonces debería ser redirigido a la URL que contiene "/jugar/memoria"
