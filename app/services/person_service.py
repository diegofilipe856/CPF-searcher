from app.repositories import person_repository
from app.domain.person import Person


def formatar_cpf(cpf: str) -> str:
    numeros = ''.join(char for char in cpf if char.isdigit())
    if len(numeros) != 11:
        raise ValueError("CPF deve conter 11 dígitos.")
    return f"{numeros[:3]}.{numeros[3:6]}.{numeros[6:9]}-{numeros[9:]}"

def formatar_rg(rg: str) -> str:
    numeros = ''.join(char for char in rg if char.isdigit())
    if len(numeros) != 9:
        if len(numeros) == 8:
                return f"{numeros[:2]}.{numeros[2:5]}.{numeros[5:8]}-0"
        raise ValueError("RG deve conter 9 dígitos.")
    return f"{numeros[:2]}.{numeros[2:5]}.{numeros[5:8]}-{numeros[8:]}"

def get_all_people(db):
    people = person_repository.get_all_people(db)
    for person in people:
        person.cpf = formatar_cpf(person.cpf)
        person.rg = formatar_rg(person.rg)
    return people

def get_person_by_cpf(db, cpf: str):
    person = person_repository.get_person_by_cpf(db, cpf)
    if person:
        person.cpf = formatar_cpf(person.cpf)
        person.rg = formatar_rg(person.rg)
    return person

def create_person(db, person_data: dict):
    person = Person(**person_data)
    return person_repository.create_person(db, person)
