from fastapi import APIRouter, HTTPException, status
from app.domain.schemas.auth_response import UserLogonInput, LoginResponse, ErrorResponse

router = APIRouter(prefix="/auth", tags=["auth"])

AUTHENTICATION = dict(name="Authentication", description="Authentication related operations")


@router.post(
    path="/login",
    response_model=LoginResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Chave de acesso ou senha incorreta"},
    },
    summary="Login",
    description="Authenticate user using a 4-digit access key and password, returning an access token",
    tags=[AUTHENTICATION["name"]]
)
def login(credentials: UserLogonInput):
    print(f"Received login request for user: {credentials.login}")
    return {"token": "Hello world"}


