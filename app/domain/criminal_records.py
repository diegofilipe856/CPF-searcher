import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text, Time, func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base

class CriminalRecords(Base):
    __tablename__ = "criminal_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    person_id = Column(UUID(as_uuid=True), ForeignKey("people.id"), nullable=False)
    code = Column(String(30), nullable=False, unique=True)
    title = Column(String(100), nullable=False)
    crime_type = Column(String(50), nullable=False)
    crime_category = Column(String(50))
    crime_status = Column(String(30), nullable=False)
    crime_severity = Column(String(20))
    occurrence_date = Column(Date)
    occurrence_time = Column(Time)
    occurrence_location = Column(String(255))
    occurrence_city = Column(String(100))
    occurrence_state = Column(String(2))
    victim_name = Column(String(255))
    victim_cpf = Column(String(14))
    victim_type = Column(String(50))
    crime_description = Column(Text)
    responsible_authority = Column(String(255))
    responsible_unit = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
