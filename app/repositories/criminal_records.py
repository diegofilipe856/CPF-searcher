from sqlalchemy.orm import Session
from app.domain.criminal_records import CriminalRecords
from app.domain.person import Person
from app.shared.helpers.format_cpf import format_cpf
import uuid

def get_all_criminal_records(db: Session):
    return db.query(CriminalRecords).all()

def get_criminal_record_by_cpf(db: Session, cpf: str):
    formatted_cpf = format_cpf(cpf)

    suspect_person = (
        db.query(Person)
        .filter(Person.cpf == formatted_cpf)
        .first()
    )
    suspect_registries = db.query(CriminalRecords).filter(CriminalRecords.person_id == suspect_person.id).all() if suspect_person else []
    victim_registries = (
        db.query(CriminalRecords)
        .filter(CriminalRecords.victim_cpf == formatted_cpf)
        .all()
    )
    return suspect_registries + victim_registries

def update_criminal_record(db: Session, record_id: uuid.UUID, updated_record: CriminalRecords):
    record = db.query(CriminalRecords).filter(CriminalRecords.id == record_id).first()
    if record:
        update_data = updated_record.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(record, field, value)
        db.commit()
        db.refresh(record)
    return record

def find_duplicate_criminal_record(db: Session, record_data: dict):
    return db.query(CriminalRecords).filter_by(**record_data).first()

def add_criminal_record(db: Session, record: CriminalRecords):
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
