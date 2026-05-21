from sqlalchemy.orm import Session
from app.domain.person import Person


def get_all_people(db: Session):
    return db.query(Person).all()

def get_person_by_cpf(db: Session, cpf: str):
    return db.query(Person).filter(Person.cpf == cpf).first()

def create_person(db: Session, person: Person):
    db.add(person)
    db.commit()
    db.refresh(person)
    return person

