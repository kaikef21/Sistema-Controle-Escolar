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
            ano_letivo,
            turno,
            sala
        )
        VALUES
        (
            @nome,
            @ano_letivo,
            @turno,
            @sala
        )
        RETURNING turma_id;
        ";
        try
        {
            await EnsureOpenAsync();
            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = turma.Nome;
            cmd.Parameters.Add("ano_letivo", NpgsqlDbType.Integer).Value = turma.AnoLetivo;
            cmd.Parameters.Add("turno", NpgsqlDbType.Varchar).Value = turma.Turno;
            cmd.Parameters.Add("sala", NpgsqlDbType.Varchar).Value = turma.Sala;

            var result = await cmd.ExecuteScalarAsync();

            return (Guid)result!;
        }
        catch
        {
            throw;
        }
    }

    public async Task<List<Turma>> Obter()
    {
        var turmas = new List<Turma>();
        const string sql = @"
        SELECT
            turma_id,
            nome,
            ano_letivo,
            turno,
            sala
        FROM aluno_ai.turma
        WHERE 1 = 1
        ";
        try
        {
            await EnsureOpenAsync();
            await using var cmd = new NpgsqlCommand(sql, Connection);

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var turma = new Turma();
                turma.TurmaId = reader.GetGuid("turma_id");
                turma.Nome = reader.GetString("nome");
                turma.AnoLetivo = reader.GetInt32("ano_letivo");
                turma.Turno = reader.GetString("turno");
                turma.Sala = reader.GetString("sala");
                turmas.Add(turma);
            }
            return turmas;
        }
        catch
        {
            throw;
        }
    }

    public async Task<Turma> Obter(Guid turmaId)
    {
        const string sql = @"
        SELECT
            turma_id,
            nome,
            ano_letivo,
            turno,
            sala
        FROM aluno_ai.turma
        WHERE turma_id = @turma_id
        ";
        try
        {
            await EnsureOpenAsync();
            await using var cmd = new NpgsqlCommand(sql, Connection);
            cmd.Parameters.Add("turma_id", NpgsqlDbType.Uuid).Value = turmaId;
            await using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync()) return null;
            var turma = new Turma();
            turma.TurmaId = reader.GetGuid("turma_id");
            turma.Nome = reader.GetString("nome");
            turma.AnoLetivo = reader.GetInt32("ano_letivo");
            turma.Turno = reader.GetString("turno");
            turma.Sala = reader.GetString("sala");
            return turma;
        }
        catch
        {
            throw;
        }
    }
}