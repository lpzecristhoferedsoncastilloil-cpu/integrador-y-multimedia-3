"""Retroactively generate resultadosjuegos entries for past sessions that had attempts but failed to save."""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.utils import timezone

with connection.cursor() as cursor:
    # Find sessions that have attempts but no corresponding resultadosjuegos entry
    cursor.execute('''
        SELECT gs.id, gp.id_paciente, gs.level, gs.score, gs.total_time_seconds
        FROM game_sessions gs
        JOIN game_players gp ON gs.player_id = gp.id
        ORDER BY gs.id
    ''')
    sessions = cursor.fetchall()
    
    inserted = 0
    for sess_id, id_paciente, level, score, total_time in sessions:
        # Count attempts for this session
        cursor.execute('''
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END), 0) as correct,
                COALESCE(SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END), 0) as incorrect
            FROM game_attempts
            WHERE session_id = %s
        ''', [sess_id])
        row = cursor.fetchone()
        total = row[0] or 0
        correct = row[1] or 0
        incorrect = row[2] or 0
        
        if total == 0:
            continue  # Skip sessions with no attempts
        
        pct = round((correct / total * 100), 2) if total > 0 else 0
        if pct >= 80:
            estrellas = 3
        elif pct >= 50:
            estrellas = 2
        else:
            estrellas = 1
        
        # Determine nivel
        if level <= 3:
            id_nivel = 1
        elif level <= 6:
            id_nivel = 2
        else:
            id_nivel = 3
        
        fecha = timezone.now()
        
        cursor.execute('''
            INSERT INTO resultadosjuegos (
                id_paciente, id_nivel, id_subnivel, nombre_juego,
                respuestas_correctas, respuestas_incorrectas, respuestas_sin_responder,
                preguntas_totales, tiempo_jugado_segundos, estrellas_ganadas,
                niveles_completados, porcentaje_resultado,
                estado_resultado, fecha_resultado
            ) VALUES (%s, %s, 1, 'Constructor de Cohetes', %s, %s, 0, %s, %s, %s, %s, %s, 'COMPLETADO', %s)
        ''', [
            id_paciente, id_nivel,
            correct, incorrect, total,
            total_time or 0, estrellas, level,
            pct, fecha
        ])
        inserted += 1
        print(f'  Session {sess_id}: {correct}/{total} ({pct}%) -> {estrellas} estrellas')
    
    print(f'\nTotal registros insertados en resultadosjuegos: {inserted}')
