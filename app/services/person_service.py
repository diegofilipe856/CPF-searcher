from app.repositories import person_repository
from app.domain.person import Person


def format_cpf(cpf: str) -> str:
    digits = ''.join(char for char in cpf if char.isdigit())
    if len(digits) != 11:
        raise ValueError("CPF must contain 11 digits.")
    return f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}"

def format_rg(rg: str) -> str:
    digits = ''.join(char for char in rg if char.isdigit())
    if len(digits) != 9:
        if len(digits) == 8:
            return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}-0"
        raise ValueError("RG must contain 9 digits.")
    return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}-{digits[8:]}"

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

def create_person(db, person_data: dict):
    person_data["cpf"] = format_cpf(person_data["cpf"])
    person_data["rg"] = format_rg(person_data["rg"])
    person = Person(**person_data)
    return person_repository.create_person(db, person)
