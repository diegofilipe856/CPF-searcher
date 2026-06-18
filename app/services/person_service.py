from app.repositories import person_repository
from app.domain.person import Person


from ..shared.helpers.format_cpf import format_cpf
from ..shared.helpers.format_rg import format_rg

def get_all_people(db):
    people = person_repository.get_all_people(db)
    for person in people:
        person.cpf = format_cpf(person.cpf)
        person.rg = format_rg(person.rg)
    return people

def get_person_by_cpf(db, cpf: str):
    person = person_repository.get_person_by_cpf(db, cpf)
    if person:
        person.cpf = format_cpf(person.cpf)
        person.rg = format_rg(person.rg)
    return person

def get_person_by_id(db, person_id: int):
    person = person_repository.get_person_by_id(db, person_id)
    if person:
        person.cpf = format_cpf(person.cpf)
        person.rg = format_rg(person.rg)
    return person
def create_person(db, person_data: dict):
    person_data["cpf"] = format_cpf(person_data["cpf"])
    person_data["rg"] = format_rg(person_data["rg"])
    person = Person(**person_data)
    return person_repository.create_person(db, person)
