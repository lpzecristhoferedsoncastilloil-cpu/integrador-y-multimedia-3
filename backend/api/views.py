from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
import hashlib

from .serializers import *
from .models import *


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        correo = request.data.get('correo_electronico', '')
        contrasena = request.data.get('contrasena', '')

        try:
            usuario = Usuarios.objects.get(correo_electronico=correo)
        except Usuarios.DoesNotExist:
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        if usuario.estado_usuario and usuario.estado_usuario.upper() not in ['ACTIVO', 'ACTIVE']:
            return Response({'error': 'Usuario inactivo'}, status=401)

        # Acepta contraseña en texto plano o hasheada
        if usuario.contrasena != contrasena and usuario.contrasena != hash_password(contrasena):
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        refresh = RefreshToken()
        refresh['user_id'] = usuario.id_usuario
        refresh['correo'] = usuario.correo_electronico
        refresh['rol'] = usuario.rol_usuario
        refresh['nombre'] = usuario.nombre_usuario

        # Guardar ultima sesion
        from django.utils import timezone as tz
        Usuarios.objects.filter(pk=usuario.pk).update(ultima_sesion=tz.now())

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': UsuariosSerializer(usuario).data
        })


class DashboardView(APIView):
    def get(self, request):
        hoy = timezone.now().date()
        year = hoy.year
        
        # Pacientes por mes en el año actual
        pacientes_por_mes = [0] * 12
        for p in Pacientes.objects.all():
            dt = p.fecha_registro or timezone.now()
            if dt.year == year:
                pacientes_por_mes[dt.month - 1] += 1
                
        # Sesiones por mes en el año actual
        sesiones_por_mes = [0] * 12
        for r in Resultadosjuegos.objects.filter(fecha_resultado__year=year):
            m = r.fecha_resultado.month
            sesiones_por_mes[m - 1] += 1

        # Citas del mes actual
        citas_este_mes = Citas.objects.filter(fecha_cita__year=year, fecha_cita__month=hoy.month)
        total_citas_completadas = citas_este_mes.filter(estado_cita__iexact='REALIZADA').count()
        total_citas_mes = citas_este_mes.count()

        # Reportes del mes actual
        total_reportes = Reportes.objects.count()
        reportes_este_mes = Reportes.objects.filter(fecha_generacion__year=year, fecha_generacion__month=hoy.month).count()

        # Juegos jugados este mes
        sesiones_este_mes = Resultadosjuegos.objects.filter(fecha_resultado__year=year, fecha_resultado__month=hoy.month).count()

        # Pacientes registrados este mes
        pacientes_este_mes = sum(
            1 for p in Pacientes.objects.all()
            if (p.fecha_registro.month if p.fecha_registro else hoy.month) == hoy.month
            and (p.fecha_registro.year if p.fecha_registro else hoy.year) == year
        )

        return Response({
            'total_pacientes': Pacientes.objects.count(),
            'total_citas_hoy': Citas.objects.filter(fecha_cita=hoy).count(),
            'total_juegos_jugados': Resultadosjuegos.objects.count(),
            'total_reportes': total_reportes,
            'citas_pendientes': Citas.objects.filter(estado_cita__iexact='PENDIENTE').count(),
            'total_tests': Tests.objects.count(),
            
            # Datos de gráficos reales en tiempo real
            'grafico_sesiones': sesiones_por_mes,
            'grafico_pacientes': pacientes_por_mes,
            
            # Metas del mes actual reales en tiempo real
            'meta_sesiones_actual': sesiones_este_mes,
            'meta_sesiones_total': 50,
            'meta_pacientes_actual': pacientes_este_mes,
            'meta_pacientes_total': 20,
            'meta_reportes_actual': reportes_este_mes,
            'meta_reportes_total': 10,
            'meta_citas_actual': total_citas_completadas,
            'meta_citas_total': total_citas_mes if total_citas_mes > 0 else 10,
        })


class PadresViewSet(viewsets.ModelViewSet):
    queryset = Padres.objects.all()
    serializer_class = PadresSerializer


class PacientesViewSet(viewsets.ModelViewSet):
    queryset = Pacientes.objects.all()
    serializer_class = PacientesSerializer

    def list(self, request):
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT p.id_paciente, p.nombre_completo, p.fecha_nacimiento,
                           p.edad_actual, p.genero, p.telefono, p.correo_electronico,
                           p.colegio_ocupacion, p.motivo_consulta, p.observaciones_generales,
                           p.foto_paciente, p.fecha_registro, p.id_psicologo,
                           COALESCE(ps.nombre_completo, 'Sin asignar') as psicologo_nombre
                    FROM pacientes p
                    LEFT JOIN psicologos ps ON p.id_psicologo = ps.id_psicologo
                    ORDER BY p.fecha_registro DESC
                ''')
                cols = [d[0] for d in cursor.description]
                rows = cursor.fetchall()
                data = []
                for row in rows:
                    item = dict(zip(cols, row))
                    for k, v in item.items():
                        if hasattr(v, 'isoformat'):
                            item[k] = v.isoformat()
                    data.append(item)
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def get_queryset(self):
        return Pacientes.objects.all()


class CitasViewSet(viewsets.ModelViewSet):
    queryset = Citas.objects.all().order_by('fecha_cita', 'hora_inicio')
    serializer_class = CitasSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        fecha = self.request.query_params.get('fecha')
        paciente_id = self.request.query_params.get('paciente_id')
        if fecha:
            qs = qs.filter(fecha_cita=fecha)
        if paciente_id:
            qs = qs.filter(id_paciente=paciente_id)
        return qs


class HistorialesViewSet(viewsets.ModelViewSet):
    queryset = Historiales.objects.all().order_by('-fecha_historial')
    serializer_class = HistorialesSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get('paciente_id')
        if paciente_id:
            qs = qs.filter(id_paciente=paciente_id)
        return qs


class NotasViewSet(viewsets.ModelViewSet):
    queryset = Notas.objects.all().order_by('-fecha_nota')
    serializer_class = NotasSerializer


class TestsViewSet(viewsets.ModelViewSet):
    queryset = Tests.objects.all().order_by('-fecha_creacion')
    serializer_class = TestsSerializer

    def perform_create(self, serializer):
        user = self.request.user
        id_psicologo = None
        
        # 1. Intentar obtener el psicologo asociado al usuario autenticado
        if user and hasattr(user, 'id_usuario'):
            try:
                id_psicologo = Psicologos.objects.get(id_usuario=user.id_usuario)
            except Psicologos.DoesNotExist:
                pass
        
        # 2. Si no se encuentra, usar el id_psicologo provisto en los datos
        if not id_psicologo:
            provided_id = self.request.data.get('id_psicologo')
            if provided_id:
                try:
                    id_psicologo = Psicologos.objects.get(pk=provided_id)
                except Psicologos.DoesNotExist:
                    pass
        
        # 3. Fallback al primer psicologo de la base de datos
        if not id_psicologo:
            id_psicologo = Psicologos.objects.first()

        fecha_creacion = serializer.validated_data.get('fecha_creacion') or timezone.now()
        serializer.save(id_psicologo=id_psicologo, fecha_creacion=fecha_creacion)


class ReportesViewSet(viewsets.ModelViewSet):
    queryset = Reportes.objects.all().order_by('-fecha_generacion')
    serializer_class = ReportesSerializer

    def list(self, request, *args, **kwargs):
        report_type = request.query_params.get('report_type')
        if not report_type:
            return super().list(request, *args, **kwargs)

        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if report_type == 'patients':
            qs = Pacientes.objects.all().order_by('-fecha_registro')
            if date_from:
                qs = qs.filter(fecha_registro__date__gte=date_from)
            if date_to:
                qs = qs.filter(fecha_registro__date__lte=date_to)
            
            data = []
            for p in qs:
                data.append({
                    'ID': p.id_paciente,
                    'Nombre Completo': p.nombre_completo,
                    'Género': p.genero,
                    'Teléfono': p.telefono or '',
                    'Colegio/Ocupación': p.colegio_ocupacion or '',
                    'Fecha Registro': p.fecha_registro.strftime('%Y-%m-%d %H:%M') if p.fecha_registro else ''
                })
            return Response({'total': len(data), 'data': data})

        elif report_type == 'appointments':
            qs = Citas.objects.all().order_by('-fecha_cita', '-hora_inicio')
            if date_from:
                qs = qs.filter(fecha_cita__gte=date_from)
            if date_to:
                qs = qs.filter(fecha_cita__lte=date_to)
            
            data = []
            for c in qs:
                paciente_nombre = c.id_paciente.nombre_completo if c.id_paciente else 'Sin asignar'
                psicologo_nombre = c.id_psicologo.nombre_completo if c.id_psicologo else 'Sin asignar'
                data.append({
                    'ID': c.id_cita,
                    'Título': c.titulo_cita,
                    'Paciente': paciente_nombre,
                    'Psicólogo': psicologo_nombre,
                    'Fecha Cita': c.fecha_cita.strftime('%Y-%m-%d') if c.fecha_cita else '',
                    'Hora Inicio': c.hora_inicio.strftime('%H:%M') if c.hora_inicio else '',
                    'Estado': c.estado_cita or ''
                })
            return Response({'total': len(data), 'data': data})

        elif report_type == 'patient_progress':
            patient_id = request.query_params.get('patient_id')
            if not patient_id:
                return Response({'error': 'Debe seleccionar un paciente'}, status=400)
            
            qs = Resultadosjuegos.objects.filter(id_paciente=patient_id).order_by('-fecha_resultado')
            if date_from:
                qs = qs.filter(fecha_resultado__date__gte=date_from)
            if date_to:
                qs = qs.filter(fecha_resultado__date__lte=date_to)
            
            data = []
            for r in qs:
                correctas = r.respuestas_correctas or 0
                incorrectas = r.respuestas_incorrectas or 0
                totales = r.preguntas_totales or 0
                precision = float(r.porcentaje_resultado) if r.porcentaje_resultado is not None else (round((correctas / totales * 100), 1) if totales > 0 else 0)
                
                data.append({
                    'ID': r.id_resultado_juego,
                    'Juego': r.nombre_juego or 'Constructor de Cohetes',
                    'Correctas': correctas,
                    'Incorrectas': incorrectas,
                    'Preguntas Totales': totales,
                    'Precisión': f"{precision}%",
                    'Estrellas': r.estrellas_ganadas or 0,
                    'Fecha de Juego': r.fecha_resultado.strftime('%Y-%m-%d %H:%M') if r.fecha_resultado else ''
                })
            return Response({'total': len(data), 'data': data})

        elif report_type == 'general':
            data = [
                { 'Módulo / Categoría': 'Pacientes Registrados', 'Valor / Cantidad': Pacientes.objects.count() },
                { 'Módulo / Categoría': 'Psicólogos Activos', 'Valor / Cantidad': Psicologos.objects.count() },
                { 'Módulo / Categoría': 'Citas Programadas (Historial Completo)', 'Valor / Cantidad': Citas.objects.count() },
                { 'Módulo / Categoría': 'Sesiones de Juegos Jugadas', 'Valor / Cantidad': Resultadosjuegos.objects.count() },
                { 'Módulo / Categoría': 'Tests Registrados', 'Valor / Cantidad': Tests.objects.count() },
            ]
            return Response({'total': len(data), 'data': data})

        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        id_psicologo = None
        
        # 1. Intentar obtener el psicologo asociado al usuario autenticado
        if user and hasattr(user, 'id_usuario'):
            try:
                id_psicologo = Psicologos.objects.get(id_usuario=user.id_usuario)
            except Psicologos.DoesNotExist:
                pass
        
        # 2. Si no se encuentra, usar el id_psicologo provisto en los datos
        if not id_psicologo:
            provided_id = self.request.data.get('id_psicologo')
            if provided_id:
                try:
                    id_psicologo = Psicologos.objects.get(pk=provided_id)
                except Psicologos.DoesNotExist:
                    pass
        
        # 3. Fallback al primer psicologo de la base de datos
        if not id_psicologo:
            id_psicologo = Psicologos.objects.first()

        fecha_generacion = serializer.validated_data.get('fecha_generacion') or timezone.now()
        serializer.save(id_psicologo=id_psicologo, fecha_generacion=fecha_generacion)


class NotificacionesView(APIView):
    def get(self, request):
        usuario_id = request.query_params.get('usuario_id')
        qs = Notificaciones.objects.filter(id_usuario=usuario_id).order_by('-fecha_notificacion') if usuario_id else Notificaciones.objects.all().order_by('-fecha_notificacion')
        return Response(NotificacionesSerializer(qs, many=True).data)

    def patch(self, request, pk):
        notif = Notificaciones.objects.get(pk=pk)
        notif.estado_notificacion = 'leida'
        notif.save()
        return Response({'ok': True})


class JuegosView(APIView):
    def get(self, request):
        fonologicos = Juegosfonologicos.objects.filter(estado_juego='activo')
        mixtos = Juegosmixtos.objects.filter(estado_juego='activo')
        niveles = Niveles.objects.all().order_by('orden_nivel')
        return Response({
            'fonologicos': JuegosfonologicosSerializer(fonologicos, many=True).data,
            'mixtos': [{'id': j.id_juego_mixto, 'nombre': j.nombre_juego, 'descripcion': j.descripcion_juego} for j in mixtos],
            'niveles': NivelesSerializer(niveles, many=True).data,
        })


class ResultadosJuegosViewSet(viewsets.ModelViewSet):
    queryset = Resultadosjuegos.objects.all().order_by('-fecha_resultado')
    serializer_class = ResultadosjuegosSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        paciente_id = self.request.query_params.get('paciente_id')
        if paciente_id:
            qs = qs.filter(id_paciente=paciente_id)
        return qs


class EstadisticasView(APIView):
    def get(self, request):
        paciente_id = request.query_params.get('paciente_id')
        qs = Resultadosjuegos.objects.all()
        if paciente_id:
            qs = qs.filter(id_paciente=paciente_id)

        total_correctas = sum(r.respuestas_correctas or 0 for r in qs)
        total_incorrectas = sum(r.respuestas_incorrectas or 0 for r in qs)
        total_intentos = sum(r.preguntas_totales or 0 for r in qs)
        precision = round((total_correctas / total_intentos * 100), 1) if total_intentos > 0 else 0

        return Response({
            'total_sesiones': qs.count(),
            'total_correctas': total_correctas,
            'total_incorrectas': total_incorrectas,
            'total_intentos': total_intentos,
            'precision': precision,
            'resultados': ResultadosjuegosSerializer(qs[:20], many=True).data,
        })


class PsicologosViewSet(viewsets.ModelViewSet):
    queryset = Psicologos.objects.all()
    serializer_class = PsicologosSerializer


class UsuariosPsicologosView(APIView):
    def get(self, request):
        data = []
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                # Intentar psicologos primero
                cursor.execute('SELECT COUNT(*) FROM psicologos')
                count = cursor.fetchone()[0]
                
                if count > 0:
                    cursor.execute('''
                        SELECT p.id_psicologo, p.nombre_completo, p.especialidad, 
                               p.telefono, p.correo_profesional, p.foto_profesional
                        FROM psicologos p
                    ''')
                    cols = [d[0] for d in cursor.description]
                    rows = cursor.fetchall()
                    data = [dict(zip(cols, row)) for row in rows]
                else:
                    # Fallback: todos los usuarios
                    cursor.execute('''
                        SELECT id_usuario as id_psicologo, nombre_usuario as nombre_completo,
                               rol_usuario as especialidad, correo_electronico as correo_profesional
                        FROM usuarios
                    ''')
                    cols = [d[0] for d in cursor.description]
                    rows = cursor.fetchall()
                    data = [dict(zip(cols, row)) for row in rows]
                    for d in data:
                        d['telefono'] = ''
                        d['foto_profesional'] = None
        except Exception as e:
            return Response({'error': str(e), 'data': []}, status=200)
        
        return Response(data)


class TestArchivosViewSet(viewsets.ModelViewSet):
    queryset = TestArchivos.objects.all()
    serializer_class = TestArchivosSerializer

    def perform_create(self, serializer):
        from django.core.files.storage import default_storage
        archivo_file = self.request.FILES.get('archivo')
        ruta_archivo = ''
        if archivo_file:
            path = default_storage.save(f'tests/{archivo_file.name}', archivo_file)
            ruta_archivo = default_storage.url(path)
            
        serializer.save(
            ruta_archivo=ruta_archivo,
            nombre_archivo=serializer.validated_data.get('nombre_archivo') or (archivo_file.name if archivo_file else 'archivo'),
            tipo_archivo=serializer.validated_data.get('tipo_archivo') or (archivo_file.content_type if archivo_file else 'otro')
        )


class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.filter(estado_usuario='activo')
    serializer_class = UsuariosSerializer


class NivelesViewSet(viewsets.ModelViewSet):
    queryset = Niveles.objects.all().order_by('orden_nivel')
    serializer_class = NivelesSerializer


class SubnivelesViewSet(viewsets.ModelViewSet):
    queryset = Subniveles.objects.all().order_by('orden_subnivel')
    serializer_class = SubnivelesSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        nivel_id = self.request.query_params.get('nivel_id')
        if nivel_id:
            qs = qs.filter(id_nivel=nivel_id)
        return qs


# --- GAMES VIEWS ---

class PatientsListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        pacientes = Pacientes.objects.all()
        data = [{'id_paciente': p.id_paciente, 'nombre_completo': p.nombre_completo} for p in pacientes]
        return Response(data)


class GamePlayerRegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        patient_id = request.data.get('patient_id')
        nickname = request.data.get('nickname')
        password = request.data.get('password')
        age = request.data.get('age')
        laterality = request.data.get('laterality', 'right')
        
        if not patient_id or not nickname or not password:
            return Response({'detail': 'Faltan campos requeridos'}, status=400)
        
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT COUNT(*) FROM game_players WHERE nickname = %s', [nickname])
                if cursor.fetchone()[0] > 0:
                    return Response({'detail': 'El apodo ya está en uso'}, status=400)
                
                hashed = hash_password(password)
                cursor.execute('''
                    INSERT INTO game_players (id_paciente, nickname, password, age, laterality)
                    VALUES (%s, %s, %s, %s, %s)
                ''', [patient_id, nickname, hashed, age, laterality])
                return Response({'message': 'Jugador registrado correctamente'}, status=201)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class GamePlayerLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        nickname = request.data.get('nickname')
        password = request.data.get('password')
        
        if not nickname or not password:
            return Response({'detail': 'Faltan campos requeridos'}, status=400)
        
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT gp.id, gp.id_paciente, gp.nickname, gp.password, gp.age, gp.laterality, p.nombre_completo
                    FROM game_players gp
                    JOIN pacientes p ON gp.id_paciente = p.id_paciente
                    WHERE gp.nickname = %s
                ''', [nickname])
                row = cursor.fetchone()
                if not row:
                    return Response({'detail': 'Apodo o contraseña incorrectos'}, status=401)
                
                db_id, db_id_paciente, db_nickname, db_password, db_age, db_laterality, db_nombre_completo = row
                
                hashed = hash_password(password)
                if db_password != password and db_password != hashed:
                    return Response({'detail': 'Apodo o contraseña incorrectos'}, status=401)
                
                return Response({
                    'id': db_id,
                    'id_paciente': db_id_paciente,
                    'nickname': db_nickname,
                    'age': db_age,
                    'laterality': db_laterality,
                    'full_name': db_nombre_completo
                })
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class PatientPlayersListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, patient_id):
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT id, id_paciente, nickname, age, laterality
                    FROM game_players
                    WHERE id_paciente = %s
                ''', [patient_id])
                rows = cursor.fetchall()
                data = []
                for row in rows:
                    data.append({
                        'id': row[0],
                        'id_paciente': row[1],
                        'nickname': row[2],
                        'age': row[3],
                        'laterality': row[4]
                    })
                return Response(data)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class GameConfigView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, player_id):
        from django.db import connection
        import json
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT level, config_data
                    FROM game_configs
                    WHERE player_id = %s AND game_key = 'rocket_builder'
                ''', [player_id])
                rows = cursor.fetchall()
                config = {}
                for lvl, data in rows:
                    try:
                        config[str(lvl)] = json.loads(data)
                    except:
                        pass
                return Response(config)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class GameConfigLevelView(APIView):
    permission_classes = [AllowAny]
    
    def put(self, request, player_id, level):
        from django.db import connection
        import json
        body = request.data
        try:
            config_str = json.dumps(body)
            with connection.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO game_configs (player_id, game_key, level, config_data)
                    VALUES (%s, 'rocket_builder', %s, %s)
                    ON DUPLICATE KEY UPDATE config_data = %s
                ''', [player_id, level, config_str, config_str])
                return Response({'message': 'Configuración guardada'})
        except Exception as e:
            return Response({'detail': str(e)}, status=500)
            
    def delete(self, request, player_id, level):
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    DELETE FROM game_configs
                    WHERE player_id = %s AND game_key = 'rocket_builder' AND level = %s
                ''', [player_id, level])
                return Response({'message': 'Configuración eliminada'})
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class GameSessionStartView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        player_id = request.data.get('player_id')
        game_type = request.data.get('game_type')
        game_number = request.data.get('game_number')
        level = request.data.get('level')
        
        if not player_id or not game_type or game_number is None or level is None:
            return Response({'detail': 'Faltan campos requeridos'}, status=400)
            
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO game_sessions (player_id, game_type, game_number, level)
                    VALUES (%s, %s, %s, %s)
                ''', [player_id, game_type, game_number, level])
                session_id = cursor.lastrowid
                return Response({'id': session_id}, status=201)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class GameAttemptView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        session_id = request.data.get('session_id')
        word_shown = request.data.get('word_shown')
        answer_given = request.data.get('answer_given')
        is_correct = request.data.get('is_correct')
        reaction_time_ms = request.data.get('reaction_time_ms')
        error_type = request.data.get('error_type')
        num_clicks = request.data.get('num_clicks', 0)
        attempt_number = request.data.get('attempt_number', 1)
        
        if not session_id or word_shown is None or answer_given is None or is_correct is None or reaction_time_ms is None:
            return Response({'detail': 'Faltan campos requeridos'}, status=400)
            
        is_correct_val = 1 if is_correct else 0
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO game_attempts (session_id, word_shown, answer_given, is_correct, reaction_time_ms, error_type, num_clicks, attempt_number)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', [session_id, word_shown, answer_given, is_correct_val, reaction_time_ms, error_type, num_clicks, attempt_number])
                attempt_id = cursor.lastrowid
                return Response({'id': attempt_id}, status=201)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class GameVoiceView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        attempt_id = request.data.get('attempt_id')
        confidence = request.data.get('confidence')
        num_attempts = request.data.get('num_attempts', 1)
        silence_time_ms = request.data.get('silence_time_ms', 0)
        recognized_text = request.data.get('recognized_text')
        
        if not attempt_id or confidence is None:
            return Response({'detail': 'Faltan campos requeridos'}, status=400)
            
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO game_voice (attempt_id, confidence, num_attempts, silence_time_ms, recognized_text)
                    VALUES (%s, %s, %s, %s, %s)
                ''', [attempt_id, confidence, num_attempts, silence_time_ms, recognized_text])
                return Response({'message': 'Voz guardada'}, status=201)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)


class GameSessionCompleteView(APIView):
    permission_classes = [AllowAny]
    def put(self, request, session_id):
        total_time_seconds = request.data.get('total_time_seconds', 0)
        final_score = request.data.get('final_score', 0)
        
        from django.db import connection
        from django.utils import timezone
        import logging
        logger = logging.getLogger('api')
        
        try:
            with connection.cursor() as cursor:
                # 1. Obtener datos de la sesión
                cursor.execute('''
                    SELECT gs.player_id, gp.id_paciente, gs.level
                    FROM game_sessions gs
                    JOIN game_players gp ON gs.player_id = gp.id
                    WHERE gs.id = %s
                ''', [session_id])
                row = cursor.fetchone()
                if not row:
                    return Response({'detail': 'Sesión no encontrada'}, status=404)
                
                player_id, id_paciente, session_level = row
                logger.info(f'[SESSION_COMPLETE] session={session_id} paciente={id_paciente} level={session_level}')
                
                # 2. Contar intentos de sílabas
                cursor.execute('''
                    SELECT 
                        COUNT(*) as total,
                        COALESCE(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END), 0) as correct,
                        COALESCE(SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END), 0) as incorrect
                    FROM game_attempts
                    WHERE session_id = %s
                ''', [session_id])
                att_row = cursor.fetchone()
                total_attempts = att_row[0] or 0
                correct_attempts = att_row[1] or 0
                incorrect_attempts = att_row[2] or 0
                
                # 3. Contar intentos de voz
                cursor.execute('''
                    SELECT COUNT(*) FROM game_voice gvr
                    JOIN game_attempts ga ON gvr.attempt_id = ga.id
                    WHERE ga.session_id = %s
                ''', [session_id])
                voice_row = cursor.fetchone()
                voice_count = voice_row[0] if voice_row else 0
                
                # 4. Calcular porcentaje y estrellas
                pct = round((correct_attempts / total_attempts * 100), 2) if total_attempts > 0 else 0
                if pct >= 80:
                    estrellas = 3
                elif pct >= 50:
                    estrellas = 2
                else:
                    estrellas = 1
                
                # 5. Asignar nivel y subnivel basándose en el nivel del juego
                # Mapeo: niveles 1-3 = FONOLOGICA (id_nivel 1), 4-6 = id_nivel 2, 7-10 = id_nivel 3
                if session_level <= 3:
                    id_nivel = 1
                elif session_level <= 6:
                    id_nivel = 2
                else:
                    id_nivel = 3
                id_subnivel = 1  # Constructor de Cohetes es subnivel 1
                
                # Verificar que existen los registros de nivel y subnivel
                cursor.execute('SELECT id_nivel FROM niveles WHERE id_nivel = %s', [id_nivel])
                if not cursor.fetchone():
                    cursor.execute('SELECT id_nivel FROM niveles ORDER BY id_nivel LIMIT 1')
                    fallback = cursor.fetchone()
                    id_nivel = fallback[0] if fallback else 1
                
                cursor.execute('SELECT id_subnivel FROM subniveles WHERE id_subnivel = %s', [id_subnivel])
                if not cursor.fetchone():
                    cursor.execute('SELECT id_subnivel FROM subniveles ORDER BY id_subnivel LIMIT 1')
                    fallback = cursor.fetchone()
                    id_subnivel = fallback[0] if fallback else 1
                
                # 6. Determinar estado
                estado = 'COMPLETADO' if session_level >= 10 or total_attempts > 0 else 'INCOMPLETO'
                
                # 7. Insertar resultado
                cursor.execute('''
                    INSERT INTO resultadosjuegos (
                        id_paciente, id_nivel, id_subnivel, nombre_juego,
                        respuestas_correctas, respuestas_incorrectas, respuestas_sin_responder,
                        preguntas_totales, tiempo_jugado_segundos, estrellas_ganadas,
                        niveles_completados, porcentaje_resultado,
                        cantidad_audios_enviados, cantidad_pronunciaciones_correctas,
                        cantidad_pronunciaciones_incorrectas,
                        estado_resultado, fecha_resultado
                    ) VALUES (%s, %s, %s, 'Constructor de Cohetes', %s, %s, 0, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', [
                    id_paciente, id_nivel, id_subnivel,
                    correct_attempts, incorrect_attempts, total_attempts,
                    total_time_seconds, estrellas, session_level,
                    pct,
                    voice_count, 0, 0,
                    estado, timezone.now()
                ])
                
                # 8. Actualizar sesión
                cursor.execute('''
                    UPDATE game_sessions
                    SET score = %s, total_time_seconds = %s
                    WHERE id = %s
                ''', [final_score, total_time_seconds, session_id])
                
                logger.info(f'[SESSION_COMPLETE] Resultado guardado: correctas={correct_attempts} incorrectas={incorrect_attempts} pct={pct}% estrellas={estrellas} tiempo={total_time_seconds}s')
                
                return Response({
                    'message': 'Sesión completada y resultado registrado',
                    'resultado': {
                        'correctas': correct_attempts,
                        'incorrectas': incorrect_attempts,
                        'total': total_attempts,
                        'porcentaje': pct,
                        'estrellas': estrellas,
                        'tiempo': total_time_seconds,
                    }
                })
        except Exception as e:
            logger.error(f'[SESSION_COMPLETE_ERROR] session={session_id} error={str(e)}')
            return Response({'detail': str(e)}, status=500)


class GameUploadWordImageView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No se envió ninguna imagen'}, status=400)
            
        from django.core.files.storage import default_storage
        try:
            # Guardar la imagen en media/rocket_builder/
            file_path = default_storage.save(f'rocket_builder/{image_file.name}', image_file)
            file_url = request.build_absolute_uri(default_storage.url(file_path))
            return Response({'url': file_url})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
