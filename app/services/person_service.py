from app.repositories import person_repository
from app.domain.person import Person


def get_all_people(db):
    return person_repository.get_all_people(db)

def get_person_by_cpf(db, cpf: str):
    return person_repository.get_person_by_cpf(db, cpf)

def create_person(db, person_data: dict):
    person = Person(**person_data)
    return person_repository.create_person(db, person)
