from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, time, datetime
from typing import Optional

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
