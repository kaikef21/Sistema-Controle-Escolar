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
            turma_id
        )
        VALUES
        (
            @nome,
            @matricula,
            @turma_id
        )
        RETURNING aluno_id;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);

        cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = aluno.Nome;
        cmd.Parameters.Add("matricula", NpgsqlDbType.Varchar).Value = aluno.Matricula.ToDbValue();
        cmd.Parameters.Add("turma_id", NpgsqlDbType.Uuid).Value = aluno.TurmaId;

        var result = await cmd.ExecuteScalarAsync();
        return (Guid)result!;
    }

    public async Task<List<Aluno>> Obter()
    {
        var alunos = new List<Aluno>();
        const string sql = @"
            SELECT
                aluno_id,
                nome,
                matricula,
                turma_id
            FROM aluno_ai.aluno;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            alunos.Add(new Aluno
            {
                AlunoId = reader.GetGuid("aluno_id"),
                Nome = reader.GetString("nome"),
                Matricula = reader.GetStringNullable("matricula"),
                TurmaId = reader.GetGuid("turma_id")
            });
        }

        return alunos;
    }

    public async Task<Aluno?> Obter(Guid alunoId)
    {
        const string sql = @"
            SELECT
                aluno_id,
                nome,
                matricula,
                turma_id
            FROM aluno_ai.aluno
            WHERE aluno_id = @aluno_id
            LIMIT 1;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        cmd.Parameters.Add("aluno_id", NpgsqlDbType.Uuid).Value = alunoId;

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return new Aluno
        {
            AlunoId = reader.GetGuid("aluno_id"),
            Nome = reader.GetString("nome"),
            Matricula = reader.GetStringNullable("matricula"),
            TurmaId = reader.GetGuid("turma_id")
        };
    }
}