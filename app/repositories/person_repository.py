from sqlalchemy.orm import Session
from sqlalchemy import func
from app.domain.person import Person


def get_all_people(db: Session):
    return db.query(Person).all()

def get_person_by_cpf(db: Session, cpf: str):
    cpf_digits = ''.join(char for char in cpf if char.isdigit())
    return (
        db.query(Person)
        .filter(func.regexp_replace(Person.cpf, r'\D', '', 'g') == cpf_digits)
        .first()
    )

def create_person(db: Session, person: Person):
    db.add(person)
    db.commit()
    db.refresh(person)
    return person
