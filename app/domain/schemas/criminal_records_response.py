from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, time, datetime
from typing import Optional

class CriminalRecordResponse(BaseModel):
    id: UUID
    pessoa_id: UUID
    codigo: str
    titulo: str
    tipo_crime: str
    categoria_crime: Optional[str] = None
    status_crime: str
    gravidade_crime: Optional[str] = None
    data_ocorrencia: Optional[date] = None
    hora_ocorrencia: Optional[time] = None
    local_ocorrencia: Optional[str] = None
    cidade_ocorrencia: Optional[str] = None
    estado_ocorrencia: Optional[str] = None
    vitima_nome: Optional[str] = None
    vitima_cpf: Optional[str] = None
    vitima_tipo: Optional[str] = None
    descricao_crime: Optional[str] = None
    autoridade_responsavel: Optional[str] = None
    unidade_responsavel: Optional[str] = None
    observacoes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)