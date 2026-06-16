from rest_framework import serializers
from .models import *


class UsuariosSerializer(serializers.ModelSerializer):
    id_psicologo = serializers.SerializerMethodField()

    class Meta:
        model = Usuarios
        fields = ['id_usuario', 'nombre_usuario', 'correo_electronico', 'rol_usuario', 'estado_usuario', 'foto_perfil', 'fecha_creacion', 'id_psicologo']

    def get_id_psicologo(self, obj):
        try:
            p = Psicologos.objects.filter(id_usuario=obj.id_usuario).first()
            return p.id_psicologo if p else None
        except Exception:
            return None


class LoginSerializer(serializers.Serializer):
    correo_electronico = serializers.EmailField()
    contrasena = serializers.CharField()


class PsicologosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psicologos
        fields = ['id_psicologo', 'nombre_completo', 'ci', 'telefono', 'correo_profesional', 'especialidad', 'foto_profesional']


class PadresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Padres
        fields = '__all__'


class PacientesSerializer(serializers.ModelSerializer):
    psicologo_nombre = serializers.SerializerMethodField()

    def get_psicologo_nombre(self, obj):
        try:
            return obj.id_psicologo.nombre_completo if obj.id_psicologo else None
        except Exception:
            return None

    class Meta:
        model = Pacientes
        fields = [
            'id_paciente', 'nombre_completo', 'fecha_nacimiento', 'edad_actual',
            'genero', 'telefono', 'correo_electronico', 'colegio_ocupacion',
            'motivo_consulta', 'observaciones_generales', 'foto_paciente',
            'fecha_registro', 'id_psicologo', 'psicologo_nombre'
        ]


class CitasSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='id_paciente.nombre_completo', read_only=True)
    psicologo_nombre = serializers.CharField(source='id_psicologo.nombre_completo', read_only=True)

    class Meta:
        model = Citas
        fields = [
            'id_cita', 'titulo_cita', 'descripcion_cita', 'fecha_cita',
            'hora_inicio', 'hora_fin', 'estado_cita', 'observaciones',
            'fecha_registro', 'id_paciente', 'id_psicologo',
            'paciente_nombre', 'psicologo_nombre'
        ]


class HistorialesSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='id_paciente.nombre_completo', read_only=True)

    class Meta:
        model = Historiales
        fields = '__all__'


class NotasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notas
        fields = '__all__'


class OpcionesPreguntasSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcionesPreguntas
        fields = ['id_opcion_pregunta', 'texto_opcion', 'es_correcta']


class PreguntasSerializer(serializers.ModelSerializer):
    opciones = OpcionesPreguntasSerializer(many=True, read_only=True, source='opcionespreguntas_set')

    class Meta:
        model = Preguntas
        fields = ['id_pregunta', 'pregunta_texto', 'tipo_pregunta', 'tiempo_pregunta', 'opciones']


class TestArchivosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestArchivos
        fields = '__all__'


class TestsSerializer(serializers.ModelSerializer):
    preguntas = serializers.SerializerMethodField()
    archivos = TestArchivosSerializer(many=True, read_only=True, source='testarchivos_set')
    psicologo_nombre = serializers.CharField(source='id_psicologo.nombre_completo', read_only=True)

    class Meta:
        model = Tests
        fields = [
            'id_test', 'titulo_test', 'descripcion_test', 'categoria_test',
            'tipo_test', 'observaciones_test', 'fecha_creacion',
            'id_psicologo', 'psicologo_nombre', 'preguntas', 'archivos'
        ]

    def get_preguntas(self, obj):
        return []


class ReportesSerializer(serializers.ModelSerializer):
    psicologo_nombre = serializers.CharField(source='id_psicologo.nombre_completo', read_only=True)

    class Meta:
        model = Reportes
        fields = '__all__'


class NotificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificaciones
        fields = '__all__'


class NivelesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niveles
        fields = '__all__'


class SubnivelesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subniveles
        fields = '__all__'


class JuegosfonologicosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Juegosfonologicos
        fields = '__all__'


class ResultadosjuegosSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='id_paciente.nombre_completo', read_only=True)
    nivel_nombre = serializers.CharField(source='id_nivel.nombre_nivel', read_only=True)

    class Meta:
        model = Resultadosjuegos
        fields = '__all__'


class ConfiguracionSmtpSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionSmtp
        fields = '__all__'


class OpcionesAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcionesAvatar
        fields = '__all__'


class EstilosAvatar3dSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstilosAvatar3d
        fields = '__all__'


class AvatarPacienteSerializer(serializers.ModelSerializer):
    rostro_recurso = serializers.SerializerMethodField()
    ojos_recurso = serializers.SerializerMethodField()
    cabello_recurso = serializers.SerializerMethodField()
    gorra_recurso = serializers.SerializerMethodField()
    lentes_recurso = serializers.SerializerMethodField()

    class Meta:
        model = AvatarPaciente
        fields = '__all__'

    def get_rostro_recurso(self, obj):
        return obj.id_rostro.ruta_recurso if obj.id_rostro else 'rostro_redondo'

    def get_ojos_recurso(self, obj):
        return obj.id_ojos.ruta_recurso if obj.id_ojos else 'ojos_felices'

    def get_cabello_recurso(self, obj):
        return obj.id_cabello.ruta_recurso if obj.id_cabello else 'cabello_corto'

    def get_gorra_recurso(self, obj):
        return obj.id_gorra.ruta_recurso if obj.id_gorra else None

    def get_lentes_recurso(self, obj):
        return obj.id_lentes.ruta_recurso if obj.id_lentes else None

class MensajesAdminSerializer(serializers.ModelSerializer):
    emisor_nombre = serializers.CharField(source='id_emisor.nombre_usuario', read_only=True)
    receptor_nombre = serializers.CharField(source='id_receptor.nombre_usuario', read_only=True)

    class Meta:
        model = MensajesAdmin
        fields = ['id_mensaje', 'id_emisor', 'id_receptor', 'titulo', 'contenido', 'leido', 'fecha_envio', 'emisor_nombre', 'receptor_nombre']
