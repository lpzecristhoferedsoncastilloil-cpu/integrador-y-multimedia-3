from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from .models import Usuarios

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                # Fallback to key check or sub
                user_id = validated_token.get('sub')
            
            if not user_id:
                raise InvalidToken('Token does not contain user_id')

            user = Usuarios.objects.get(pk=user_id)
            return user
        except Usuarios.DoesNotExist:
            raise AuthenticationFailed('Usuario no encontrado en la base de datos', code='user_not_found')
        except Exception as e:
            raise AuthenticationFailed(str(e))
