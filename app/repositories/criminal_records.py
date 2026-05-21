from sqlalchemy.orm import Session
from app.domain.criminal_records import CriminalRecords

def get_all_criminal_records(db: Session):
    return db.query(CriminalRecords).all()