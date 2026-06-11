# language: es
@Caso6_RegistroCamposVacios
Característica: Registro Fallido por Campos Obligatorios Vacíos
  Como nuevo usuario del portal Neurogym
  Quiero intentar registrarme dejando los campos requeridos vacíos
  Para asegurar que el formulario exija el completado de los datos

  Escenario: Registro con campos vacíos
    Dado que el usuario navega a "/registro"
    Cuando introduce datos de registro inválidos de tipo "missing_fields"
    Y hace clic en el botón o enlace "submitRegister"
    Entonces el sistema debería mostrar un mensaje de error que contiene "requerido"
