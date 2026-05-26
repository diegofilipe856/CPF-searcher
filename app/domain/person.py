import uuid

from sqlalchemy import Column, Integer, String, Date, Float
from app.database import Base
from sqlalchemy.dialects.postgresql import UUID

class Person(Base):
    __tablename__ = "people"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    cpf = Column(String(14), nullable=False, unique=True)
    rg = Column(String(20), nullable=False, unique=True, index=True)
    birth_date = Column(Date, nullable=False)
    sex = Column(String(20), nullable=False)
    zodiac_sign = Column(String(20))
    mother_name = Column(String(255))
    father_name = Column(String(255))
    email = Column(String(255))
    landline = Column(String(20))
    mobile_phone = Column(String(20))
    height = Column(String(10), nullable=False)
    weight = Column(Float, nullable=False)
    blood_type = Column(String(5), nullable=False)
    color = Column(String(20))
