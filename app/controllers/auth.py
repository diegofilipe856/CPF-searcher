from fastapi import APIRouter, HTTPException, status
from app.domain.schemas.auth_response import LoginRequest, LoginResponse, ErrorResponse

router = APIRouter(prefix="/auth", tags=["auth"])

AUTHENTICATION = dict(name="Authentication", description="Authentication related operations")

# Predefined valid key-password combinations for simulation
VALID_USERS = {
    "4820": "senha123",
    "1234": "senha123",
    "0000": "admin",
    "7777": "ssp7777"
}

@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Chave de acesso ou senha incorreta"},
    },
    summary="Login",
    description="Authenticate user using a 4-digit access key and password, returning an access token",
    tags=[AUTHENTICATION["name"]]
)
def login(login_data: LoginRequest):
    # Check if the key exists
    if login_data.key not in VALID_USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chave de acesso não cadastrada."
        )
        
    # Check if password matches
    if login_data.password != VALID_USERS[login_data.key]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta."
        )

    # Return simulated token
    token_value = f"mock-token-for-key-{login_data.key}"
    return LoginResponse(token=token_value)

