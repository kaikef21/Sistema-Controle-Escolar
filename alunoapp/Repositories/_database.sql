CREATE SCHEMA IF NOT EXISTS aluno_ai;

CREATE TABLE IF NOT EXISTS aluno_ai.usuario (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(12) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    perfil VARCHAR(20) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_perfil_usuario CHECK (perfil IS NULL OR perfil IN ('COORDENADOR', 'PROFESSOR', 'ALUNO'))
);

-- 1. Tabela de turma
CREATE TABLE IF NOT EXISTS aluno_ai.turma (
    turma_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL, -- Ex: "1º Ano A - Ensino Médio"
    ano_letivo INT NOT NULL     -- Ex: 2026
);

-- 2. Tabela de aluno (Cadastro de Aluno)
CREATE TABLE IF NOT EXISTS aluno_ai.aluno (
    aluno_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    turma_id UUID REFERENCES aluno_ai.turma(turma_id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de atividade (Cadastro de Atividade)
CREATE TABLE IF NOT EXISTS aluno_ai.atividade (
    atividade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL, -- Ex: "Prova 1 de Matemática"
    tipo VARCHAR(50) CHECK (tipo IN ('Prova', 'Trabalho', 'Atividade Prática')),
    nota_maxima DECIMAL(5,2) DEFAULT 10.0,
    turma_id UUID REFERENCES aluno_ai.turma(turma_id) ON DELETE CASCADE,
    data_realizacao DATE NOT NULL
);

-- 4. Tabela de nota (Lançamento de nota)
CREATE TABLE IF NOT EXISTS aluno_ai.nota (
    nota_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES aluno_ai.aluno(aluno_id) ON DELETE CASCADE,
    atividade_id UUID REFERENCES aluno_ai.atividade(atividade_id) ON DELETE CASCADE,
    valor_nota DECIMAL(5,2) CHECK (valor_nota >= 0),
    UNIQUE(aluno_id, atividade_id) -- Impede duplicidade de nota por atividade
);

-- 5. Tabela de Frequência / Faltas (Lançamento de Faltas)
CREATE TABLE IF NOT EXISTS aluno_ai.frequencia (
    frequencia_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES aluno_ai.aluno(aluno_id) ON DELETE CASCADE,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = Presente, FALSE = Falta
    UNIQUE(aluno_id, data_aula)
);
