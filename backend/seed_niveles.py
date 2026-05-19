"""Seed script to populate niveles and subniveles tables."""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Check if already populated
    cursor.execute('SELECT COUNT(*) FROM niveles')
    if cursor.fetchone()[0] > 0:
        print('Niveles ya existen, omitiendo...')
    else:
        cursor.execute("""
            INSERT INTO niveles (id_nivel, tipo_dislexia, id_juego, nombre_nivel, dificultad_nivel, orden_nivel, tiempo_limite, cantidad_intentos)
            VALUES
            (1, 'FONOLOGICA', 1, 'Conciencia Fonologica', 'FACIL', 1, 300, 3),
            (2, 'FONOLOGICA', 1, 'Silabas Compuestas', 'MEDIO', 2, 240, 3),
            (3, 'FONOLOGICA', 1, 'Formacion de Palabras', 'DIFICIL', 3, 180, 3),
            (4, 'SUPERFICIAL', 1, 'Reconocimiento Visual', 'FACIL', 4, 300, 3),
            (5, 'MIXTA', 1, 'Nivel Mixto', 'MEDIO', 5, 240, 3)
        """)
        print('5 niveles insertados.')

    cursor.execute('SELECT COUNT(*) FROM subniveles')
    if cursor.fetchone()[0] > 0:
        print('Subniveles ya existen, omitiendo...')
    else:
        cursor.execute("""
            INSERT INTO subniveles (id_subnivel, id_nivel, nombre_subnivel, tipo_actividad, cantidad_ejercicios, orden_subnivel)
            VALUES
            (1, 1, 'Constructor de Cohetes', 'SILABAS', 10, 1),
            (2, 1, 'Nivel Basico', 'SILABAS', 5, 2),
            (3, 2, 'Nivel Intermedio', 'SILABAS', 8, 1),
            (4, 3, 'Nivel Avanzado', 'SILABAS', 10, 1),
            (5, 4, 'Visual Basico', 'VISUAL', 5, 1)
        """)
        print('5 subniveles insertados.')

print('Seed completado.')
