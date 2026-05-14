import uuid

from sqlalchemy import Column, Integer, String, Date, Float
from app.database import Base
from sqlalchemy.dialects.postgresql import UUID

class Person(Base):
    __tablename__ = "pessoas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(255), nullable=False),
    idade = Column(Integer, nullable=False),
    cpf = Column(String(14), nullable=False, unique=True),
    rg = Column(String(20), nullable=False, unique=True, index=True),
    data_nasc = Column(Date, nullable=False),
    sexo = Column(String(10), nullable=False),
    signo = Column(String(20)),
    mae = Column(String(255)),
    pai = Column(String(255)),
    email = Column(String(255)),
    telefone_fixo = Column(String(20)),
    celular = Column(String(20)),
    altura = Column(Float, nullable=False),
    peso = Column(Float, nullable=False),
    tipo_sanguineo = Column(String(3), nullable=False),
    cor = Column(String(20)),