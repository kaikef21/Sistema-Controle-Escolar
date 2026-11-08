-- docker run --name aluno_ai -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=aluno_ai -p 5432:5432 -d postgres:latest

CREATE SCHEMA IF NOT EXISTS aluno_ai;
CREATE TABLE IF NOT EXISTS aluno_ai.usuario (
   usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(12) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aluno_ai.aluno (
    aluno_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150)NOT NULL,
    data_nascimento VARCHAR(15) NOT NULL,
    cpf VARCHAR(15) NOT NULL,
    nome_responsavel VARCHAR(150)NOT NULL,
    telefone_responsavel VARCHAR(20)NOT NULL,
    email VARCHAR(255) NOT NULL,
criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );

CREATE TABLE aluno_ai.professor(
    professor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20)NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE aluno_ai.turma(
    turma_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serie VARCHAR(30) NOT NULL,
    ano_letivo INTEGER NOT NULL,
    turno VARCHAR(20) NOT NULL,
    sala VARCHAR(20) NOT NULL
);

CREATE TABLE aluno_ai.disciplinas(
    dicsciplina_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(100) NOT null
  );