from django.db import models


class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre_usuario = models.CharField(unique=True, max_length=50)
    correo_electronico = models.CharField(unique=True, max_length=150)
    contrasena = models.CharField(max_length=255)
    rol_usuario = models.CharField(max_length=13)
    estado_usuario = models.CharField(max_length=9, blank=True, null=True)
    foto_perfil = models.CharField(max_length=255, blank=True, null=True)
    ultima_sesion = models.DateTimeField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(blank=True, null=True)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    class Meta:
        managed = False
        db_table = 'usuarios'


class Psicologos(models.Model):
    id_psicologo = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(Usuarios, models.DO_NOTHING, db_column='id_usuario')
    nombre_completo = models.CharField(max_length=150)
    ci = models.CharField(unique=True, max_length=20)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo_profesional = models.CharField(max_length=150, blank=True, null=True)
    especialidad = models.CharField(max_length=100, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    descripcion_profesional = models.TextField(blank=True, null=True)
    foto_profesional = models.CharField(max_length=255, blank=True, null=True)
    fecha_registro = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'psicologos'


class DatosContratacionPsicologos(models.Model):
    id_contratacion = models.AutoField(primary_key=True)
    id_psicologo = models.ForeignKey(Psicologos, models.CASCADE, db_column='id_psicologo')
    correo_personal = models.CharField(max_length=150)
    edad = models.IntegerField()
    ciudad_origen = models.CharField(max_length=100)
    telefono_referencia = models.CharField(max_length=20)
    universidad_egreso = models.CharField(max_length=150)
    estudios_adicionales = models.TextField(blank=True, null=True)
    archivo_cv = models.CharField(max_length=255, blank=True, null=True)
    archivo_especialidad = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'datos_contratacion_psicologos'


class Padres(models.Model):
    id_padre = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente')
    nombre_completo = models.CharField(max_length=150)
    parentesco = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo_electronico = models.CharField(max_length=150, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'padres'


class Pacientes(models.Model):
    id_paciente = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(Usuarios, models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)
    id_psicologo = models.ForeignKey(Psicologos, models.DO_NOTHING, db_column='id_psicologo')
    nombre_completo = models.CharField(max_length=150)
    fecha_nacimiento = models.DateField()
    edad_actual = models.IntegerField(blank=True, null=True)
    genero = models.CharField(max_length=9)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo_electronico = models.CharField(max_length=150, blank=True, null=True)
    colegio_ocupacion = models.CharField(max_length=150, blank=True, null=True)
    motivo_consulta = models.TextField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    observaciones_generales = models.TextField(blank=True, null=True)
    foto_paciente = models.CharField(max_length=255, blank=True, null=True)
    fecha_registro = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes'


class Citas(models.Model):
    id_cita = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_psicologo = models.ForeignKey(Psicologos, models.DO_NOTHING, db_column='id_psicologo')
    titulo_cita = models.CharField(max_length=150)
    descripcion_cita = models.TextField(blank=True, null=True)
    fecha_cita = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado_cita = models.CharField(max_length=10, blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'citas'


class Historiales(models.Model):
    id_historial = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_psicologo = models.ForeignKey(Psicologos, models.DO_NOTHING, db_column='id_psicologo')
    titulo_historial = models.CharField(max_length=150, blank=True, null=True)
    descripcion_historial = models.TextField(blank=True, null=True)
    fecha_historial = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historiales'


class HistorialesArchivos(models.Model):
    id_archivo = models.AutoField(primary_key=True)
    id_historial = models.ForeignKey(Historiales, models.DO_NOTHING, db_column='id_historial')
    nombre_archivo = models.CharField(max_length=200, blank=True, null=True)
    ruta_archivo = models.CharField(max_length=255, blank=True, null=True)
    tipo_archivo = models.CharField(max_length=50, blank=True, null=True)
    fecha_subida = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historialesarchivos'


class Notas(models.Model):
    id_nota = models.AutoField(primary_key=True)
    id_historial = models.ForeignKey(Historiales, models.DO_NOTHING, db_column='id_historial')
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_psicologo = models.ForeignKey(Psicologos, models.DO_NOTHING, db_column='id_psicologo')
    titulo_nota = models.CharField(max_length=150, blank=True, null=True)
    descripcion_nota = models.TextField(blank=True, null=True)
    fecha_nota = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'notas'


class Tests(models.Model):
    id_test = models.AutoField(primary_key=True)
    id_psicologo = models.ForeignKey(Psicologos, models.DO_NOTHING, db_column='id_psicologo')
    titulo_test = models.CharField(max_length=150, blank=True, null=True)
    descripcion_test = models.TextField(blank=True, null=True)
    categoria_test = models.CharField(max_length=100, blank=True, null=True)
    tipo_test = models.CharField(max_length=100, blank=True, null=True)
    observaciones_test = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tests'


class Preguntas(models.Model):
    id_pregunta = models.AutoField(primary_key=True)
    id_subnivel = models.ForeignKey('Subniveles', models.DO_NOTHING, db_column='id_subnivel')
    pregunta_texto = models.TextField(blank=True, null=True)
    tipo_pregunta = models.CharField(max_length=100, blank=True, null=True)
    tiempo_pregunta = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'preguntas'


class OpcionesPreguntas(models.Model):
    id_opcion_pregunta = models.AutoField(primary_key=True)
    id_pregunta = models.ForeignKey(Preguntas, models.DO_NOTHING, db_column='id_pregunta')
    texto_opcion = models.CharField(max_length=255, blank=True, null=True)
    es_correcta = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opcionespreguntas'


class TestArchivos(models.Model):
    id_test_archivo = models.AutoField(primary_key=True)
    id_test = models.ForeignKey(Tests, models.DO_NOTHING, db_column='id_test')
    nombre_archivo = models.CharField(max_length=200, blank=True, null=True)
    ruta_archivo = models.CharField(max_length=255, blank=True, null=True)
    tipo_archivo = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'testarchivos'


class Reportes(models.Model):
    id_reporte = models.AutoField(primary_key=True)
    id_psicologo = models.ForeignKey(Psicologos, models.DO_NOTHING, db_column='id_psicologo')
    titulo_reporte = models.CharField(max_length=150, blank=True, null=True)
    descripcion_reporte = models.TextField(blank=True, null=True)
    ruta_reporte = models.CharField(max_length=255, blank=True, null=True)
    fecha_generacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reportes'


class Notificaciones(models.Model):
    id_notificacion = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usuario')
    titulo_notificacion = models.CharField(max_length=150, blank=True, null=True)
    mensaje_notificacion = models.TextField(blank=True, null=True)
    estado_notificacion = models.CharField(max_length=8, blank=True, null=True)
    fecha_notificacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'notificaciones'


class Configuraciones(models.Model):
    id_configuracion = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usuario')
    clave_configuracion = models.CharField(max_length=100, blank=True, null=True)
    valor_configuracion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'configuraciones'


# ---- JUEGOS ----

class Juegosfonologicos(models.Model):
    id_juego_fonologico = models.AutoField(primary_key=True)
    nombre_juego = models.CharField(max_length=150, blank=True, null=True)
    descripcion_juego = models.TextField(blank=True, null=True)
    dificultad_general = models.CharField(max_length=50, blank=True, null=True)
    portada_juego = models.CharField(max_length=255, blank=True, null=True)
    estado_juego = models.CharField(max_length=8, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'juegosfonologicos'


class Juegosmixtos(models.Model):
    id_juego_mixto = models.AutoField(primary_key=True)
    nombre_juego = models.CharField(max_length=150, blank=True, null=True)
    descripcion_juego = models.TextField(blank=True, null=True)
    estado_juego = models.CharField(max_length=8, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'juegosmixtos'


class Juegossuperficiales(models.Model):
    id_juego_superficial = models.AutoField(primary_key=True)
    nombre_juego = models.CharField(max_length=150, blank=True, null=True)
    descripcion_juego = models.TextField(blank=True, null=True)
    estado_juego = models.CharField(max_length=8, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'juegossuperficiales'


class Niveles(models.Model):
    id_nivel = models.AutoField(primary_key=True)
    tipo_dislexia = models.CharField(max_length=11)
    id_juego = models.IntegerField()
    nombre_nivel = models.CharField(max_length=150, blank=True, null=True)
    dificultad_nivel = models.CharField(max_length=7)
    orden_nivel = models.IntegerField(blank=True, null=True)
    tiempo_limite = models.IntegerField(blank=True, null=True)
    cantidad_intentos = models.IntegerField(blank=True, null=True)
    fondo_nivel = models.CharField(max_length=255, blank=True, null=True)
    musica_nivel = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'niveles'


class Subniveles(models.Model):
    id_subnivel = models.AutoField(primary_key=True)
    id_nivel = models.ForeignKey(Niveles, models.DO_NOTHING, db_column='id_nivel')
    nombre_subnivel = models.CharField(max_length=150, blank=True, null=True)
    tipo_actividad = models.CharField(max_length=100, blank=True, null=True)
    cantidad_ejercicios = models.IntegerField(blank=True, null=True)
    orden_subnivel = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'subniveles'


class Palabras(models.Model):
    id_palabra = models.AutoField(primary_key=True)
    texto_palabra = models.CharField(max_length=200, blank=True, null=True)
    silabas_palabra = models.CharField(max_length=200, blank=True, null=True)
    imagen_palabra = models.CharField(max_length=255, blank=True, null=True)
    audio_palabra = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'palabras'


class Personajes(models.Model):
    id_personaje = models.AutoField(primary_key=True)
    nombre_personaje = models.CharField(max_length=100, blank=True, null=True)
    imagen_personaje = models.CharField(max_length=255, blank=True, null=True)
    descripcion_personaje = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'personajes'


class Recompensas(models.Model):
    id_recompensa = models.AutoField(primary_key=True)
    nombre_recompensa = models.CharField(max_length=100, blank=True, null=True)
    descripcion_recompensa = models.TextField(blank=True, null=True)
    imagen_recompensa = models.CharField(max_length=255, blank=True, null=True)
    puntos_requeridos = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'recompensas'


class Resultadosjuegos(models.Model):
    id_resultado_juego = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_nivel = models.ForeignKey(Niveles, models.DO_NOTHING, db_column='id_nivel')
    id_subnivel = models.ForeignKey(Subniveles, models.DO_NOTHING, db_column='id_subnivel')
    nombre_juego = models.CharField(max_length=150, blank=True, null=True)
    respuestas_correctas = models.IntegerField(blank=True, null=True)
    respuestas_incorrectas = models.IntegerField(blank=True, null=True)
    respuestas_sin_responder = models.IntegerField(blank=True, null=True)
    preguntas_totales = models.IntegerField(blank=True, null=True)
    tiempo_jugado_segundos = models.IntegerField(blank=True, null=True)
    estrellas_ganadas = models.IntegerField(blank=True, null=True)
    niveles_completados = models.IntegerField(blank=True, null=True)
    porcentaje_resultado = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    cantidad_audios_enviados = models.IntegerField(blank=True, null=True)
    cantidad_pronunciaciones_correctas = models.IntegerField(blank=True, null=True)
    cantidad_pronunciaciones_incorrectas = models.IntegerField(blank=True, null=True)
    estado_resultado = models.CharField(max_length=10, blank=True, null=True)
    fecha_resultado = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'resultadosjuegos'


class Progresosniveles(models.Model):
    id_progreso = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_nivel = models.ForeignKey(Niveles, models.DO_NOTHING, db_column='id_nivel')
    completado = models.IntegerField(blank=True, null=True)
    estrellas = models.IntegerField(blank=True, null=True)
    fecha_progreso = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'progresosniveles'


class Actividadespacientes(models.Model):
    id_actividad = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente')
    id_test = models.ForeignKey(Tests, models.DO_NOTHING, db_column='id_test', blank=True, null=True)
    descripcion_actividad = models.TextField(blank=True, null=True)
    resultado_actividad = models.TextField(blank=True, null=True)
    puntaje_actividad = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    fecha_actividad = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'actividadespacientes'


class ConfiguracionSmtp(models.Model):
    id = models.AutoField(primary_key=True)
    correo_emisor = models.CharField(max_length=150)
    contrasena_aplicacion = models.CharField(max_length=100)
    servidor_smtp = models.CharField(max_length=150)
    puerto = models.IntegerField()
    use_tls = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'configuracion_smtp'


class OpcionesAvatar(models.Model):
    id_opcion = models.AutoField(primary_key=True)
    tipo_pieza = models.CharField(max_length=50)
    ruta_recurso = models.CharField(max_length=255)
    nombre_estilo = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'opciones_avatar'


class EstilosAvatar3d(models.Model):
    id_estilo = models.AutoField(primary_key=True)
    categoria = models.CharField(max_length=50)
    nombre_estilo = models.CharField(max_length=150)
    ruta_recurso = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'estilos_avatar3d'


class AvatarPaciente(models.Model):
    id_avatar_paciente = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Pacientes, models.CASCADE, db_column='id_paciente')
    id_rostro = models.ForeignKey(EstilosAvatar3d, models.SET_NULL, null=True, blank=True, db_column='id_rostro', related_name='avatar_rostro')
    id_ojos = models.ForeignKey(EstilosAvatar3d, models.SET_NULL, null=True, blank=True, db_column='id_ojos', related_name='avatar_ojos')
    id_cabello = models.ForeignKey(EstilosAvatar3d, models.SET_NULL, null=True, blank=True, db_column='id_cabello', related_name='avatar_cabello')
    id_gorra = models.ForeignKey(EstilosAvatar3d, models.SET_NULL, null=True, blank=True, db_column='id_gorra', related_name='avatar_gorra')
    id_lentes = models.ForeignKey(EstilosAvatar3d, models.SET_NULL, null=True, blank=True, db_column='id_lentes', related_name='avatar_lentes')
    color_piel = models.CharField(max_length=50, null=True, blank=True)
    color_ojos = models.CharField(max_length=50, null=True, blank=True)
    color_cabello = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'avatar_paciente'


class MensajesAdmin(models.Model):
    id_mensaje = models.AutoField(primary_key=True)
    id_emisor = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_emisor', related_name='mensajes_enviados')
    id_receptor = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_receptor', related_name='mensajes_recibidos')
    titulo = models.CharField(max_length=150, default='Mensaje de Administrador')
    contenido = models.TextField()
    leido = models.BooleanField(default=False)
    fecha_envio = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'mensajes_admin'
