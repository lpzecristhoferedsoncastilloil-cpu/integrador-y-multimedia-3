import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def seed_attempts():
    print("Iniciando insercion de datos de prueba para el Sistema Experto...")
    
    # 1. Obtener la sesion mas reciente del jugador 4 o crear una
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM game_players WHERE id = 4")
        player = cursor.fetchone()
        if not player:
            print("Error: No se encontro el jugador con id 4 (Paciente 6).")
            return
        
        # Obtener o crear algunas sesiones del jugador para diferentes juegos
        juegos_y_tipos = [
            # Fonologicos
            ('rocket_builder', 1),
            ('cheese', 2),
            ('temple', 7),
            ('train', 8),
            # Superficiales
            ('grafema', 2),
            ('hangman', 3),
            ('warehouse', 6),
            ('machine', 4),
            # Mixtos
            ('river', 5),
            ('maze', 1)
        ]
        
        sesiones_ids = {}
        for game_type, game_num in juegos_y_tipos:
            # Buscar una sesion existente
            cursor.execute("""
                SELECT id FROM game_sessions 
                WHERE player_id = 4 AND game_type = %s 
                ORDER BY fecha_inicio DESC LIMIT 1
            """, [game_type])
            sess = cursor.fetchone()
            
            if sess:
                sesiones_ids[game_type] = sess[0]
            else:
                # Crear una nueva
                cursor.execute("""
                    INSERT INTO game_sessions (player_id, game_type, game_number, level, score, total_time_seconds, fecha_inicio)
                    VALUES (4, %s, %s, 1, 80, 150, %s)
                """, [game_type, game_num, datetime.now() - timedelta(days=random.randint(1, 5))])
                sesiones_ids[game_type] = cursor.lastrowid

        print(f"Sesiones obtenidas/creadas: {sesiones_ids}")
        
        # Eliminar intentos previos de estas sesiones para evitar duplicacion y tener control
        sessions_list = list(sesiones_ids.values())
        format_strings = ','.join(['%s'] * len(sessions_list))
        cursor.execute(f"DELETE FROM game_attempts WHERE session_id IN ({format_strings})", sessions_list)
        print("Intentos anteriores borrados de estas sesiones para sobreescribir con datos controlados.")

        # Intentos predefinidos: (game_type, word_shown, answer_given, is_correct, reaction_time_ms, error_type)
        intentos = [
            # RUTA FONOLOGICA (Errores leves, mayormente aciertos)
            # Rocket Builder (Silaba/Voz)
            ('rocket_builder', 'MA_A', 'MA_A', 1, 2400, None),
            ('rocket_builder', 'PE_RO', 'PE_RO', 1, 2800, None),
            ('rocket_builder', 'GA_TO', 'CA_TO', 0, 5200, 'sustitucion_sonora'), # Confunde G por C
            ('rocket_builder', 'PL_TO', 'PL_TO', 1, 3100, None),
            
            # Cheese (Rimas)
            ('cheese', 'CUNA-LUNA', 'LUNA', 1, 2100, None),
            ('cheese', 'MESA-PESA', 'PESA', 1, 1800, None),
            ('cheese', 'PATO-GATO', 'GATO', 1, 2300, None),
            ('cheese', 'BOLA-CASA', 'CASA', 0, 4800, 'rima_incorrecta'), # Falla rima
            
            # Temple (Eco/Silaba tonica)
            ('temple', 'AR-BOL', 'AR-BOL', 1, 3200, None),
            ('temple', 'CAN-CION', 'CAN-CION', 1, 2900, None),
            ('temple', 'ME-DI-CO', 'ME-DI-CO', 1, 3500, None),
            ('temple', 'PLATA-NO', 'PLA-TANO', 0, 6100, 'acentuacion_incorrecta'), # Falla silaba tonica
            
            # Train (Fonema inicial)
            ('train', 'OSO', 'O', 1, 1900, None),
            ('train', 'UVA', 'U', 1, 2200, None),
            ('train', 'PIÑA', 'B', 0, 5500, 'fonema_incorrecto'), # Confunde P/B
            
            # RUTA SUPERFICIAL / VISUAL (Muchos errores ortograficos y tiempos muy altos)
            # Grafema Hunter
            ('grafema', '_ACA', 'B', 0, 6800, 'confusion_b_v'), # VACA -> BACA
            ('grafema', '_OLA', 'B', 1, 3400, None), # BOLA -> B
            ('grafema', 'TU_O', 'V', 0, 7100, 'confusion_b_v'), # TUBO -> TUVO
            ('grafema', '_IENTO', 'V', 1, 4100, None), # VIENTO -> V
            ('grafema', '_IEN', 'B', 0, 6200, 'confusion_b_v'), # BIEN -> VIEN
            
            ('grafema', '_ENTE', 'J', 0, 5900, 'confusion_g_j'), # GENTE -> JENTE
            ('grafema', 'JIRA_A', 'F', 1, 3300, None),
            ('grafema', 'E_EMPLO', 'G', 0, 6400, 'confusion_g_j'), # EJEMPLO -> EGEMPLO
            ('grafema', 'GEMA_AS', 'J', 0, 5700, 'confusion_g_j'), # GEMELAS -> JEMELAS
            
            ('grafema', '_APATO', 'S', 0, 5500, 'confusion_c_s_z'), # ZAPATO -> SAPATO
            ('grafema', 'CA_A', 'Z', 0, 5900, 'confusion_c_s_z'), # CASA -> CAZA
            ('grafema', 'CI_LO', 'C', 1, 3900, None),
            
            ('grafema', '_ADO', 'B', 0, 7500, 'letra_espejo'), # DADO -> BADO (d/b mirror)
            ('grafema', 'DE_O', 'B', 0, 7800, 'letra_espejo'), # DEDO -> DEBO
            ('grafema', '_OTA', 'D', 0, 7200, 'letra_espejo'), # BOTA -> DOTA
            
            # Hangman (Rescate de letras)
            ('hangman', 'CABALLO', 'CABALO', 0, 8200, 'omision_doble_l'),
            ('hangman', 'PERRO', 'PERO', 0, 7400, 'omision_doble_r'),
            ('hangman', 'HUEVO', 'UEVO', 0, 6900, 'omision_h'),
            ('hangman', 'HELADO', 'ELADO', 0, 6500, 'omision_h'),
            ('hangman', 'QUESO', 'KESO', 0, 5900, 'sustitucion_letra'),
            ('hangman', 'SOL', 'SOL', 1, 2300, None),
            
            # Warehouse (Almacen / Sopa)
            ('warehouse', 'VACA', 'BACA', 0, 7800, 'confusion_b_v'),
            ('warehouse', 'GATO', 'GATO', 1, 3200, None),
            ('warehouse', 'JIRAFA', 'GIRAFA', 0, 7100, 'confusion_g_j'),
            ('warehouse', 'ZAPATO', 'SAPATO', 0, 6300, 'confusion_c_s_z'),
            ('warehouse', 'CASA', 'CASA', 1, 2900, None),
            ('warehouse', 'OSO', 'OSO', 1, 2100, None),
            
            # Machine (Mantenimiento / Morfologia)
            ('machine', 'DES-HACER', 'DES-ACER', 0, 6900, 'omision_h'),
            ('machine', 'SUB-TERRANEO', 'SUBTERRANEO', 1, 4200, None),
            ('machine', 'IN-CREIBLE', 'INCREIBLE', 1, 3500, None),
            ('machine', 'TRANS-PORTE', 'TRAS-PORTE', 0, 6100, 'omision_letra'),
            
            # RUTA MIXTA / SEMANTICA
            # River (Rio Cosmico)
            ('river', 'RAPIDO-VELOZ', 'VELOZ', 1, 3300, None),
            ('river', 'GRANDE-ENORME', 'ENORME', 1, 3100, None),
            ('river', 'SABIO-IGNORANTE', 'IGNORANTE', 0, 5200, 'antonimo_por_sinonimo'), # Falla semantica
            ('river', 'FACIL-DIFICIL', 'DIFICIL', 1, 3600, None),
            
            # Maze (Laberinto)
            ('maze', 'NORTE-SUR', 'SUR', 1, 4100, None),
            ('maze', 'ESTE-OESTE', 'OESTE', 1, 4500, None),
            ('maze', 'DERECHA-IZQUIERDA', 'IZQUIERDA', 1, 3900, None),
        ]
        
        # Insertar los intentos en la base de datos
        insert_count = 0
        for game_type, word_shown, answer_given, is_correct, reaction_time_ms, error_type in intentos:
            sess_id = sesiones_ids.get(game_type)
            if sess_id:
                cursor.execute("""
                    INSERT INTO game_attempts (session_id, word_shown, answer_given, is_correct, reaction_time_ms, error_type, num_clicks, attempt_number)
                    VALUES (%s, %s, %s, %s, %s, %s, 1, 1)
                """, [sess_id, word_shown, answer_given, is_correct, reaction_time_ms, error_type])
                insert_count += 1
                
        # Asegurar que se inserte en resultadosjuegos consolidado
        # Para que aparezca en el historial medico
        cursor.execute("SELECT id_paciente FROM game_players WHERE id = 4")
        id_paciente = cursor.fetchone()[0]
        
        # Eliminar resultados antiguos consolidados de prueba para evitar duplicados en tablas
        cursor.execute("""
            DELETE FROM resultadosjuegos 
            WHERE id_paciente = %s AND nombre_juego IN ('El Laberinto', 'El Reto del Queso', 'El Rescate de las Letras', 'La Maquina de Silabas', 'El Rio Cosmico', 'El Almacen', 'El Eco de las Silabas', 'El Tren de las Letras')
        """, [id_paciente])
        
        # Insertar algunos registros de resultadosjuegos
        resultados_seeding = [
            ('El Laberinto', 1, 1, 3, 0, 3, 120, 3, 1, 100.0),
            ('El Reto del Queso', 1, 2, 3, 1, 4, 150, 2, 1, 75.0),
            ('El Rescate de las Letras', 1, 3, 1, 5, 6, 280, 1, 1, 16.6),
            ('La Maquina de Silabas', 1, 4, 2, 2, 4, 180, 2, 1, 50.0),
            ('El Rio Cosmico', 1, 5, 3, 1, 4, 160, 2, 1, 75.0),
            ('El Almacen', 1, 1, 3, 3, 6, 320, 1, 1, 50.0),
            ('El Eco de las Silabas', 1, 2, 3, 1, 4, 190, 3, 1, 75.0),
            ('El Tren de las Letras', 1, 3, 1, 1, 2, 80, 2, 1, 50.0),
        ]
        
        for nombre, id_nivel, id_subnivel, corr, inc, tot, tiempo_seg, estrellas, comp, porc in resultados_seeding:
            cursor.execute("""
                INSERT INTO resultadosjuegos (id_paciente, id_nivel, id_subnivel, nombre_juego, respuestas_correctas, respuestas_incorrectas, respuestas_sin_responder, preguntas_totales, tiempo_jugado_segundos, estrellas_ganadas, niveles_completados, porcentaje_resultado, estado_resultado)
                VALUES (%s, %s, %s, %s, %s, %s, 0, %s, %s, %s, %s, %s, 'COMPLETADO')
            """, [id_paciente, id_nivel, id_subnivel, nombre, corr, inc, tot, tiempo_seg, estrellas, comp, porc])
            
        print(f"Exito: Insertados {insert_count} intentos de juego y {len(resultados_seeding)} registros de resultados consolidados para el paciente 6.")

if __name__ == '__main__':
    seed_attempts()
