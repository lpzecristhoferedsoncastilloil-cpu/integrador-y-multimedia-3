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

        from django.db import connection
        from django.db.models import Avg
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM test_dislexia_results")
                total_test_dislexia = cursor.fetchone()[0]
        except Exception:
            total_test_dislexia = 0
            
        promedio_precision = Resultadosjuegos.objects.aggregate(Avg('porcentaje_resultado'))['porcentaje_resultado__avg'] or 0

        return Response({
            'total_pacientes': Pacientes.objects.count(),
            'total_citas_hoy': Citas.objects.filter(fecha_cita=hoy).count(),
            'total_juegos_jugados': Resultadosjuegos.objects.count(),
            'total_reportes': total_reportes,
            'citas_pendientes': Citas.objects.filter(estado_cita__iexact='PENDIENTE').count(),
            'total_tests': Tests.objects.count(),
            'total_test_dislexia': total_test_dislexia,
            'promedio_precision': float(promedio_precision),
            
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
    
    def get(self, request, player_id, game_key):
        from django.db import connection
        import json
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT level, config_data
                    FROM game_configs
                    WHERE player_id = %s AND game_key = %s
                ''', [player_id, game_key])
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
    
    def put(self, request, player_id, game_key, level):
        from django.db import connection
        import json
        body = request.data
        try:
            config_str = json.dumps(body)
            with connection.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO game_configs (player_id, game_key, level, config_data)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE config_data = %s
                ''', [player_id, game_key, level, config_str, config_str])
                return Response({'message': 'Configuración guardada'})
        except Exception as e:
            return Response({'detail': str(e)}, status=500)
            
    def delete(self, request, player_id, game_key, level):
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    DELETE FROM game_configs
                    WHERE player_id = %s AND game_key = %s AND level = %s
                ''', [player_id, game_key, level])
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
        req_correct = request.data.get('correct_attempts')
        req_incorrect = request.data.get('incorrect_attempts')
        req_total = request.data.get('total_attempts')
        
        from django.db import connection
        from django.utils import timezone
        import logging
        logger = logging.getLogger('api')
        
        try:
            with connection.cursor() as cursor:
                # 1. Obtener datos de la sesión
                cursor.execute('''
                    SELECT gs.player_id, gp.id_paciente, gs.level, gs.game_type
                    FROM game_sessions gs
                    JOIN game_players gp ON gs.player_id = gp.id
                    WHERE gs.id = %s
                ''', [session_id])
                row = cursor.fetchone()
                if not row:
                    return Response({'detail': 'Sesión no encontrada'}, status=404)
                
                player_id, id_paciente, session_level, game_type = row
                
                # Mapear game_type a nombre del juego
                GAME_NAMES = {
                    'fonologica': 'Constructor de Cohetes',
                    'grafema': 'La Caza del Grafema Perdido',
                    'maze': 'El Laberinto de las Habitaciones',
                    'cheese': 'El Reto del Queso y los Ratones',
                    'hangman': 'El Rescate de las Letras',
                    'machine': 'La Máquina de las Sílabas',
                    'river': 'El Río de las Palabras Cruzadas',
                    'warehouse': 'El Almacén de las Letras Perdidas',
                    'temple': 'El Eco de las Sílabas',
                    'train': 'El Tren de las Letras',
                }
                nombre_juego = GAME_NAMES.get(game_type, game_type or 'Juego Desconocido')
                logger.info(f'[SESSION_COMPLETE] session={session_id} paciente={id_paciente} level={session_level}')
                
                # 2. Contar intentos de sílabas
                if req_correct is not None and req_incorrect is not None and req_total is not None:
                    total_attempts = int(req_total)
                    correct_attempts = int(req_correct)
                    incorrect_attempts = int(req_incorrect)
                else:
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
                    ) VALUES (%s, %s, %s, %s, %s, %s, 0, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', [
                    id_paciente, id_nivel, id_subnivel, nombre_juego,
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


class AdicionarPsicologoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Validar que el usuario que hace la solicitud sea el administrador
        if not request.user or request.user.correo_electronico != 'admin@neurogym.com':
            return Response(
                {'error': 'No tienes permisos para realizar esta acción. Solo el administrador principal puede adicionar psicólogos.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        from django.db import transaction
        import unicodedata
        import re
        from django.core.files.storage import default_storage
        from django.core.mail import send_mail
        from django.conf import settings

        # Recoger datos del formulario
        nombre_completo = request.data.get('nombre_completo', '').strip()
        ci = request.data.get('ci', '').strip()
        correo_personal = request.data.get('correo_personal', '').strip()
        edad_str = request.data.get('edad', '0').strip()
        ciudad_origen = request.data.get('ciudad_origen', '').strip()
        telefono = request.data.get('telefono', '').strip()
        telefono_referencia = request.data.get('telefono_referencia', '').strip()
        universidad_egreso = request.data.get('universidad_egreso', '').strip()
        estudios_adicionales = request.data.get('estudios_adicionales', '').strip()
        especialidad = request.data.get('especialidad', '').strip()

        # Validaciones básicas
        if not nombre_completo or not ci or not correo_personal:
            return Response({'error': 'Nombre completo, Cédula de Identidad (CI) y Correo personal son campos requeridos.'}, status=400)

        try:
            edad = int(edad_str)
        except ValueError:
            return Response({'error': 'La edad debe ser un número entero válido.'}, status=400)

        # 2. Generación automática de credenciales
        # 2a. Correo corporativo (primer nombre en minúsculas y limpio)
        partes = nombre_completo.split(' ')
        primer_nombre = partes[0]
        # Quitar acentos
        primer_nombre_limpio = ''.join(c for c in unicodedata.normalize('NFD', primer_nombre) if unicodedata.category(c) != 'Mn')
        primer_nombre_limpio = re.sub(r'[^a-zA-Z]', '', primer_nombre_limpio).lower()

        if not primer_nombre_limpio:
            primer_nombre_limpio = "psicologo"

        email_base = f"{primer_nombre_limpio}@neurogym.com"
        username_base = primer_nombre_limpio

        # Evitar colisión de usuarios y correos en la base de datos
        counter = 1
        email = email_base
        username = username_base
        while Usuarios.objects.filter(correo_electronico=email).exists() or Usuarios.objects.filter(nombre_usuario=username).exists():
            email = f"{primer_nombre_limpio}{counter}@neurogym.com"
            username = f"{primer_nombre_limpio}{counter}"
            counter += 1

        # 2b. Contraseña temporal (Nombre + Primera letra del primer apellido + 123)
        primer_nombre_cap = primer_nombre.capitalize()
        primer_nombre_cap = ''.join(c for c in unicodedata.normalize('NFD', primer_nombre_cap) if unicodedata.category(c) != 'Mn')
        primer_nombre_cap = re.sub(r'[^a-zA-Z]', '', primer_nombre_cap)

        if len(partes) > 1:
            primer_apellido = partes[1]
            primer_apellido_limpio = ''.join(c for c in unicodedata.normalize('NFD', primer_apellido) if unicodedata.category(c) != 'Mn')
            primer_apellido_limpio = re.sub(r'[^a-zA-Z]', '', primer_apellido_limpio)
            letra_apellido = primer_apellido_limpio[0].upper() if primer_apellido_limpio else 'P'
        else:
            letra_apellido = 'P'

        contrasena_plana = f"{primer_nombre_cap}{letra_apellido}123"

        # 3. Transacción e inserción en base de datos
        try:
            with transaction.atomic():
                # Crear Usuario
                usuario = Usuarios.objects.create(
                    nombre_usuario=username,
                    correo_electronico=email,
                    contrasena=hash_password(contrasena_plana),
                    rol_usuario='PSICOLOGO',
                    estado_usuario='activo',
                    fecha_creacion=timezone.now()
                )

                # Crear Psicólogo
                psicologo = Psicologos.objects.create(
                    id_usuario=usuario,
                    nombre_completo=nombre_completo,
                    ci=ci,
                    telefono=telefono,
                    correo_profesional=email,
                    especialidad=especialidad,
                    fecha_registro=timezone.now()
                )

                # Subida de Archivos
                cv_file = request.FILES.get('archivo_cv')
                especialidad_file = request.FILES.get('archivo_especialidad')

                url_cv = ""
                url_especialidad = ""

                if cv_file:
                    path_cv = default_storage.save(f'contrataciones/cv_{usuario.id_usuario}_{cv_file.name}', cv_file)
                    url_cv = default_storage.url(path_cv)

                if especialidad_file:
                    path_esp = default_storage.save(f'contrataciones/esp_{usuario.id_usuario}_{especialidad_file.name}', especialidad_file)
                    url_especialidad = default_storage.url(path_esp)

                # Crear datos de contratación
                DatosContratacionPsicologos.objects.create(
                    id_psicologo=psicologo,
                    correo_personal=correo_personal,
                    edad=edad,
                    ciudad_origen=ciudad_origen,
                    telefono_referencia=telefono_referencia,
                    universidad_egreso=universidad_egreso,
                    estudios_adicionales=estudios_adicionales,
                    archivo_cv=url_cv,
                    archivo_especialidad=url_especialidad
                )

            # 4. Envío de Correo Electrónico
            correo_enviado = False
            error_email_detalle = ""
            
            asunto = "¡Bienvenido al Equipo de NeuroGym! - Tus Credenciales Corporativas"
            mensaje = f"""Hola {nombre_completo},
            
Te damos una cordial bienvenida al equipo profesional de NeuroGym. 

Se ha creado tu nueva cuenta corporativa para acceder al sistema. A continuación encontrarás tus credenciales de acceso personales:

🔗 Enlace de Acceso al Sistema: http://localhost:5173/
📧 Usuario Corporativo (Email): {email}
🔑 Contraseña Temporal: {contrasena_plana}

Por favor, inicia sesión con estas credenciales y te sugerimos cambiar tu contraseña temporal en la sección de Configuraciones -> Seguridad tan pronto como accedas por primera vez.

Atentamente,
El Equipo de Administración de NeuroGym
"""
            try:
                # Comprobar si se ha configurado el SMTP en la base de datos
                from django.core.mail.backends.smtp import EmailBackend
                smtp_config = ConfiguracionSmtp.objects.last()
                
                if smtp_config:
                    connection = EmailBackend(
                        host=smtp_config.servidor_smtp,
                        port=smtp_config.puerto,
                        username=smtp_config.correo_emisor,
                        password=smtp_config.contrasena_aplicacion,
                        use_tls=bool(smtp_config.use_tls),
                        use_ssl=False,
                        timeout=10
                    )
                    remitente = smtp_config.correo_emisor
                else:
                    connection = None
                    remitente = getattr(settings, 'EMAIL_HOST_USER', 'admin@neurogym.com')

                send_mail(
                    asunto,
                    mensaje,
                    remitente,
                    [correo_personal],
                    fail_silently=False,
                    connection=connection
                )
                correo_enviado = True
            except Exception as email_err:
                error_email_detalle = str(email_err)
                import logging
                logger = logging.getLogger('api')
                logger.error(f"Error al enviar correo SMTP de bienvenida a {correo_personal}: {error_email_detalle}")

            return Response({
                'message': 'Psicólogo registrado exitosamente.',
                'usuario_creado': username,
                'correo_corporativo': email,
                'contrasena_temporal': contrasena_plana,
                'correo_enviado': correo_enviado,
                'correo_error_detalle': error_email_detalle if not correo_enviado else ""
            }, status=status.HTTP_201_CREATED)

        except Exception as db_err:
            return Response({'error': f'Error en base de datos al registrar psicólogo: {str(db_err)}'}, status=500)


class ConfiguracionSmtpView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user or request.user.correo_electronico != 'admin@neurogym.com':
            return Response({'error': 'No autorizado'}, status=403)
        
        config = ConfiguracionSmtp.objects.last()
        if not config:
            return Response({
                'correo_emisor': '',
                'contrasena_aplicacion': '',
                'servidor_smtp': 'smtp.gmail.com',
                'puerto': 587,
                'use_tls': True
            })
        serializer = ConfiguracionSmtpSerializer(config)
        return Response(serializer.data)

    def post(self, request):
        if not request.user or request.user.correo_electronico != 'admin@neurogym.com':
            return Response({'error': 'No autorizado'}, status=403)
        
        config = ConfiguracionSmtp.objects.last()
        data = request.data
        if config:
            serializer = ConfiguracionSmtpSerializer(config, data=data, partial=True)
        else:
            serializer = ConfiguracionSmtpSerializer(data=data)
            
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


def get_custom_avatar_by_paciente(cursor, id_paciente):
    try:
        cursor.execute('''
            SELECT ap.color_piel, ap.color_ojos, ap.color_cabello,
                   r.ruta_recurso as rostro_recurso,
                   o.ruta_recurso as ojos_recurso,
                   c.ruta_recurso as cabello_recurso,
                   g.ruta_recurso as gorra_recurso,
                   l.ruta_recurso as lentes_recurso
        FROM avatar_paciente ap
        LEFT JOIN estilos_avatar3d r ON ap.id_rostro = r.id_estilo
        LEFT JOIN estilos_avatar3d o ON ap.id_ojos = o.id_estilo
        LEFT JOIN estilos_avatar3d c ON ap.id_cabello = c.id_estilo
        LEFT JOIN estilos_avatar3d g ON ap.id_gorra = g.id_estilo
        LEFT JOIN estilos_avatar3d l ON ap.id_lentes = l.id_estilo
        WHERE ap.id_paciente = %s
    ''', [id_paciente])
        row = cursor.fetchone()
        if row:
            return {
                'color_piel': row[0] if row[0] else '#ffd8b3',
                'color_ojos': row[1] if row[1] else '#4f46e5',
                'color_cabello': row[2] if row[2] else '#1e1b4b',
                'rostro_recurso': row[3] if row[3] else 'rostro_redondo',
                'ojos_recurso': row[4] if row[4] else 'ojos_felices',
                'cabello_recurso': row[5] if row[5] else 'cabello_corto',
                'gorra_recurso': row[6],
                'lentes_recurso': row[7]
            }
    except Exception as e:
        pass
    return {
        'color_piel': '#ffd8b3',
        'color_ojos': '#4f46e5',
        'color_cabello': '#1e1b4b',
        'rostro_recurso': 'rostro_redondo',
        'ojos_recurso': 'ojos_felices',
        'cabello_recurso': 'cabello_corto',
        'gorra_recurso': None,
        'lentes_recurso': None
    }


class GamePodioView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, session_id):
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                # 1. Obtener los detalles de la sesión actual
                cursor.execute('''
                    SELECT gs.player_id, gs.game_type, gs.score, gp.nickname, gp.id_paciente, p.foto_paciente
                    FROM game_sessions gs
                    JOIN game_players gp ON gs.player_id = gp.id
                    JOIN pacientes p ON gp.id_paciente = p.id_paciente
                    WHERE gs.id = %s
                ''', [session_id])
                session_row = cursor.fetchone()
                if not session_row:
                    return Response({'error': 'Sesión no encontrada'}, status=404)
                
                player_id, game_type, current_score, nickname, id_paciente, foto_paciente = session_row
                current_avatar = get_custom_avatar_by_paciente(cursor, id_paciente)
                
                # 2. Obtener el puntaje máximo histórico de cada apodo/jugador para el ranking global en este game_type
                # Excluimos los apodos duplicados
                cursor.execute('''
                    SELECT gp.nickname, MAX(gs.score) as max_score, p.foto_paciente, gp.id_paciente
                    FROM game_sessions gs
                    JOIN game_players gp ON gs.player_id = gp.id
                    JOIN pacientes p ON gp.id_paciente = p.id_paciente
                    WHERE gs.game_type = %s
                    GROUP BY gp.nickname, p.foto_paciente, gp.id_paciente
                    ORDER BY max_score DESC
                ''', [game_type])
                
                rows = cursor.fetchall()
                
                # Construir la lista global de mejores marcas únicas
                ranking_list = []
                for r_nick, r_score, r_foto, r_paciente_id in rows:
                    r_avatar = get_custom_avatar_by_paciente(cursor, r_paciente_id)
                    ranking_list.append({
                        'nickname': r_nick,
                        'score': r_score,
                        'foto': r_foto,
                        'avatar': r_avatar
                    })
                
                # 3. Calcular la posición exacta de este intento del niño
                # Para saber el puesto de este intento, obtenemos el puntaje máximo histórico de todos los DEMÁS jugadores.
                # Y colocamos el intento actual de este jugador en la mezcla.
                competitors_scores = []
                for item in ranking_list:
                    if item['nickname'] != nickname:
                        competitors_scores.append(item['score'])
                
                # Insertamos la puntuación del intento actual
                competitors_scores.append(current_score)
                # Ordenamos de mayor a menor
                competitors_scores.sort(reverse=True)
                
                # La posición exacta de este intento es el primer índice (1-based) de la puntuación en la lista sorted
                current_position = competitors_scores.index(current_score) + 1
                total_participants = len(competitors_scores)
                
                # 4. Formar el Top 3 global final
                top_3 = []
                for i in range(min(3, len(ranking_list))):
                    item = ranking_list[i]
                    top_3.append({
                        'nickname': item['nickname'],
                        'score': item['score'],
                        'foto': item['foto'],
                        'avatar': item['avatar'],
                        'rank': i + 1
                    })
                
                # Determinar si el intento actual está en el Top 3
                is_top_3 = current_position <= 3
                
                return Response({
                    'game_type': game_type,
                    'current_score': current_score,
                    'current_position': current_position,
                    'total_participants': total_participants,
                    'is_top_3': is_top_3,
                    'nickname': nickname,
                    'foto_paciente': foto_paciente,
                    'avatar': current_avatar,
                    'top_3': top_3,
                    'ranking': ranking_list
                })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class OpcionesAvatarListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        opciones = EstilosAvatar3d.objects.all()
        serializer = EstilosAvatar3dSerializer(opciones, many=True)
        return Response(serializer.data)


class AvatarPacienteDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, id_paciente):
        try:
            # Fuerza la conversión a entero para prevenir errores
            try:
                id_paciente_real = int(id_paciente)
            except Exception:
                id_paciente_real = id_paciente
            
            rostro_def = EstilosAvatar3d.objects.filter(categoria='rostro').first()
            ojos_def = EstilosAvatar3d.objects.filter(categoria='ojos').first()
            cabello_def = EstilosAvatar3d.objects.filter(categoria='cabello').first()
            
            avatar, created = AvatarPaciente.objects.get_or_create(
                id_paciente_id=id_paciente_real,
                defaults={
                    'id_rostro': rostro_def,
                    'id_ojos': ojos_def,
                    'id_cabello': cabello_def,
                    'id_gorra': None,
                    'id_lentes': None,
                    'color_piel': '#ffd8b3',
                    'color_ojos': '#4f46e5',
                    'color_cabello': '#1e1b4b'
                }
            )
            serializer = AvatarPacienteSerializer(avatar)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
            
    def post(self, request, id_paciente):
        try:
            data = request.data
            
            # Fuerza la conversión o extracción del ID numérico correcto
            id_paciente_real = id_paciente
            if isinstance(id_paciente_real, dict):
                id_paciente_real = id_paciente_real.get('id_paciente') or id_paciente_real.get('id')
            
            if not str(id_paciente_real).isdigit():
                # Intentamos obtener de la data
                req_id = data.get('id_paciente')
                if isinstance(req_id, dict):
                    id_paciente_real = req_id.get('id_paciente')
                elif req_id:
                    id_paciente_real = req_id
            
            id_paciente_real = int(id_paciente_real)

            # Extrae y convierte de forma segura las llaves foráneas
            def get_clean_id(val):
                if val is None:
                    return None
                if isinstance(val, dict):
                    return val.get('id_estilo') or val.get('id')
                if str(val).lower() in ['ninguno', 'null', 'undefined', '']:
                    return None
                try:
                    return int(val)
                except Exception:
                    return None

            rostro_id = get_clean_id(data.get('id_rostro'))
            ojos_id = get_clean_id(data.get('id_ojos'))
            cabello_id = get_clean_id(data.get('id_cabello'))
            gorra_id = get_clean_id(data.get('id_gorra'))
            lentes_id = get_clean_id(data.get('id_lentes'))

            # Fuerza la conversión o extracción del ID numérico correcto
            avatar, created = AvatarPaciente.objects.get_or_create(id_paciente_id=id_paciente_real)
            
            avatar.id_rostro_id = rostro_id
            avatar.id_ojos_id = ojos_id
            avatar.id_cabello_id = cabello_id
            avatar.id_gorra_id = gorra_id
            avatar.id_lentes_id = lentes_id
            avatar.color_piel = data.get('color_piel', avatar.color_piel or '#ffd8b3')
            avatar.color_ojos = data.get('color_ojos', avatar.color_ojos or '#4f46e5')
            avatar.color_cabello = data.get('color_cabello', avatar.color_cabello or '#1e1b4b')
            avatar.save()

            serializer = AvatarPacienteSerializer(avatar)
            return Response(serializer.data, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# --- SISTEMA EXPERTO IA ---
class ExpertoIAView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'detail': 'Falta el parámetro paciente_id'}, status=400)
        
        import os
        import sys
        from django.conf import settings
        ia_path = os.path.normpath(os.path.join(settings.BASE_DIR, '..', '..', 'IA_EXPERTO'))
        if ia_path not in sys.path:
            sys.path.append(ia_path)
            
        try:
            import expert_system
            profile = expert_system.get_patient_profile(int(paciente_id))
            if not profile:
                return Response({'detail': 'Paciente no encontrado'}, status=404)
            return Response(profile, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ExpertoIAExcelView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            from django.http import HttpResponse
            return HttpResponse('Falta el parametro paciente_id', status=400)
            
        import os
        import sys
        from django.conf import settings
        ia_path = os.path.normpath(os.path.join(settings.BASE_DIR, '..', '..', 'IA_EXPERTO'))
        if ia_path not in sys.path:
            sys.path.append(ia_path)
            
        try:
            import expert_system
            res = expert_system.generate_styled_excel(int(paciente_id))
            if not res:
                from django.http import HttpResponse
                return HttpResponse('Paciente no encontrado o error al generar reporte', status=404)
                
            file_path, file_name = res
            from django.http import FileResponse
            response = FileResponse(open(file_path, 'rb'), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response
        except Exception as e:
            from django.http import HttpResponse
            return HttpResponse(f'Error: {str(e)}', status=500)


# --- TEST DE DISLEXIA ---
class TestDislexiaProcesarView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        audio_file = request.FILES.get('audio')
        list_type = request.data.get('list_type')
        edad = request.data.get('edad')
        transcription = request.data.get('transcription', '')
        
        if not audio_file or not list_type or not edad:
            return Response({'detail': 'Faltan campos requeridos (audio, list_type, edad)'}, status=400)
            
        import os
        import sys
        from datetime import datetime
        from django.conf import settings
        
        # Guardar archivo de audio temporalmente en media/audios_test
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'audios_test')
        os.makedirs(temp_dir, exist_ok=True)
        
        file_name = f"test_{list_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{audio_file.name}.wav"
        file_path = os.path.join(temp_dir, file_name)
        
        with open(file_path, 'wb+') as destination:
            for chunk in audio_file.chunks():
                destination.write(chunk)
                
        # Importar test_manager
        ia_path = os.path.normpath(os.path.join(settings.BASE_DIR, '..', '..', 'test_dislexia'))
        if ia_path not in sys.path:
            sys.path.append(ia_path)
            
        try:
            import test_manager
            res = test_manager.process_audio_test(file_path, list_type, int(edad), transcription)
            res['audio_url'] = f"/media/audios_test/{file_name}"
            return Response(res, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class TestDislexiaGuardarView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        id_paciente = request.data.get('id_paciente')
        metodo = request.data.get('metodo')
        a_p = request.data.get('a_p')
        t_p = request.data.get('t_p')
        a_ps = request.data.get('a_ps')
        t_ps = request.data.get('t_ps')
        audio_p_ruta = request.data.get('audio_p_ruta')
        audio_ps_ruta = request.data.get('audio_ps_ruta')
        transcripcion_p = request.data.get('transcripcion_p')
        transcripcion_ps = request.data.get('transcripcion_ps')
        detalles_errores = request.data.get('detalles_errores')
        observaciones = request.data.get('observaciones')
        
        if not id_paciente or not metodo or a_p is None or t_p is None or a_ps is None or t_ps is None:
            return Response({'detail': 'Faltan campos requeridos'}, status=400)
            
        import os
        import sys
        import json
        from django.conf import settings
        from django.db import connection
        
        # Obtener edad del paciente
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT edad_actual, fecha_nacimiento FROM pacientes WHERE id_paciente = %s", [id_paciente])
                row = cursor.fetchone()
                if not row:
                    return Response({'detail': 'Paciente no encontrado'}, status=404)
                edad = row[0]
                dob = row[1]
                if (edad is None or edad == 0) and dob:
                    from datetime import date
                    today = date.today()
                    edad = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                if edad is None or edad == 0:
                    edad = 8  # Fallback predeterminado
        except Exception as e:
            return Response({'error': f"Error al buscar paciente: {str(e)}"}, status=500)
            
        # Importar test_manager
        ia_path = os.path.normpath(os.path.join(settings.BASE_DIR, '..', '..', 'test_dislexia'))
        if ia_path not in sys.path:
            sys.path.append(ia_path)
            
        try:
            import test_manager
            # Calcular indices e inferencias
            calcs = test_manager.calculate_all_indices(edad, int(a_p), float(t_p), int(a_ps), float(t_ps))
            
            # Serializar JSON fields
            detalles_str = json.dumps(detalles_errores) if isinstance(detalles_errores, (list, dict)) else str(detalles_errores or '')
            obs_str = json.dumps(observaciones) if isinstance(observaciones, (list, dict)) else str(observaciones or '')
            
            # Insertar en base de datos
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO test_dislexia_results (
                        id_paciente, metodo, a_p, t_p, il_p, r_p,
                        a_ps, t_ps, il_ps, r_ps, diagnostico,
                        detalles_errores, audio_p_ruta, audio_ps_ruta,
                        transcripcion_p, transcripcion_ps, observaciones
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    id_paciente, metodo, a_p, t_p, calcs["il_p"], calcs["r_il_p"],
                    a_ps, t_ps, calcs["il_ps"], calcs["r_il_ps"], calcs["diagnostico"],
                    detalles_str, audio_p_ruta, audio_ps_ruta,
                    transcripcion_p, transcripcion_ps, obs_str
                ])
                result_id = cursor.lastrowid
                
            return Response({
                'success': True,
                'id': result_id,
                'diagnostico': calcs["diagnostico"],
                'il_p': calcs["il_p"],
                'il_ps': calcs["il_ps"]
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class TestDislexiaHistorialView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'detail': 'Falta el parámetro paciente_id'}, status=400)
            
        import json
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, metodo, a_p, t_p, il_p, r_p, a_ps, t_ps, il_ps, r_ps, diagnostico, 
                           detalles_errores, audio_p_ruta, audio_ps_ruta, transcripcion_p, transcripcion_ps, 
                           observaciones, fecha_registro
                    FROM test_dislexia_results
                    WHERE id_paciente = %s
                    ORDER BY fecha_registro DESC
                """, [paciente_id])
                rows = cursor.fetchall()
                
            results = []
            for r in rows:
                try:
                    detalles = json.loads(r[11]) if r[11] else []
                except Exception:
                    detalles = r[11]
                    
                try:
                    obs = json.loads(r[16]) if r[16] else {}
                except Exception:
                    obs = r[16]
                    
                results.append({
                    "id": r[0],
                    "metodo": r[1],
                    "a_p": r[2],
                    "t_p": r[3],
                    "il_p": r[4],
                    "r_p": r[5],
                    "a_ps": r[6],
                    "t_ps": r[7],
                    "il_ps": r[8],
                    "r_ps": r[9],
                    "diagnostico": r[10],
                    "detalles_errores": detalles,
                    "audio_p_ruta": r[12],
                    "audio_ps_ruta": r[13],
                    "transcripcion_p": r[14],
                    "transcripcion_ps": r[15],
                    "observaciones": obs,
                    "fecha": r[17].strftime("%d/%m/%Y %H:%M") if r[17] else "N/A"
                })
            return Response(results, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class CompileReportView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        paciente_id = request.query_params.get('paciente_id')
        if not paciente_id:
            return Response({'error': 'Falta el parámetro paciente_id'}, status=400)
            
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        import json
        from django.db import connection
        
        # 1. Obtener Paciente
        try:
            paciente = Pacientes.objects.get(pk=paciente_id)
        except Pacientes.DoesNotExist:
            return Response({'error': 'Paciente no encontrado'}, status=404)
            
        paciente_data = {
            'id_paciente': paciente.id_paciente,
            'nombre_completo': paciente.nombre_completo,
            'fecha_nacimiento': paciente.fecha_nacimiento.strftime('%Y-%m-%d') if paciente.fecha_nacimiento else '',
            'edad_actual': paciente.edad_actual,
            'genero': paciente.genero,
            'telefono': paciente.telefono,
            'correo_electronico': paciente.correo_electronico,
            'colegio_ocupacion': paciente.colegio_ocupacion,
            'motivo_consulta': paciente.motivo_consulta,
            'direccion': paciente.direccion,
            'observaciones_generales': paciente.observaciones_generales,
            'fecha_registro': paciente.fecha_registro.strftime('%Y-%m-%d %H:%M') if paciente.fecha_registro else ''
        }
        
        # 2. Obtener último Test de Dislexia
        latest_test = None
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, metodo, a_p, t_p, il_p, r_p, a_ps, t_ps, il_ps, r_ps,
                       diagnostico, detalles_errores, observaciones, transcripcion_p, transcripcion_ps, fecha_registro
                FROM test_dislexia_results
                WHERE id_paciente = %s
                ORDER BY fecha_registro DESC
                LIMIT 1
            """, [paciente_id])
            test_row = cursor.fetchone()
            
        if test_row:
            try:
                detalles = json.loads(test_row[11]) if test_row[11] else []
            except Exception:
                detalles = test_row[11]
            try:
                obs = json.loads(test_row[12]) if test_row[12] else {}
            except Exception:
                obs = test_row[12]
                
            latest_test = {
                'id': test_row[0],
                'metodo': test_row[1],
                'a_p': test_row[2],
                't_p': test_row[3],
                'il_p': test_row[4],
                'r_p': test_row[5],
                'a_ps': test_row[6],
                't_ps': test_row[7],
                'il_ps': test_row[8],
                'r_ps': test_row[9],
                'diagnostico': test_row[10],
                'detalles_errores': detalles,
                'observaciones': obs,
                'transcripcion_p': test_row[13],
                'transcripcion_ps': test_row[14],
                'fecha': test_row[15].strftime('%Y-%m-%d %H:%M') if test_row[15] else ''
            }
            
        # 3. Obtener Primer y Último Juego
        juegos_qs = Resultadosjuegos.objects.filter(id_paciente=paciente_id).order_by('fecha_resultado')
        if date_from:
            juegos_qs = juegos_qs.filter(fecha_resultado__date__gte=date_from)
        if date_to:
            juegos_qs = juegos_qs.filter(fecha_resultado__date__lte=date_to)
            
        total_juegos = juegos_qs.count()
        primer_juego = None
        ultimo_juego = None
        
        if total_juegos > 0:
            first_row = juegos_qs.first()
            last_row = juegos_qs.last()
            
            def map_juego(r):
                correctas = r.respuestas_correctas or 0
                incorrectas = r.respuestas_incorrectas or 0
                totales = r.preguntas_totales or 0
                precision = float(r.porcentaje_resultado) if r.porcentaje_resultado is not None else (round((correctas / totales * 100), 1) if totales > 0 else 0)
                return {
                    'id': r.id_resultado_juego,
                    'juego': r.nombre_juego or 'Constructor de Cohetes',
                    'correctas': correctas,
                    'incorrectas': incorrectas,
                    'precision': precision,
                    'estrellas': r.estrellas_ganadas or 0,
                    'fecha': r.fecha_resultado.strftime('%Y-%m-%d %H:%M') if r.fecha_resultado else ''
                }
                
            primer_juego = map_juego(first_row)
            ultimo_juego = map_juego(last_row)
            
        # 4. Obtener Citas
        citas_qs = Citas.objects.filter(id_paciente=paciente_id).order_by('-fecha_cita', '-hora_inicio')
        if date_from:
            citas_qs = citas_qs.filter(fecha_cita__gte=date_from)
        if date_to:
            citas_qs = citas_qs.filter(fecha_cita__lte=date_to)
            
        total_citas = citas_qs.count()
        citas_list = []
        for c in citas_qs[:20]:
            citas_list.append({
                'id_cita': c.id_cita,
                'titulo_cita': c.titulo_cita,
                'descripcion_cita': c.descripcion_cita,
                'fecha_cita': c.fecha_cita.strftime('%Y-%m-%d') if c.fecha_cita else '',
                'hora_inicio': c.hora_inicio.strftime('%H:%M') if c.hora_inicio else '',
                'estado_cita': c.estado_cita,
                'observaciones': c.observaciones
            })
            
        # 5. Obtener Notas de Seguimiento (excluyendo notas de reporte de este generador)
        notas_qs = Notas.objects.filter(id_paciente=paciente_id).exclude(titulo_nota='Nota de Reporte Clínico').order_by('-fecha_nota')
        if date_from:
            notas_qs = notas_qs.filter(fecha_nota__date__gte=date_from)
        if date_to:
            notas_qs = notas_qs.filter(fecha_nota__date__lte=date_to)
            
        notas_list = []
        for n in notas_qs:
            psicologo_nombre = n.id_psicologo.nombre_completo if n.id_psicologo else 'Especialista'
            notas_list.append({
                'id_nota': n.id_nota,
                'titulo_nota': n.titulo_nota,
                'descripcion_nota': n.descripcion_nota,
                'fecha_nota': n.fecha_nota.strftime('%Y-%m-%d %H:%M') if n.fecha_nota else '',
                'psicologo_nombre': psicologo_nombre
            })

        # 6. Obtener Notas de Reporte (sin filtrar por fecha para que no desaparezcan)
        notas_reporte_qs = Notas.objects.filter(id_paciente=paciente_id, titulo_nota='Nota de Reporte Clínico').order_by('-fecha_nota')
        notas_reporte_list = []
        for n in notas_reporte_qs:
            psicologo_nombre = n.id_psicologo.nombre_completo if n.id_psicologo else 'Especialista'
            notas_reporte_list.append({
                'id_nota': n.id_nota,
                'titulo_nota': n.titulo_nota,
                'descripcion_nota': n.descripcion_nota,
                'fecha_nota': n.fecha_nota.strftime('%Y-%m-%d %H:%M') if n.fecha_nota else '',
                'psicologo_nombre': psicologo_nombre
            })
            
        return Response({
            'paciente': paciente_data,
            'latest_test': latest_test,
            'progreso_juegos': {
                'total_juegos': total_juegos,
                'primer_juego': primer_juego,
                'ultimo_juego': ultimo_juego
            },
            'citas': {
                'total_citas': total_citas,
                'lista_citas': citas_list
            },
            'notas_seguimiento': notas_list,
            'notas_reporte': notas_reporte_list
        }, status=200)

    def post(self, request):
        paciente_id = request.data.get('paciente_id')
        titulo = request.data.get('titulo', 'Nota de Reporte Clínico')
        descripcion = request.data.get('descripcion')
        psicologo_id = request.data.get('psicologo_id')
        
        if not paciente_id or not descripcion:
            return Response({'error': 'Faltan campos requeridos (paciente_id, descripcion)'}, status=400)
            
        try:
            paciente = Pacientes.objects.get(pk=paciente_id)
        except Pacientes.DoesNotExist:
            return Response({'error': 'Paciente no encontrado'}, status=404)
            
        psicologo = None
        if psicologo_id:
            try:
                psicologo = Psicologos.objects.get(pk=psicologo_id)
            except Psicologos.DoesNotExist:
                pass
        
        if not psicologo:
            psicologo = paciente.id_psicologo or Psicologos.objects.first()
            
        from django.utils import timezone
        historial, created = Historiales.objects.get_or_create(
            id_paciente=paciente,
            defaults={
                'id_psicologo': psicologo,
                'titulo_historial': f"Historial Clínico - {paciente.nombre_completo}",
                'descripcion_historial': "Historial clínico general creado automáticamente",
                'fecha_historial': timezone.now()
            }
        )
        
        nota = Notas.objects.create(
            id_historial=historial,
            id_paciente=paciente,
            id_psicologo=psicologo,
            titulo_nota=titulo,
            descripcion_nota=descripcion,
            fecha_nota=timezone.now()
        )
        
        return Response({
            'success': True,
            'id_nota': nota.id_nota,
            'titulo_nota': nota.titulo_nota,
            'descripcion_nota': nota.descripcion_nota,
            'fecha_nota': nota.fecha_nota.strftime('%Y-%m-%d %H:%M'),
            'psicologo_nombre': psicologo.nombre_completo
        }, status=201)


class MensajesAdminView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario_id = request.query_params.get('usuario_id')
        role = request.query_params.get('role')
        
        if not usuario_id:
            return Response({'error': 'Falta usuario_id'}, status=400)
            
        if role == 'ADMINISTRADOR':
            qs = MensajesAdmin.objects.filter(id_emisor=usuario_id).order_by('-fecha_envio')
        else:
            qs = MensajesAdmin.objects.filter(id_receptor=usuario_id).order_by('-fecha_envio')
            
        return Response(MensajesAdminSerializer(qs, many=True).data)

    def post(self, request):
        emisor_id = request.data.get('emisor_id')
        receptor_ids = request.data.get('receptor_ids', [])
        contenido = request.data.get('contenido')
        titulo = request.data.get('titulo', 'Mensaje de Administrador')
        
        if not emisor_id or not receptor_ids or not contenido:
            return Response({'error': 'Faltan campos requeridos'}, status=400)
            
        try:
            emisor = Usuarios.objects.get(pk=emisor_id)
        except Usuarios.DoesNotExist:
            return Response({'error': 'Emisor no encontrado'}, status=404)
            
        if isinstance(receptor_ids, str) or isinstance(receptor_ids, int):
            receptor_ids = [int(receptor_ids)]
            
        created_messages = []
        for r_id in receptor_ids:
            try:
                receptor = Usuarios.objects.get(pk=r_id)
                msg = MensajesAdmin.objects.create(
                    id_emisor=emisor,
                    id_receptor=receptor,
                    titulo=titulo,
                    contenido=contenido,
                    leido=False
                )
                created_messages.append(msg)
            except Usuarios.DoesNotExist:
                continue
                
        return Response({'success': True, 'count': len(created_messages)}, status=201)


class MensajeReadView(APIView):
    permission_classes = [AllowAny]
    
    def patch(self, request, pk):
        try:
            msg = MensajesAdmin.objects.get(pk=pk)
            msg.leido = True
            msg.save()
            return Response({'success': True})
        except MensajesAdmin.DoesNotExist:
            return Response({'error': 'Mensaje no encontrado'}, status=404)
