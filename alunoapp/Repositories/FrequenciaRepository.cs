using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class FrequenciaRepository : BaseRepository
{
    public FrequenciaRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Frequencia frequencia)
    {
        const string sql = @"
        INSERT INTO aluno_ai.frequencia
        (
            aluno_id,
            data_aula,
            presente
        )
        VALUES
        (
            @aluno_id,
            @data_aula,
            @presente
        )
        RETURNING frequencia_id;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);

        cmd.Parameters.Add("aluno_id", NpgsqlDbType.Uuid).Value = frequencia.AlunoId;
        cmd.Parameters.Add("data_aula", NpgsqlDbType.Date).Value = frequencia.DataAula.Date;
        cmd.Parameters.Add("presente", NpgsqlDbType.Boolean).Value = frequencia.Presente;

        var result = await cmd.ExecuteScalarAsync();
        return (Guid)result!;
    }

    public async Task<List<Frequencia>> Obter()
    {
        var frequencias = new List<Frequencia>();
        const string sql = @"
            SELECT
                frequencia_id,
                aluno_id,
                data_aula,
                presente
            FROM aluno_ai.frequencia;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            frequencias.Add(new Frequencia
            {
                FrequenciaId = reader.GetGuid("frequencia_id"),
                AlunoId = reader.GetGuid("aluno_id"),
                DataAula = reader.GetDateTime("data_aula"),
                Presente = reader.GetBoolean("presente")
            });
        }

        return frequencias;
    }

    public async Task<Frequencia?> Obter(Guid frequenciaId)
    {
        const string sql = @"
            SELECT
                frequencia_id,
                aluno_id,
                data_aula,
                presente
            FROM aluno_ai.frequencia
            WHERE frequencia_id = @frequencia_id
            LIMIT 1;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        cmd.Parameters.Add("frequencia_id", NpgsqlDbType.Uuid).Value = frequenciaId;

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return new Frequencia
        {
            FrequenciaId = reader.GetGuid("frequencia_id"),
            AlunoId = reader.GetGuid("aluno_id"),
            DataAula = reader.GetDateTime("data_aula"),
            Presente = reader.GetBoolean("presente")
        };
    }
}