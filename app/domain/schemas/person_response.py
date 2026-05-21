from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date
from typing import Optional

class PersonResponse(BaseModel): 
    id: UUID
    nome: str
    idade: int
    cpf: str
    rg: str
    data_nasc: date
    sexo: str
    signo: Optional[str]
    mae: Optional[str]
    pai: Optional[str]
    email: Optional[str]
    telefone_fixo: Optional[str]
    celular: Optional[str]
    altura: str
    peso: float
    tipo_sanguineo: str
    cor: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class PersonCreate(BaseModel):
    nome: str
    idade: int
    cpf: str
    rg: str
    data_nasc: date
    sexo: str
    signo: Optional[str] = None
    mae: Optional[str] = None
    pai: Optional[str] = None
    email: Optional[str] = None
    telefone_fixo: Optional[str] = None
    celular: Optional[str] = None
    altura: str
    peso: float
    tipo_sanguineo: str
    cor: Optional[str] = None