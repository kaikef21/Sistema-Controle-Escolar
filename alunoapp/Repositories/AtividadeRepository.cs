using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class AtividadeRepository : BaseRepository
{
    public AtividadeRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Atividade atividade)
    {
        const string sql = @"
        INSERT INTO aluno_ai.atividade
        (
            titulo,
            tipo,
            nota_maxima,
            turma_id,
            data_realizacao
        )
        VALUES
        (
            @titulo,
            @tipo,
            @nota_maxima,
            @turma_id,
            @data_realizacao
        )
        RETURNING atividade_id;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);

        cmd.Parameters.Add("titulo", NpgsqlDbType.Varchar).Value = atividade.Titulo;
        cmd.Parameters.Add("tipo", NpgsqlDbType.Varchar).Value = atividade.Tipo.ToDbValue();
        cmd.Parameters.Add("nota_maxima", NpgsqlDbType.Numeric).Value = (atividade.NotaMaxima ?? 10m).ToDbValue();
        cmd.Parameters.Add("turma_id", NpgsqlDbType.Uuid).Value = atividade.TurmaId;
        cmd.Parameters.Add("data_realizacao", NpgsqlDbType.Date).Value = atividade.DataRealizacao.Date;

        var result = await cmd.ExecuteScalarAsync();
        return (Guid)result!;
    }

    public async Task<List<Atividade>> Obter()
    {
        var atividades = new List<Atividade>();
        const string sql = @"
            SELECT
                atividade_id,
                titulo,
                tipo,
                nota_maxima,
                turma_id,
                data_realizacao
            FROM aluno_ai.atividade;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            atividades.Add(new Atividade
            {
                AtividadeId = reader.GetGuid("atividade_id"),
                Titulo = reader.GetString("titulo"),
                Tipo = reader.GetStringNullable("tipo"),
                NotaMaxima = reader.GetDecimal("nota_maxima"),
                TurmaId = reader.GetGuid("turma_id"),
                DataRealizacao = reader.GetDateTime("data_realizacao")
            });
        }

        return atividades;
    }

    public async Task<Atividade?> Obter(Guid atividadeId)
    {
        const string sql = @"
            SELECT
                atividade_id,
                titulo,
                tipo,
                nota_maxima,
                turma_id,
                data_realizacao
            FROM aluno_ai.atividade
            WHERE atividade_id = @atividade_id
            LIMIT 1;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        cmd.Parameters.Add("atividade_id", NpgsqlDbType.Uuid).Value = atividadeId;

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return new Atividade
        {
            AtividadeId = reader.GetGuid("atividade_id"),
            Titulo = reader.GetString("titulo"),
            Tipo = reader.GetStringNullable("tipo"),
            NotaMaxima = reader.GetDecimal("nota_maxima"),
            TurmaId = reader.GetGuid("turma_id"),
            DataRealizacao = reader.GetDateTime("data_realizacao")
        };
    }
}