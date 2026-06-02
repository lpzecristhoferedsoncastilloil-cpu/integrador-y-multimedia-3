import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import EstilosAvatar3d, AvatarPaciente

def seed():
    print("Iniciando semillado de 10 estilos únicos por categoría...")
    
    # 1. Limpiar referencias en avatar_paciente para evitar fallos de llaves foráneas
    print("Limpiando avatares de pacientes existentes...")
    AvatarPaciente.objects.all().update(
        id_rostro=None,
        id_ojos=None,
        id_cabello=None,
        id_gorra=None,
        id_lentes=None
    )
    
    # 2. Eliminar estilos antiguos
    print("Borrando estilos antiguos de la base de datos...")
    # Usamos execute raw para resetear el auto_increment a 1 de forma limpia en MySQL/SQLite
    from django.db import connection
    with connection.cursor() as cursor:
        try:
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
            cursor.execute("TRUNCATE TABLE estilos_avatar3d;")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
            print("Auto-incremento reseteado.")
        except Exception:
            # Fallback para SQLite
            cursor.execute("DELETE FROM estilos_avatar3d;")
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='estilos_avatar3d';")
            print("Reseteo fallback ejecutado.")

    # 3. Definir exactamente 10 estilos únicos por categoría
    estilos = [
        # Rostros (10)
        ('rostro', 'Rostro Redondo Space', 'rostro_redondo'),
        ('rostro', 'Rostro Ovalado Space', 'rostro_ovalado'),
        ('rostro', 'Rostro Cachetón Space', 'rostro_cacheton'),
        ('rostro', 'Rostro Cyber-Alargado', 'rostro_alargado'),
        ('rostro', 'Rostro Alienígena Suave', 'rostro_alien'),
        ('rostro', 'Rostro Robotizado Cuadrado', 'rostro_robot'),
        ('rostro', 'Rostro Estelar Diamante', 'rostro_diamante'),
        ('rostro', 'Rostro Andrómeda Joven', 'rostro_andromeda'),
        ('rostro', 'Rostro Galáctico Triangular', 'rostro_triangular'),
        ('rostro', 'Rostro Neón Futurista', 'rostro_neon'),

        # Ojos (10)
        ('ojos', 'Ojos Felices Astro', 'ojos_felices'),
        ('ojos', 'Ojos Brillantes Astro', 'ojos_brillantes'),
        ('ojos', 'Ojos Guiño Astro', 'ojos_guiño'),
        ('ojos', 'Ojos Holográficos Azules', 'ojos_holograficos'),
        ('ojos', 'Ojos de Visor Láser', 'ojos_laser'),
        ('ojos', 'Ojos de Gato Cósmico', 'ojos_gato'),
        ('ojos', 'Ojos de Robot Escáner', 'ojos_escaner'),
        ('ojos', 'Ojos Anime Galaxia', 'ojos_anime'),
        ('ojos', 'Ojos Guiño Creciente', 'ojos_creciente'),
        ('ojos', 'Ojos de Androide Apagado', 'ojos_androide'),

        # Cabello (10)
        ('cabello', 'Cabello Corto Cosmic', 'cabello_corto'),
        ('cabello', 'Cabello Rizado Cosmic', 'cabello_rizado'),
        ('cabello', 'Cabello Coletas Cosmic', 'cabello_coletas'),
        ('cabello', 'Cabello Largo Cosmic', 'cabello_largo'),
        ('cabello', 'Cresta de Supernova', 'cabello_cresta'),
        ('cabello', 'Afro de Nebulosa', 'cabello_afro'),
        ('cabello', 'Peinado Cyberpunk Asimétrico', 'cabello_cyberpunk'),
        ('cabello', 'Trenzas de Plasma', 'cabello_trenzas'),
        ('cabello', 'Cabello de Gravedad Cero', 'cabello_gravedad'),
        ('cabello', 'Casco de Pelo Androide', 'cabello_androide'),

        # Gorras / Sombreros (10)
        ('gorra', 'Gorra Deportiva Star', 'gorra_deportiva'),
        ('gorra', 'Gorra de Lana Star', 'gorra_lana'),
        ('gorra', 'Corona de Rey Star', 'corona_rey'),
        ('gorra', 'Casco Astronauta Mk1', 'casco_astronauta_1'),
        ('gorra', 'Casco de Minero Espacial', 'casco_minero'),
        ('gorra', 'Boina Militar Estelar', 'boina_estelar'),
        ('gorra', 'Sombrero de Copa Orbit', 'sombrero_copa'),
        ('gorra', 'Auriculares de Piloto', 'auriculares_piloto'),
        ('gorra', 'Antenas de Comunicación', 'antenas_comunicacion'),
        ('gorra', 'Gorra de Capitán Cosmos', 'gorra_capitan'),

        # Lentes (10)
        ('lentes', 'Lentes Redondos Lab', 'lentes_redondos'),
        ('lentes', 'Lentes de Estrella Lab', 'lentes_estrella'),
        ('lentes', 'Lentes de Sol Lab', 'lentes_sol'),
        ('lentes', 'Visor Holográfico Alfa', 'lentes_visor_alfa'),
        ('lentes', 'Monóculo Cuántico', 'lentes_monoculo'),
        ('lentes', 'Gafas de Realidad Virtual', 'lentes_vr'),
        ('lentes', 'Visor Táctico de Combate', 'lentes_tactico'),
        ('lentes', 'Lentes Corazón Valentín', 'lentes_corazon'),
        ('lentes', 'Gafas Aviador de Cohete', 'lentes_aviador'),
        ('lentes', 'Antifaz Súper Héroe Cosmos', 'lentes_antifaz')
    ]

    # 4. Insertar los nuevos estilos
    for categoria, nombre_estilo, ruta_recurso in estilos:
        EstilosAvatar3d.objects.create(
            categoria=categoria,
            nombre_estilo=nombre_estilo,
            ruta_recurso=ruta_recurso
        )
        
    print(f"Semillado completado con éxito! Se insertaron {len(estilos)} estilos.")

if __name__ == '__main__':
    seed()
