from sqlalchemy.orm import Session
from app.domain.criminal_records import CriminalRecords
from app.domain.person import Person

def get_all_criminal_records(db: Session):
    return db.query(CriminalRecords).all()

def get_criminal_record_by_cpf(db: Session, cpf: str):
    suspect_person = db.query(Person).filter(Person.cpf == cpf).first()
    suspect_registries = db.query(CriminalRecords).filter(CriminalRecords.person_id == suspect_person.id).all() if suspect_person else []
    victim_registries = db.query(CriminalRecords).filter(CriminalRecords.victim_cpf == cpf).all()
    return suspect_registries + victim_registries