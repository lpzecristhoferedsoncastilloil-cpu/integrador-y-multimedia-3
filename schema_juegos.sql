-- ============================================================
-- NeuroGym — Esquema de Base de Datos para el Módulo de Juegos
-- Este script crea las tablas necesarias para soportar el inicio
-- de sesión de pacientes, configuraciones personalizadas de niveles,
-- sesiones de juego, intentos detallados de sílabas/grafemas,
-- confianza de reconocimiento de voz y guardado en el historial clínico.
-- Compatible con MySQL / MariaDB.
-- ============================================================

-- 1. TABLA: game_players
-- Almacena los perfiles de los jugadores (pacientes con apodo y contraseña simple)
CREATE TABLE IF NOT EXISTS `game_players` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` INT(11) NOT NULL,
  `nickname` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `age` INT(11) DEFAULT NULL,
  `laterality` VARCHAR(50) DEFAULT 'right',
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nickname` (`nickname`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `game_players_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: game_configs
-- Almacena la configuración personalizada de niveles creada por el psicólogo para cada jugador
CREATE TABLE IF NOT EXISTS `game_configs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `player_id` INT(11) NOT NULL,
  `game_key` VARCHAR(100) NOT NULL,
  `level` INT(11) NOT NULL,
  `config_data` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_player_game_level` (`player_id`, `game_key`, `level`),
  CONSTRAINT `game_configs_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `game_players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: game_sessions
-- Registra cada sesión de juego iniciada por un paciente
CREATE TABLE IF NOT EXISTS `game_sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `player_id` INT(11) NOT NULL,
  `game_type` VARCHAR(100) NOT NULL,
  `game_number` INT(11) NOT NULL,
  `level` INT(11) NOT NULL,
  `score` INT(11) DEFAULT 0,
  `total_time_seconds` INT(11) DEFAULT 0,
  `fecha_inicio` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `game_sessions_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `game_players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: game_attempts
-- Registra cada ejercicio/intento individual dentro de una sesión de juego (acierto o error)
CREATE TABLE IF NOT EXISTS `game_attempts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `session_id` INT(11) NOT NULL,
  `word_shown` VARCHAR(255) NOT NULL,
  `answer_given` VARCHAR(255) NOT NULL,
  `is_correct` TINYINT(1) NOT NULL,
  `reaction_time_ms` INT(11) NOT NULL,
  `error_type` VARCHAR(100) DEFAULT NULL,
  `num_clicks` INT(11) DEFAULT 0,
  `attempt_number` INT(11) DEFAULT 1,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `game_attempts_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: game_voice
-- Registra los resultados del análisis de voz mediante reconocimiento de voz en los juegos compatibles (ej. Constructor de Cohetes)
CREATE TABLE IF NOT EXISTS `game_voice` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `attempt_id` INT(11) NOT NULL,
  `confidence` FLOAT NOT NULL,
  `num_attempts` INT(11) DEFAULT 1,
  `silence_time_ms` INT(11) DEFAULT 0,
  `recognized_text` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  CONSTRAINT `game_voice_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `game_attempts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA: resultadosjuegos
-- Consolida el historial médico del paciente con los resultados de sus sesiones de juego.
-- Esta tabla vincula las sesiones a la gestión clínica general del psicólogo.
CREATE TABLE IF NOT EXISTS `resultadosjuegos` (
  `id_resultado_juego` INT(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` INT(11) NOT NULL,
  `id_nivel` INT(11) NOT NULL,
  `id_subnivel` INT(11) NOT NULL,
  `nombre_juego` VARCHAR(150) DEFAULT NULL,
  `respuestas_correctas` INT(11) DEFAULT 0,
  `respuestas_incorrectas` INT(11) DEFAULT 0,
  `respuestas_sin_responder` INT(11) DEFAULT 0,
  `preguntas_totales` INT(11) DEFAULT 0,
  `tiempo_jugado_segundos` INT(11) DEFAULT 0,
  `estrellas_ganadas` INT(11) DEFAULT 0,
  `niveles_completados` INT(11) DEFAULT 0,
  `porcentaje_resultado` DECIMAL(5,2) DEFAULT NULL,
  `cantidad_audios_enviados` INT(11) DEFAULT 0,
  `cantidad_pronunciaciones_correctas` INT(11) DEFAULT 0,
  `cantidad_pronunciaciones_incorrectas` INT(11) DEFAULT 0,
  `estado_resultado` ENUM('COMPLETADO', 'INCOMPLETO') DEFAULT 'INCOMPLETO',
  `fecha_resultado` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resultado_juego`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_nivel` (`id_nivel`),
  KEY `id_subnivel` (`id_subnivel`),
  KEY `idx_resultados_fecha` (`fecha_resultado`),
  CONSTRAINT `resultadosjuegos_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE CASCADE,
  CONSTRAINT `resultadosjuegos_ibfk_2` FOREIGN KEY (`id_nivel`) REFERENCES `niveles` (`id_nivel`) ON DELETE CASCADE,
  CONSTRAINT `resultadosjuegos_ibfk_3` FOREIGN KEY (`id_subnivel`) REFERENCES `subniveles` (`id_subnivel`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
