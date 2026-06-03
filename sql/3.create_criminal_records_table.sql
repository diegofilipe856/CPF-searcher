CREATE TABLE IF NOT EXISTS criminal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    person_id UUID NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,

    title VARCHAR(100) NOT NULL,
    crime_type VARCHAR(50) NOT NULL,
    crime_category VARCHAR(50),
    crime_status VARCHAR(30) NOT NULL DEFAULT 'Under investigation',
    crime_severity VARCHAR(20),

    occurrence_date DATE,
    occurrence_time TIME,

    occurrence_location VARCHAR(255),
    occurrence_city VARCHAR(100),
    occurrence_state VARCHAR(2),

    victim_name VARCHAR(255),
    victim_cpf VARCHAR(14),
    victim_type VARCHAR(50),

    crime_description TEXT,
    responsible_authority VARCHAR(255),
    responsible_unit VARCHAR(255),
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);
