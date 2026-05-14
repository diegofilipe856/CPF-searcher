CREATE TABLE IF NOT EXISTS pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    idade INT,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    data_nasc DATE,
    sexo VARCHAR(20),
    signo VARCHAR(20),
    mae VARCHAR(255),
    pai VARCHAR(255),
    email VARCHAR(255),
    senha VARCHAR(255),
    cep VARCHAR(10),
    endereco TEXT,
    numero INT,
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    telefone_fixo VARCHAR(20),
    celular VARCHAR(20),
    altura VARCHAR(10),
    peso FLOAT,
    tipo_sanguineo VARCHAR(5),
    cor VARCHAR(20)
);

   -- Índice para busca rápida por CPF
   CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON pessoas(cpf);