from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date
from typing import Optional

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
