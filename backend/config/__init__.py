from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# Parchear can_return_columns_from_insert para MariaDB < 10.5.0 (como MariaDB 10.4 en XAMPP)
from django.db.backends.mysql.features import DatabaseFeatures

# Usamos property estándar en lugar de cached_property para evitar problemas con __set_name__ en Python moderno
DatabaseFeatures.can_return_columns_from_insert = property(
    lambda self: self.connection.mysql_version >= (10, 5, 0) if self.connection.mysql_is_mariadb else False
)
