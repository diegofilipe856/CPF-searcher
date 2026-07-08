from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from uuid import UUID
from datetime import date
from typing import Optional

from app.shared.helpers.format_cpf import format_cpf
from app.shared.helpers.format_rg import format_rg

class PersonResponse(BaseModel): 
    id: UUID
    name: str
    age: int
    cpf: str
    rg: str
    birth_date: date
    sex: str
    zodiac_sign: Optional[str]
    mother_name: Optional[str]
    father_name: Optional[str]
    email: Optional[str]
    landline: Optional[str]
    mobile_phone: Optional[str]
    height: str
    weight: float
    blood_type: str
    color: Optional[str]

    model_config = ConfigDict(from_attributes=True)
    @model_validator(mode="after")
    def format_documents(self) -> "PersonResponse":
        self.cpf = format_cpf(self.cpf)
        self.rg = format_rg(self.rg)
        return self
class PersonCreate(BaseModel):
    name: str
    age: int
    cpf: str
    rg: str
    birth_date: date
    sex: str
    zodiac_sign: Optional[str] = None
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    email: Optional[str] = None
    landline: Optional[str] = None
    mobile_phone: Optional[str] = None
    height: str
    weight: float
    blood_type: str
    color: Optional[str] = None
    @field_validator("cpf", "rg", mode="before")
    @classmethod
    def clean_document_punctuation(cls, value: str) -> str:
        if isinstance(value, str):
            return ''.join(char for char in value if char.isdigit())
        return value