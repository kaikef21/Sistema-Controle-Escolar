using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class TurmaRepository : BaseRepository
{
    public TurmaRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Turma turma)
    {
        const string sql = @"
        INSERT INTO aluno_ai.turma
        (
            nome,
            ano_letivo
        )
        VALUES
        (
            @nome,
            @ano_letivo
        )
        RETURNING turma_id;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);

        cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = turma.Nome;
        cmd.Parameters.Add("ano_letivo", NpgsqlDbType.Integer).Value = turma.AnoLetivo;

        var result = await cmd.ExecuteScalarAsync();
        return (Guid)result!;
    }

    public async Task<List<Turma>> Obter()
    {
        var turmas = new List<Turma>();
        const string sql = @"
        SELECT
            turma_id,
            nome,
            ano_letivo
        FROM aluno_ai.turma;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            turmas.Add(new Turma
            {
                TurmaId = reader.GetGuid("turma_id"),
                Nome = reader.GetString("nome"),
                AnoLetivo = reader.GetInt32("ano_letivo")
            });
        }

        return turmas;
    }

    public async Task<Turma?> Obter(Guid turmaId)
    {
        const string sql = @"
        SELECT
            turma_id,
            nome,
            ano_letivo
        FROM aluno_ai.turma
        WHERE turma_id = @turma_id
        LIMIT 1;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        cmd.Parameters.Add("turma_id", NpgsqlDbType.Uuid).Value = turmaId;

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return new Turma
        {
            TurmaId = reader.GetGuid("turma_id"),
            Nome = reader.GetString("nome"),
            AnoLetivo = reader.GetInt32("ano_letivo")
        };
    }
}