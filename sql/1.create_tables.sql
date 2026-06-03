CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INT,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20) UNIQUE,
    birth_date DATE,
    sex VARCHAR(20),
    zodiac_sign VARCHAR(20),
    mother_name VARCHAR(255),
    father_name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    zip_code VARCHAR(10),
    address TEXT,
    address_number INT,
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    landline VARCHAR(20),
    mobile_phone VARCHAR(20),
    height VARCHAR(10),
    weight FLOAT,
    blood_type VARCHAR(5),
    color VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_people_cpf ON people(cpf);
