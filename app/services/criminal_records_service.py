from app.repositories import criminal_records
from ..shared.helpers.format_cpf import format_cpf

def get_all_criminal_records(db):
    return criminal_records.get_all_criminal_records(db)

def get_criminal_record_by_cpf(db, cpf):
    # only numbers from cpf
    cpf_numbers = ''.join(char for char in cpf if char.isdigit())
    return criminal_records.get_criminal_record_by_cpf(db, cpf_numbers)

def update_criminal_record(db, record_id, updated_record):
    if updated_record.victim_cpf:
        updated_record.victim_cpf = format_cpf(updated_record.victim_cpf)
    return criminal_records.update_criminal_record(db, record_id, updated_record)