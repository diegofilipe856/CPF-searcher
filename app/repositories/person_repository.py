from sqlalchemy.orm import Session
from app.domain.person import Person

class PersonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Person).all()
    def get_by_cpf(self, cpf: str):
        return self.db.query(Person).filter(Person.cpf == cpf).first()