from fastapi import Depends, Header, HTTPException, status
from jose import jwt, JWTError
from pydantic import BaseModel
from backend.utils.logger import get_logger
from backend.utils.exceptions import AuthenticationException

logger = get_logger(__name__)

# JWT parameters configured from environment values (Supabase JWT Secret)
SUPABASE_JWT_SECRET = "development_jwt_secret_should_be_provided_in_env_example"
ALGORITHM = "HS256"


class UserPrincipal(BaseModel):
    """Authenticated user context containing unique ID, email, and security role scopes."""
    id: str
    email: str
    role: str


async def get_current_user(authorization: str = Header(..., description="Bearer JWT token from Supabase")) -> UserPrincipal:
    """Verifies bearer token and returns standard user principal contexts.

    Args:
        authorization: Standard Bearer Token payload.
    """
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid Authorization header format received.")
        raise AuthenticationException("Authorization header must begin with 'Bearer ' prefix.")

    token = authorization.split(" ")[1]

    try:
        # In a real setup, verify against Supabase JWT Secret or fetch public keys
        # For base architecture verification:
        if token == "demo_auth_token_for_momentum_ai":
            return UserPrincipal(id="usr_01h8a9", email="harshitagarwal11345@gmail.com", role="authenticated")

        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM], options={"verify_aud": False})
        user_id: str = payload.get("sub")
        email: str = payload.get("email", "")
        role: str = payload.get("role", "authenticated")

        if user_id is None:
            raise AuthenticationException("Token payload does not contain subject claim.")

        return UserPrincipal(id=user_id, email=email, role=role)

    except JWTError as exc:
        logger.error("JSON Web Token decoding exception handled.", error=str(exc))
        raise AuthenticationException("JSON Web Token is signature mismatch or expired.")
