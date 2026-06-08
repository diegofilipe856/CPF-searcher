from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import criminal_records_service
from app.domain.schemas.criminal_records_response import CriminalRecordResponse


router = APIRouter(prefix="/criminal-records", tags=["criminal-records"])

@router.get("", response_model=list[CriminalRecordResponse])
def list_criminal_records(db: Session = Depends(get_db)):
    records = criminal_records_service.get_all_criminal_records(db)
    return records

@router.get("/{cpf}", response_model=list[CriminalRecordResponse])
def get_criminal_record(cpf: str, db: Session = Depends(get_db)):
    records = criminal_records_service.get_criminal_record_by_cpf(db, cpf)
    return records