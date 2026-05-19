from app.domain.person import Person
from app.repositories.person_repository import PersonRepository

class PersonService:
    def __init__(self, person_repository: PersonRepository):
        self.person_repository = person_repository

    def get_all_people(self):
        return self.person_repository.get_all()

    def get_person_by_cpf(self, cpf: str):
        return self.person_repository.get_by_cpf(cpf)
    
    def create_person(self, person_data):
        person = Person(**person_data)
        return self.person_repository.create(person)