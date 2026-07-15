from fastapi import APIRouter, HTTPException, status
from app.domain.schemas.auth_response import UserLogonInput, LoginResponse, ErrorResponse
import app.services.auth as auth_service

AUTHENTICATION = dict(name="Authentication", description="Authentication related operations")

router = APIRouter(prefix="/auth", tags=[AUTHENTICATION["name"]])


@router.post(
    path="/login",
    response_model=LoginResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Chave de acesso ou senha incorreta"},
    },
    summary="Login",
    description="Authenticate user using a 4-digit access key and password, returning an access token",
)
async def login(credentials: UserLogonInput):
    logon = await auth_service.user_logon(username=credentials.login, password=credentials.password)
    return logon


