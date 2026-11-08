using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class DisciplinaRepository : BaseRepository
{
    public DisciplinaRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Disciplina disciplina)
    {
        const string sql = @"
        INSERT INTO aluno_ai.disciplina
        (
            nome,
            carga_horaria
        )
        VALUES
        (
            @nome,
            @carga_horaria
        )
        RETURNING disciplina_id
        ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = disciplina.Nome;
            cmd.Parameters.Add("carga_horaria", NpgsqlDbType.Integer).Value = disciplina.CargaHoraria;

            var result = await cmd.ExecuteScalarAsync();
            return (Guid)result!;
        }
        catch
        {
            throw;
        }
    }

    public async Task<List<Disciplina>> Obter()
    {
        var disciplinas = new List<Disciplina>();

        string sql = @"
            SELECT 
                disciplina_id,
                nome,
                carga_horaria

            FROM aluno_ai.disciplina

            WHERE 1 = 1
        ";

        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var Disciplina = new Disciplina();
                Disciplina.DisciplinaId = reader.GetGuid("disciplina_id");
                Disciplina.Nome = reader.GetString("nome");
                Disciplina.CargaHoraria = reader.GetInt32("carga_horaria");

                disciplinas.Add(Disciplina);
            }
            return disciplinas;

        }
        catch
        {
            throw;
        }
    }

    public async Task<Disciplina?> Obter(Guid disciplinaId)
    {
        const string sql = @"
    
            SELECT
                disciplina_id,
                nome,
                carga_horaria
        
            FROM 
                aluno_ai.disciplina
            WHERE 
                disciplina_id = @disciplina_id 
            LIMIT 1;
            ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("disciplina_id", NpgsqlDbType.Uuid).Value = disciplinaId;

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync()) return null;

            var Disciplina = new Disciplina();

            Disciplina.DisciplinaId = reader.GetGuid("disciplina_id");
            Disciplina.Nome = reader.GetString("nome");
            Disciplina.CargaHoraria = reader.GetInt32("carga_horaria");

            return Disciplina;
        }
        catch
        {
            throw;
        }
    }
}