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


CREATE TABLE IF NOT EXISTS aluno_ai.turma (
    turma_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT null UNIQUE,
    ano_letivo INT NOT NULL,
    turno VARCHAR(10) NOT NULL,
    sala VARCHAR(20) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);


CREATE TABLE IF NOT EXISTS aluno_ai.disciplina (
    disciplina_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    carga_horaria INT NOT NULL
);

CREATE TABLE IF NOT EXISTS aluno_ai.aluno (
    aluno_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    turma VARCHAR(50) REFERENCES aluno_ai.turma(nome) ON DELETE SET NULL,
    
    status VARCHAR(20) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'TRANCADO', 'DESISTENTE'))
);

-- 5. TURMA_DISCIPLINA_PROFESSOR
CREATE TABLE IF NOT EXISTS aluno_ai.turma_disciplina_professor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID NOT NULL REFERENCES aluno_ai.turma(turma_id) ON DELETE CASCADE, 
    disciplina_id UUID NOT NULL REFERENCES aluno_ai.disciplina(disciplina_id) ON DELETE CASCADE, 
    professor_id UUID NOT NULL REFERENCES aluno_ai.usuario(usuario_id) ON DELETE RESTRICT, 
    CONSTRAINT uc_turma_disciplina UNIQUE (turma_id, disciplina_id)
);

-- 6. ATIVIDADE
CREATE TABLE IF NOT EXISTS aluno_ai.atividade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_disciplina_id UUID NOT NULL REFERENCES aluno_ai.turma_disciplina_professor(id) ON DELETE CASCADE, 
    nome VARCHAR(100) NOT NULL,
    nota_maxima DECIMAL(5,2) NOT NULL,
    data_entrega DATE
);
-- 7. TABELA LANCAMENTO_NOTA
CREATE TABLE IF NOT EXISTS aluno_ai.lancamento_nota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES aluno_ai.aluno(aluno_id) ON DELETE CASCADE, 
    atividade_id UUID NOT NULL REFERENCES aluno_ai.atividade(id) ON DELETE CASCADE, 
    nota_obtida DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'PENDENTE', 'APROVADO', 'REJEITADO')),
    professor_id UUID NOT NULL REFERENCES aluno_ai.usuario(usuario_id), 
    coordenador_id UUID REFERENCES aluno_ai.usuario(usuario_id), 
    observacao_coordenador TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uc_aluno_atividade UNIQUE (aluno_id, atividade_id)
);

-- 8. TABELA LANCAMENTO_FALTA
CREATE TABLE IF NOT EXISTS aluno_ai.lancamento_falta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES aluno_ai.aluno(aluno_id) ON DELETE CASCADE, 
    turma_disciplina_id UUID NOT NULL REFERENCES aluno_ai.turma_disciplina_professor(id) ON DELETE CASCADE, 
    data_falta DATE NOT NULL,
    quantidade_faltas INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'PENDENTE', 'APROVADO', 'REJEITADO')),
    professor_id UUID NOT NULL REFERENCES aluno_ai.usuario(usuario_id), 
    coordenador_id UUID REFERENCES aluno_ai.usuario(usuario_id), 
    observacao_coordenador TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uc_aluno_disciplina_data UNIQUE (aluno_id, turma_disciplina_id, data_falta)
);