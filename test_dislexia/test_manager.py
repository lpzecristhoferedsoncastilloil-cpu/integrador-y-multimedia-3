import os
import sys
import wave
import json
import random
from datetime import datetime

# Estímulos oficiales PROLEC-R
WORDS_LIST = [
    # Columna 1
    "uva", "gamo", "riña", "buitre", "genio", "nieve", "fango", "nobleza", "aguja", "corona",
    # Columna 2
    "carreta", "glucosa", "trapecio", "estornudo", "teclado", "blancura", "alfombra", "armario", "testigo", "ombligo",
    # Columna 3
    "pandereta", "electorado", "redundancia", "medicamento", "aristocracia", "arquitectura", "laringitis", "sintonía", "influencia", "sutil",
    # Columna 4
    "contaminante", "posterioridad", "adiestramiento", "protestantismo", "mercantiles", "fundamental", "constitucional", "revolucionario", "dromedario", "magistrado"
]

PSEUDOWORDS_LIST = [
    # Columna 1
    "uja", "jela", "viza", "molga", "grupo", "mieve", "bango", "poleza", "otuja", "calona",
    # Columna 2
    "marresa", "tropasio", "espormijo", "culbito", "crasura", "taspigo", "emprobla", "osmario", "jorina", "umbrico",
    # Columna 3
    "canserela", "asortorado", "tancalanio", "voliparento", "clesidracia", "orquitectura", "laringosna", "sintomía", "infroncia", "sutal",
    # Columna 4
    "planamirande", "monserioletan", "traperindosula", "eriestramuenzo", "parparlamienzo", "foranderasolinda", "tropanderaselión", "engraderasionisca", "dromisario", "modistrado"
]

# Baremos Oficiales por edad / curso
# 7 años = 2º Primaria, 8 años = 3º Primaria, 9 años = 4º Primaria, 10+ años = 5º Primaria
BAREMOS = {
    7: { # 2º Primaria
        "P": {"Normal": (34, 40), "Dudas": (32, 33), "D": (30, 31), "DD": (0, 29)},
        "IL_P": {"Normal": (56.1, 999.0), "D": (39.2, 56.0), "DD": (0.0, 39.1)},
        "PS": {"Normal": (28, 40), "Dudas": (25, 27), "D": (22, 24), "DD": (0, 21)},
        "IL_PS": {"Normal": (28.5, 999.0), "D": (18.3, 28.4), "DD": (0.0, 18.2)}
    },
    8: { # 3º Primaria
        "P": {"Normal": (36, 40), "Dudas": (34, 35), "D": (32, 33), "DD": (0, 31)},
        "IL_P": {"Normal": (82.5, 999.0), "D": (56.3, 82.4), "DD": (0.0, 56.2)},
        "PS": {"Normal": (31, 40), "Dudas": (28, 30), "D": (25, 27), "DD": (0, 24)},
        "IL_PS": {"Normal": (41.5, 999.0), "D": (26.1, 41.4), "DD": (0.0, 26.0)}
    },
    9: { # 4º Primaria
        "P": {"Normal": (38, 40), "Dudas": (37, 37), "D": (35, 36), "DD": (0, 34)},
        "IL_P": {"Normal": (105.2, 999.0), "D": (74.4, 105.1), "DD": (0.0, 74.3)},
        "PS": {"Normal": (33, 40), "Dudas": (31, 32), "D": (28, 30), "DD": (0, 27)},
        "IL_PS": {"Normal": (56.8, 999.0), "D": (37.0, 56.7), "DD": (0.0, 36.9)}
    },
    10: { # 5º Primaria (y mayores)
        "P": {"Normal": (39, 40), "Dudas": (38, 38), "D": (36, 37), "DD": (0, 35)},
        "IL_P": {"Normal": (124.0, 999.0), "D": (91.2, 123.9), "DD": (0.0, 91.1)},
        "PS": {"Normal": (34, 40), "Dudas": (32, 33), "D": (29, 31), "DD": (0, 28)},
        "IL_PS": {"Normal": (69.4, 999.0), "D": (46.2, 69.3), "DD": (0.0, 46.1)}
    }
}

def get_range(val, baremo_dict):
    """Auxiliar para buscar el rango de una puntuacion o indice."""
    for label, r in baremo_dict.items():
        if r[0] <= val <= r[1]:
            return label
    return "DD"

def calculate_all_indices(edad, a_p, t_p, a_ps, t_ps):
    """
    Calcula los indices IL-P e IL-PS y retorna los baremos correspondientes segun la edad.
    """
    # Acoplar edad al rango 7-10 años
    age_key = max(7, min(10, int(edad)))
    baremo_edad = BAREMOS[age_key]
    
    # 1. Calcular indices de lectura
    il_p = round((a_p / max(1.0, t_p)) * 100, 2)
    il_ps = round((a_ps / max(1.0, t_ps)) * 100, 2)
    
    # 2. Clasificar rangos
    r_p = get_range(a_p, baremo_edad["P"])
    r_ps = get_range(a_ps, baremo_edad["PS"])
    r_il_p = get_range(il_p, baremo_edad["IL_P"])
    r_il_ps = get_range(il_ps, baremo_edad["IL_PS"])
    
    # 3. Arbol de decision clínico
    if r_il_p == "Normal" and r_il_ps == "Normal":
        diagnostico = "LECTOR NORMAL"
    elif r_il_ps == "DD" and r_il_p != "DD":
        diagnostico = "DISLEXIA FONOLÓGICA"
    elif r_il_p == "DD" and r_il_ps != "DD":
        diagnostico = "DISLEXIA SUPERFICIAL (VISUAL)"
    elif r_il_p == "DD" and r_il_ps == "DD":
        diagnostico = "DISLEXIA MIXTA"
    else:
        # Casos con dificultad leve (D)
        diagnostico = "DIFICULTAD LEVE DE LECTURA"
        
    return {
        "il_p": il_p, "r_p": r_p, "r_il_p": r_il_p,
        "il_ps": il_ps, "r_ps": r_ps, "r_il_ps": r_il_ps,
        "diagnostico": diagnostico
    }


def get_audio_duration(file_path):
    """
    Intenta leer el archivo de audio para extraer su duracion en segundos.
    Tiene fallback seguro basado en tamaño del archivo.
    """
    try:
        with wave.open(file_path, 'rb') as f:
            frames = f.getnframes()
            rate = f.getframerate()
            return round(frames / float(rate), 2)
    except Exception:
        try:
            # Estimar duracion para WAV PCM mono 16kHz (32000 bytes por segundo)
            size = os.path.getsize(file_path)
            return round(max(8.0, min(120.0, size / 32000.0)), 2)
        except Exception:
            return 35.0


def clean_word(w):
    if not w:
        return ""
    import unicodedata
    import re
    # Convert to lowercase
    w = w.lower()
    # Remove accents
    w = "".join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
    # Remove non-alphanumeric
    w = re.sub(r'[^a-z0-9]', '', w)
    return w


def get_edit_distance(a, b):
    if len(a) == 0: return len(b)
    if len(b) == 0: return len(a)
    
    matrix = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        matrix[i][0] = i
    for j in range(len(b) + 1):
        matrix[0][j] = j
        
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                matrix[i][j] = matrix[i - 1][j - 1]
            else:
                matrix[i][j] = min(
                    matrix[i - 1][j - 1] + 1, # substitution
                    matrix[i][j - 1] + 1,     # insertion
                    matrix[i - 1][j] + 1      # deletion
                )
    return matrix[len(a)][len(b)]


def fuzzy_match(s_clean, t_clean):
    max_len = max(len(s_clean), len(t_clean))
    if max_len == 0:
        return False
    dist = get_edit_distance(s_clean, t_clean)
    if max_len <= 3:
        return dist == 0
    elif max_len <= 5:
        return dist <= 1
    else:
        return dist <= 2


def process_audio_test(audio_path, list_type, edad, transcription=""):
    """
    Procesa un archivo de audio grabado/subido del paciente y realiza una
    alineación con la lista de estímulos oficiales utilizando la transcripción
    real dictada en tiempo real.
    """
    duration = get_audio_duration(audio_path)
    
    if list_type == 'WORDS':
        stimuli = WORDS_LIST
    else:
        stimuli = PSEUDOWORDS_LIST
        
    import re
    
    # Separar la transcripción en tokens (palabras pronunciadas)
    spoken_tokens = [tok.strip() for tok in re.split(r'[\s,]+', transcription) if tok.strip()]
    spoken_clean = [clean_word(tok) for tok in spoken_tokens]
    
    target_clean = [clean_word(w) for w in stimuli]
    
    spoken_idx = 0
    detalles = []
    aciertos_final = 0
    transcripcion_palabras = []
    
    for idx, target in enumerate(stimuli):
        t_clean = target_clean[idx]
        
        match_idx = -1
        search_limit = min(len(spoken_clean), spoken_idx + 8)
        
        # Buscar coincidencia difusa en la ventana
        for j in range(spoken_idx, search_limit):
            if fuzzy_match(spoken_clean[j], t_clean):
                match_idx = j
                break
                
        if match_idx != -1:
            is_hesitation = False
            is_incorrect = False
            matched_token = spoken_tokens[match_idx]
            matched_clean = spoken_clean[match_idx]
            
            # Si hay diferencia en caracteres limpios, es error de lectura (sustitución, etc.)
            if matched_clean != t_clean:
                is_incorrect = True
                
            read_as_arr = []
            
            # Comprobar tokens previos (stutters/vacilaciones)
            for k in range(spoken_idx, match_idx):
                tok = spoken_tokens[k]
                tok_clean = spoken_clean[k]
                if t_clean.startswith(tok_clean) or '..' in tok or len(tok_clean) <= 3:
                    is_hesitation = True
                    read_as_arr.append(tok)
            
            read_as_arr.append(matched_token)
            
            if '..' in matched_token:
                is_hesitation = True
                
            state = 'correct'
            if is_incorrect:
                state = 'incorrect'
            elif is_hesitation:
                state = 'hesitation'
            else:
                aciertos_final += 1
                
            detalles.append({
                "word": target,
                "state": state,
                "read_as": " ".join(read_as_arr)
            })
            transcripcion_palabras.append(" ".join(read_as_arr))
            spoken_idx = match_idx + 1
        else:
            # Palabra no pronunciada o saltada
            detalles.append({
                "word": target,
                "state": "incorrect",
                "read_as": "no se escuchó la palabra"
            })
            transcripcion_palabras.append("(no se escuchó la palabra)")
            
    transcripcion_completa = ", ".join(transcripcion_palabras)
    
    return {
        "aciertos": aciertos_final,
        "tiempo": duration,
        "transcripcion": transcripcion_completa if transcription.strip() else "",
        "detalles": detalles
    }
