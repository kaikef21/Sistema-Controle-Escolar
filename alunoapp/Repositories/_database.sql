CREATE SCHEMA IF NOT EXISTS aluno_ai;

CREATE TABLE IF NOT EXISTS aluno_ai.usuario (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    confirmar_senha VARCHAR(20) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE aluno_ai.usuario
ALTER COLUMN username TYPE VARCHAR(50);


CREATE TABLE IF NOT EXISTS aluno_ai.turma (
    turma_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    ano_letivo INT NOT NULL
);

CREATE TABLE IF NOT EXISTS aluno_ai.aluno (
    aluno_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    turma_id UUID NOT NULL REFERENCES aluno_ai.turma(turma_id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aluno_ai.atividade (
    atividade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('Prova', 'Trabalho', 'Atividade Prática')),
    nota_maxima DECIMAL(5,2) DEFAULT 10.0 CHECK (nota_maxima > 0),
    turma_id UUID NOT NULL REFERENCES aluno_ai.turma(turma_id) ON DELETE CASCADE,
    data_realizacao DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS aluno_ai.nota (
    nota_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES aluno_ai.aluno(aluno_id) ON DELETE CASCADE,
    atividade_id UUID NOT NULL REFERENCES aluno_ai.atividade(atividade_id) ON DELETE CASCADE,
    valor_nota DECIMAL(5,2) NOT NULL CHECK (valor_nota >= 0),
    UNIQUE(aluno_id, atividade_id)
);

CREATE TABLE IF NOT EXISTS aluno_ai.frequencia (
    frequencia_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES aluno_ai.aluno(aluno_id) ON DELETE CASCADE,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(aluno_id, data_aula)
);