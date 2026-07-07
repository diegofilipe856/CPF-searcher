from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from fastapi import HTTPException, status
from app.domain.criminal_records import CriminalRecords
from app.domain.person import Person
import uuid

def get_all_criminal_records(db: Session):
    return db.query(CriminalRecords).all()

def get_criminal_record_by_cpf(db: Session, cpf: str):
    cpf_digits = ''.join(char for char in cpf if char.isdigit())

    suspect_person = (
        db.query(Person)
        .filter(func.regexp_replace(Person.cpf, r'\D', '', 'g') == cpf_digits)
        .first()
    )
    suspect_registries = db.query(CriminalRecords).filter(CriminalRecords.person_id == suspect_person.id).all() if suspect_person else []
    victim_registries = (
        db.query(CriminalRecords)
        .filter(func.regexp_replace(CriminalRecords.victim_cpf, r'\D', '', 'g') == cpf_digits)
        .all()
    )
    return suspect_registries + victim_registries

def update_criminal_record(db: Session, record_id: uuid.UUID, updated_record: CriminalRecords):
    record = db.query(CriminalRecords).filter(CriminalRecords.id == record_id).first()
    if record:
        update_data = updated_record.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(record, field, value)
        try:
            db.commit()
            db.refresh(record)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Update would create a duplicate criminal record",
            )
    return record

def add_criminal_record(db: Session, record: CriminalRecords):
    db.add(record)
    try:
        db.commit()
        db.refresh(record)
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig) if e.orig else str(e)
        if "uq_criminal_records_code" in error_msg or "uq_criminal_records_person_crime" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This criminal record already exists in the database.",
            )
    return record
