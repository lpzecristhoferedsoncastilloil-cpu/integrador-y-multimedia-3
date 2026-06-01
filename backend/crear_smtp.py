import MySQLdb

try:
    db = MySQLdb.connect(host='127.0.0.1', user='root', passwd='', db='clinicas_psicologicas_dislexias')
    cursor = db.cursor()
    
    # Crear tabla configuracion_smtp
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS configuracion_smtp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        correo_emisor VARCHAR(150) NOT NULL,
        contrasena_aplicacion VARCHAR(100) NOT NULL,
        servidor_smtp VARCHAR(150) NOT NULL,
        puerto INT NOT NULL,
        use_tls TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """)
    
    # Insertar registro por defecto si está vacía
    cursor.execute("SELECT COUNT(*) FROM configuracion_smtp")
    count = cursor.fetchone()[0]
    if count == 0:
        cursor.execute("""
        INSERT INTO configuracion_smtp (correo_emisor, contrasena_aplicacion, servidor_smtp, puerto, use_tls)
        VALUES ('tu_correo_corporativo@gmail.com', 'tu_contrasena_de_aplicacion', 'smtp.gmail.com', 587, 1)
        """)
        db.commit()
        print("Tabla configuracion_smtp creada e inicializada con éxito.")
    else:
        print("La tabla configuracion_smtp ya existe y tiene registros.")
        
except Exception as e:
    print("Error al inicializar la base de datos:", str(e))
