from pydantic import BaseModel, Field, field_validator

class LoginRequest(BaseModel):
    key: str = Field(..., description="Chave de acesso de 4 dígitos")
    password: str = Field(..., description="Senha de acesso")

    @field_validator("key")
    @classmethod
    def validate_key(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 4:
            raise ValueError("A chave de acesso deve conter exatamente 4 dígitos numéricos.")
        return v

class LoginResponse(BaseModel):
    token: str

class ErrorResponse(BaseModel):
    detail: str
