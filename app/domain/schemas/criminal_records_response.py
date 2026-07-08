from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from uuid import UUID
from datetime import date, time, datetime
from typing import Optional
from app.shared.helpers.format_cpf import format_cpf

class CriminalRecordResponse(BaseModel):
    id: UUID
    person_id: UUID
    code: str
    title: str
    crime_type: str
    crime_category: Optional[str] = None
    crime_status: str
    crime_severity: Optional[str] = None
    occurrence_date: Optional[date] = None
    occurrence_time: Optional[time] = None
    occurrence_location: Optional[str] = None
    occurrence_city: Optional[str] = None
    occurrence_state: Optional[str] = None
    victim_name: Optional[str] = None
    victim_cpf: Optional[str] = None
    victim_type: Optional[str] = None
    crime_description: Optional[str] = None
    responsible_authority: Optional[str] = None
    responsible_unit: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def format_docs(self) -> "CriminalRecordResponse":
        if self.victim_cpf:
            self.victim_cpf = format_cpf(self.victim_cpf)
        return self

class CriminalRecordUpdate(BaseModel):
    title: Optional[str] = None
    crime_type: Optional[str] = None
    crime_category: Optional[str] = None
    crime_status: Optional[str] = None
    crime_severity: Optional[str] = None
    occurrence_date: Optional[date] = None
    occurrence_time: Optional[time] = None
    occurrence_location: Optional[str] = None
    occurrence_city: Optional[str] = None
    occurrence_state: Optional[str] = None
    victim_name: Optional[str] = None
    victim_cpf: Optional[str] = None
    victim_type: Optional[str] = None
    crime_description: Optional[str] = None
    responsible_authority: Optional[str] = None
    responsible_unit: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("victim_cpf", mode="before")
    @classmethod
    def clean_victim_cpf(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return "".join(char for char in v if char.isdigit())
        return v

class CriminalRecordCreate(BaseModel):
    person_id: UUID
    title: str
    crime_type: str
    crime_category: Optional[str] = None
    crime_status: str
    crime_severity: Optional[str] = None
    occurrence_date: Optional[date] = None
    occurrence_time: Optional[time] = None
    occurrence_location: Optional[str] = None
    occurrence_city: Optional[str] = None
    occurrence_state: Optional[str] = None
    victim_name: Optional[str] = None
    victim_cpf: Optional[str] = None
    victim_type: Optional[str] = None
    crime_description: Optional[str] = None
    responsible_authority: Optional[str] = None
    responsible_unit: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("victim_cpf", mode="before")
    @classmethod
    def clean_victim_cpf(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return "".join(char for char in v if char.isdigit())
        return v