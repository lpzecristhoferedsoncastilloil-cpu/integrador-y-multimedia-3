import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection, transaction

def migrate():
    print("Iniciando migración física de Base de Datos para Avatar 3D...")
    try:
        with connection.cursor() as cursor:
            # Desactivar llaves foráneas temporalmente para recrear las tablas limpias
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
            
            print("Eliminando tablas anteriores si existen...")
            cursor.execute("DROP TABLE IF EXISTS avatar_paciente;")
            cursor.execute("DROP TABLE IF EXISTS estilos_avatar3d;")
            
            # 1. Crear tabla estilos_avatar3d
            print("Creando tabla 'estilos_avatar3d'...")
            cursor.execute('''
                CREATE TABLE estilos_avatar3d (
                    id_estilo INT AUTO_INCREMENT PRIMARY KEY,
                    categoria VARCHAR(50) NOT NULL,
                    nombre_estilo VARCHAR(150) NOT NULL,
                    ruta_recurso VARCHAR(255) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')

            # 2. Poblar estilos_avatar3d con los estilos base
            print("Poblando estilos_avatar3d con datos semilla...")
            estilos = [
                # Rostro
                ('rostro', 'Rostro Redondo Space', 'rostro_redondo'),
                ('rostro', 'Rostro Ovalado Space', 'rostro_ovalado'),
                ('rostro', 'Rostro Cachetón Space', 'rostro_cacheton'),
                # Ojos
                ('ojos', 'Ojos Felices Astro', 'ojos_felices'),
                ('ojos', 'Ojos Brillantes Astro', 'ojos_brillantes'),
                ('ojos', 'Ojos Guiño Astro', 'ojos_guiño'),
                # Cabello
                ('cabello', 'Cabello Corto Cosmic', 'cabello_corto'),
                ('cabello', 'Cabello Rizado Cosmic', 'cabello_rizado'),
                ('cabello', 'Cabello Coletas Cosmic', 'cabello_coletas'),
                ('cabello', 'Cabello Largo Cosmic', 'cabello_largo'),
                # Gorra
                ('gorra', 'Gorra Deportiva Star', 'gorra_deportiva'),
                ('gorra', 'Gorra de Lana Star', 'gorra_lana'),
                ('gorra', 'Corona de Rey Star', 'corona_rey'),
                # Lentes
                ('lentes', 'Lentes Redondos Lab', 'lentes_redondos'),
                ('lentes', 'Lentes de Estrella Lab', 'lentes_estrella'),
                ('lentes', 'Lentes de Sol Lab', 'lentes_sol')
            ]
            cursor.executemany('''
                INSERT INTO estilos_avatar3d (categoria, nombre_estilo, ruta_recurso)
                VALUES (%s, %s, %s)
            ''', estilos)
            print(f"Sembrados exitosamente {len(estilos)} estilos base.")

            # 3. Crear tabla avatar_paciente
            print("Creando tabla 'avatar_paciente' apuntando a 'estilos_avatar3d'...")
            cursor.execute('''
                CREATE TABLE avatar_paciente (
                    id_avatar_paciente INT AUTO_INCREMENT PRIMARY KEY,
                    id_paciente INT NOT NULL,
                    id_rostro INT NULL,
                    id_ojos INT NULL,
                    id_cabello INT NULL,
                    id_gorra INT NULL,
                    id_lentes INT NULL,
                    color_piel VARCHAR(50) DEFAULT '#ffd8b3',
                    color_ojos VARCHAR(50) DEFAULT '#4f46e5',
                    color_cabello VARCHAR(50) DEFAULT '#1e1b4b',
                    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE,
                    FOREIGN KEY (id_rostro) REFERENCES estilos_avatar3d(id_estilo) ON DELETE SET NULL,
                    FOREIGN KEY (id_ojos) REFERENCES estilos_avatar3d(id_estilo) ON DELETE SET NULL,
                    FOREIGN KEY (id_cabello) REFERENCES estilos_avatar3d(id_estilo) ON DELETE SET NULL,
                    FOREIGN KEY (id_gorra) REFERENCES estilos_avatar3d(id_estilo) ON DELETE SET NULL,
                    FOREIGN KEY (id_lentes) REFERENCES estilos_avatar3d(id_estilo) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
            print("Tabla 'avatar_paciente' recreada con éxito.")
            
        print("¡Migración y población de datos para el Avatar 3D finalizada con éxito!")
    except Exception as e:
        print(f"ERROR DURANTE LA MIGRACIÓN: {e}")
        sys.exit(1)

if __name__ == '__main__':
    migrate()
