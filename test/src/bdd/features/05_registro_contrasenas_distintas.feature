# language: es
@Caso5_RegistroContrasenasDiferentes
Característica: Registro Fallido por Contraseñas No Coincidentes
  Como nuevo usuario del portal Neurogym
  Quiero intentar registrarme con contraseñas que no coinciden
  Para verificar que el sistema valide la concordancia y evite el registro

  Escenario: Registro con contraseñas dispares
    Dado que el usuario navega a "/registro"
    Cuando introduce datos de registro inválidos de tipo "passwords_mismatch"
    Y hace clic en el botón o enlace "submitRegister"
    Entonces el sistema debería mostrar un mensaje de error que contiene "coinciden"
