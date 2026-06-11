# language: es
@Caso11_EdicionPerfil
Característica: Edición del Perfil de Usuario
  Como usuario registrado de Neurogym
  Quiero cambiar los detalles de mi perfil
  Para mantener mis datos actualizados en la plataforma

  Escenario: Edición de nombre y guardado exitoso
    Dado que el usuario navega a "/perfil"
    Cuando modifica los datos de su perfil con información nueva
    Y hace clic en el botón o enlace "submitRegister"
    Entonces debería ver el texto "Perfil actualizado" en la pantalla
