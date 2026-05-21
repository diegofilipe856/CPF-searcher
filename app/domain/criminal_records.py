import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text, Time
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base

class CriminalRecords(Base):
    __tablename__ = "criminal_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pessoa_id = Column(UUID(as_uuid=True), ForeignKey("pessoas.id"), nullable=False)
    codigo = Column(String(30), nullable=False, unique=True)
    titulo = Column(String(100), nullable=False)
    tipo_crime = Column(String(50), nullable=False)
    categoria_crime = Column(String(50))
    status_crime = Column(String(30), nullable=False)
    gravidade_crime = Column(String(20))
    data_ocorrencia = Column(Date)
    hora_ocorrencia = Column(Time)
    local_ocorrencia = Column(String(255))
    cidade_ocorrencia = Column(String(100))
    estado_ocorrencia = Column(String(2))
    vitima_nome = Column(String(255))
    vitima_cpf = Column(String(14))
    vitima_tipo = Column(String(50))
    descricao_crime = Column(Text)
    autoridade_responsavel = Column(String(255))
    unidade_responsavel = Column(String(255))
    observacoes = Column(Text)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)