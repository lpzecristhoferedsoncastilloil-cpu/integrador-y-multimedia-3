# language: es
@Caso16_RegistroPacienteMenor
Característica: Registro de Paciente Menor de Edad
  Como administrador o psicólogo clínico de Neurogym
  Quiero registrar un nuevo paciente menor de edad en la plataforma
  Para poder iniciar su seguimiento y asignar actividades de gimnasia cerebral

  @captura-final
  Escenario: Registro exitoso de paciente menor (niño) con tutor legal
    Dado que el usuario navega a la página de inicio
    Cuando el usuario introduce sus credenciales reales a través del diálogo interactivo
    Y hace clic en el botón o enlace "submitLogin"
    Entonces debería ser redirigido a la URL que contiene "/dashboard"
    Cuando hace clic en el botón o enlace "Pacientes"
    Entonces debería ser redirigido a la URL que contiene "/pacientes"
    Cuando hace clic en el botón o enlace "Nuevo Paciente"
    Y el usuario introduce datos válidos para un paciente menor de edad
    Y completa los datos obligatorios del tutor legal
    Y selecciona el psicólogo asignado
    Y hace clic en el botón o enlace "Guardar Paciente"
    Entonces el paciente debería figurar en la lista de pacientes registrados
    Y se verifica que el registro del paciente exista en la base de datos local de Neurogym
