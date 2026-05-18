from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.repositories.person_repository import PersonRepository
from app.services.personService import PersonService
from app.domain.schemas.personResponse import PersonResponse

router = APIRouter(prefix="/person", tags=["person"])

@router.get("/", response_model=List[PersonResponse])
def get_all_people(db: Session = Depends(get_db)):
    repo = PersonRepository(db)
    service = PersonService(repo)
    criminals = service.get_all_people()
    return criminals

@router.get("/{cpf}", response_model=PersonResponse)
def get_person_by_cpf(cpf: str, db: Session = Depends(get_db)):
    repo = PersonRepository(db)
    service = PersonService(repo)
    person = service.get_person_by_cpf(cpf)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person