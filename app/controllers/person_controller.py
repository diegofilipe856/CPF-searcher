import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services import person_service
from app.domain.schemas.person_response import PersonCreate, PersonResponse

from app.auth import get_api_key

router = APIRouter(prefix="/person", tags=["person"])

@router.get("", response_model=List[PersonResponse])
def list_people(db: Session = Depends(get_db)):
    people = person_service.get_all_people(db)
    return people

@router.get("/{cpf}", response_model=PersonResponse)
def find_person_by_cpf(cpf: str, db: Session = Depends(get_db)):
    person = person_service.get_person_by_cpf(db, cpf)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@router.get("/id/{person_id}", response_model=PersonResponse)
def find_person_by_id(person_id: uuid.UUID, db: Session = Depends(get_db)):
    person = person_service.get_person_by_id(db, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@router.post("", response_model=PersonResponse)
def register_person(person_data: PersonCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    person = person_service.create_person(db, person_data.model_dump())
    return person