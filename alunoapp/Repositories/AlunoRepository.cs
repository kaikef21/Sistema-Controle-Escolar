using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class AlunoRepository : BaseRepository
{
    public AlunoRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Aluno aluno)
    {
        const string sql = @"
        INSERT INTO aluno_ai.aluno
        (
            nome,
            matricula,
            status,
            turma
        )
        VALUES
        (
            @nome,
            @matricula,
            @status,
            @turma
        )
        RETURNING aluno_id
        ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = aluno.Nome;
            cmd.Parameters.Add("matricula", NpgsqlDbType.Varchar).Value = aluno.Matricula;
            cmd.Parameters.Add("status", NpgsqlDbType.Varchar).Value = aluno.Status;
            cmd.Parameters.Add("turma", NpgsqlDbType.Varchar).Value = aluno.Turma;
            
            var result = await cmd.ExecuteScalarAsync();
            return (Guid)result!;
        }
        catch
        {
            throw;
        }
    }

    public async Task<List<Aluno>> Obter()
    {
        var alunos = new List<Aluno>();

        string sql = @"
            SELECT 
                aluno_id,
                nome,
                matricula,
                status,
                turma_id

            FROM aluno_ai.aluno

            WHERE 1 = 1
        ";

        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var Aluno = new Aluno();
                Aluno.AlunoId = reader.GetGuid("aluno_id");
                Aluno.Nome = reader.GetString("nome");
                Aluno.Matricula = reader.GetString("matricula");
                Aluno.Status = reader.GetString("status");
                Aluno.Turma = reader.GetString("turma");

                alunos.Add(Aluno);
            }
            return alunos;

        }
        catch
        {
            throw;
        }
    }

    public async Task<Aluno?> Obter(Guid alunoId)
    {
        const string sql = @"
    
            SELECT
                aluno_id,
                nome,
                matricula,
                status,
                turma
        
            FROM 
                aluno_ai.aluno
            WHERE 
                aluno_id = @aluno_id 
            LIMIT 1;
            ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("aluno_id", NpgsqlDbType.Uuid).Value = alunoId;

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync()) return null;

            var Aluno = new Aluno();

            Aluno.AlunoId = reader.GetGuid("aluno_id");
            Aluno.Nome = reader.GetString("nome");
            Aluno.Matricula = reader.GetString("matricula");
            Aluno.Status = reader.GetString("status");
            Aluno.Turma = reader.GetString("turma");

            return Aluno;
        }
        catch
        {
            throw;
        }
    }
}