# language: es
@Caso17_RegistroPacienteMayor
Característica: Registro de Paciente Mayor de Edad
  Como administrador o psicólogo clínico de Neurogym
  Quiero registrar un nuevo paciente adulto en la plataforma
  Para poder iniciar su seguimiento y asignar actividades de gimnasia cerebral

  @captura-final
  Escenario: Registro exitoso de paciente mayor de edad
    Dado que el usuario navega a la página de inicio
    Cuando el usuario introduce sus credenciales reales a través del diálogo interactivo
    Y hace clic en el botón o enlace "submitLogin"
    Entonces debería ser redirigido a la URL que contiene "/dashboard"
    Cuando hace clic en el botón o enlace "Pacientes"
    Entonces debería ser redirigido a la URL que contiene "/pacientes"
    Cuando hace clic en el botón o enlace "Nuevo Paciente"
    Y el usuario introduce datos válidos para un paciente mayor de edad
    Y selecciona el psicólogo asignado
    Y hace clic en el botón o enlace "Guardar Paciente"
    Entonces el paciente debería figurar en la lista de pacientes registrados
    Y se verifica que el registro del paciente exista en la base de datos local de Neurogym
