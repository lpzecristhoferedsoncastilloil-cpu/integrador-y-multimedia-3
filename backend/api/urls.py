from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('padres', views.PadresViewSet)
router.register('pacientes', views.PacientesViewSet)
router.register('citas', views.CitasViewSet)
router.register('historiales', views.HistorialesViewSet)
router.register('notas', views.NotasViewSet)
router.register('tests', views.TestsViewSet)
router.register('test-archivos', views.TestArchivosViewSet)
router.register('reportes', views.ReportesViewSet)
router.register('resultados-juegos', views.ResultadosJuegosViewSet)
router.register('psicologos', views.PsicologosViewSet)
router.register('usuarios', views.UsuariosViewSet)
router.register('niveles', views.NivelesViewSet)
router.register('subniveles', views.SubnivelesViewSet)

urlpatterns = [
    path('psicologos-lista/', views.UsuariosPsicologosView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('dashboard/', views.DashboardView.as_view()),
    path('juegos/', views.JuegosView.as_view()),
    path('estadisticas/', views.EstadisticasView.as_view()),
    path('notificaciones/', views.NotificacionesView.as_view()),
    path('notificaciones/<int:pk>/', views.NotificacionesView.as_view()),
    path('psicologos/adicionar/', views.AdicionarPsicologoView.as_view()),
    
    # Games API
    path('patients/', views.PatientsListView.as_view()),
    path('games/player/register', views.GamePlayerRegisterView.as_view()),
    path('games/player/login', views.GamePlayerLoginView.as_view()),
    path('games/patient/<int:patient_id>/players', views.PatientPlayersListView.as_view()),
    path('games/config/<int:player_id>/<str:game_key>', views.GameConfigView.as_view()),
    path('games/config/<int:player_id>/<str:game_key>/<int:level>', views.GameConfigLevelView.as_view()),
    path('games/session/start', views.GameSessionStartView.as_view()),
    path('games/attempt', views.GameAttemptView.as_view()),
    path('games/voice', views.GameVoiceView.as_view()),
    path('games/session/<int:session_id>/complete', views.GameSessionCompleteView.as_view()),
    path('games/upload_word_image', views.GameUploadWordImageView.as_view()),
    path('configuracion-smtp/', views.ConfiguracionSmtpView.as_view()),
    path('games/podio/<int:session_id>/', views.GamePodioView.as_view()),
    path('avatar/opciones/', views.OpcionesAvatarListView.as_view()),
    path('avatar/paciente/<int:id_paciente>/', views.AvatarPacienteDetailView.as_view()),
    
    # Sistema Experto IA
    path('experto-ia/', views.ExpertoIAView.as_view()),
    path('experto-ia/excel/', views.ExpertoIAExcelView.as_view()),
    
    # Test de Dislexia
    path('test-dislexia/procesar/', views.TestDislexiaProcesarView.as_view()),
    path('test-dislexia/guardar/', views.TestDislexiaGuardarView.as_view()),
    path('test-dislexia/historial/', views.TestDislexiaHistorialView.as_view()),
    path('reportes/compile-report/', views.CompileReportView.as_view()),
    path('mensajes/', views.MensajesAdminView.as_view()),
    path('mensajes/<int:pk>/leido/', views.MensajeReadView.as_view()),
    
    path('', include(router.urls)),
]
