ALTER TABLE criminal_records
ADD CONSTRAINT uq_criminal_records_code UNIQUE (code);

ALTER TABLE criminal_records
ADD CONSTRAINT uq_criminal_records_person_crime
UNIQUE (person_id, title, crime_type, crime_category, victim_cpf, occurrence_date);