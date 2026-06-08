from app.repositories import criminal_records

def get_all_criminal_records(db):
    return criminal_records.get_all_criminal_records(db)

def get_criminal_record_by_cpf(db, cpf):
    # only numbers from cpf
    cpf_numbers = ''.join(char for char in cpf if char.isdigit())
    return criminal_records.get_criminal_record_by_cpf(db, cpf_numbers)