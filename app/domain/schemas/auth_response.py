from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

class UserLogonInput(BaseModel):
    """Login credentials schema"""
    login: str = Field(
        description='User key (petrobras key)',
        examples=['ABCD'],
    )
    password: str = Field(
        description='User password',
        examples=['1234'],
    )
    metadata: Optional[dict[str, Any]] = Field(
        default=None,
        description='metadata (JSON)',
    )
    model_config = dict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        from_attributes=True,
    )

class LoginResponse(BaseModel):
    token: str

class ErrorResponse(BaseModel):
    detail: str
