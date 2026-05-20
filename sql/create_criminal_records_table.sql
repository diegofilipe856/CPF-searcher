CREATE TABLE IF NOT EXISTS criminal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pessoa_id UUID NOT NULL,
    codigo VARCHAR(30) UNIQUE NOT NULL,

    titulo VARCHAR(100) NOT NULL,
    tipo_crime VARCHAR(50) NOT NULL,
    categoria_crime VARCHAR(50),
    status_crime VARCHAR(30) NOT NULL DEFAULT 'Em apuração',
    gravidade_crime VARCHAR(20),

    data_ocorrencia DATE,
    hora_ocorrencia TIME,

    local_ocorrencia VARCHAR(255),
    cidade_ocorrencia VARCHAR(100),
    estado_ocorrencia VARCHAR(2),

    vitima_nome VARCHAR(255),
    vitima_cpf VARCHAR(14),
    vitima_tipo VARCHAR(50),

    descricao_crime TEXT,
    autoridade_responsavel VARCHAR(255),
    unidade_responsavel VARCHAR(255),
    observacoes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE
);