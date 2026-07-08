from app.repositories import criminal_records
from app.domain.criminal_records import CriminalRecords

def get_all_criminal_records(db):
    return criminal_records.get_all_criminal_records(db)

def get_criminal_record_by_cpf(db, cpf):
    cpf_numbers = ''.join(char for char in cpf if char.isdigit())
    return criminal_records.get_criminal_record_by_cpf(db, cpf_numbers)

def update_criminal_record(db, record_id, updated_record):
    return criminal_records.update_criminal_record(db, record_id, updated_record)

def create_criminal_record(db, record_data):
    record_dict = record_data.model_dump()
    record = CriminalRecords(**record_dict)
    return criminal_records.add_criminal_record(db, record)
