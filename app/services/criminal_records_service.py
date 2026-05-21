from app.repositories import criminal_records

def get_all_criminal_records(db):
    return criminal_records.get_all_criminal_records(db)