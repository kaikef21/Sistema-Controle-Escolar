using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class NotaRepository : BaseRepository
{
    public NotaRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Nota nota)
    {
        const string sql = @"
        INSERT INTO aluno_ai.nota
        (
            aluno_id,
            atividade_id,
            valor_nota
        )
        VALUES
        (
            @aluno_id,
            @atividade_id,
            @valor_nota
        )
        RETURNING nota_id;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);

        cmd.Parameters.Add("aluno_id", NpgsqlDbType.Uuid).Value = nota.AlunoId;
        cmd.Parameters.Add("atividade_id", NpgsqlDbType.Uuid).Value = nota.AtividadeId;
        cmd.Parameters.Add("valor_nota", NpgsqlDbType.Numeric).Value = nota.ValorNota;

        var result = await cmd.ExecuteScalarAsync();
        return (Guid)result!;
    }

    public async Task<List<Nota>> Obter()
    {
        var notas = new List<Nota>();
        const string sql = @"
            SELECT
                nota_id,
                aluno_id,
                atividade_id,
                valor_nota
            FROM aluno_ai.nota;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            notas.Add(new Nota
            {
                NotaId = reader.GetGuid("nota_id"),
                AlunoId = reader.GetGuid("aluno_id"),
                AtividadeId = reader.GetGuid("atividade_id"),
                ValorNota = reader.GetDecimal("valor_nota")
            });
        }

        return notas;
    }

    public async Task<Nota?> Obter(Guid notaId)
    {
        const string sql = @"
            SELECT
                nota_id,
                aluno_id,
                atividade_id,
                valor_nota
            FROM aluno_ai.nota
            WHERE nota_id = @nota_id
            LIMIT 1;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        cmd.Parameters.Add("nota_id", NpgsqlDbType.Uuid).Value = notaId;

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return new Nota
        {
            NotaId = reader.GetGuid("nota_id"),
            AlunoId = reader.GetGuid("aluno_id"),
            AtividadeId = reader.GetGuid("atividade_id"),
            ValorNota = reader.GetDecimal("valor_nota")
        };
    }
}