using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class ProfessorRepository : BaseRepository
{
    public ProfessorRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Professor professor)
    {
        const string sql = @"
   
INSERT INTO aluno_ai.professor
(
    nome,
    telefone,
    email
)
VALUES
(
    @nome,
    @telefone,
    @email
)
RETURNING professor_id;
        ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = professor.Nome;
            cmd.Parameters.Add("telefone", NpgsqlDbType.Varchar).Value = professor.Telefone;
            cmd.Parameters.Add("email", NpgsqlDbType.Varchar).Value = professor.Email;

            var result = await cmd.ExecuteScalarAsync();
            return (Guid)result!;
        }
        catch
        {
            throw;
        }
    }

    public async Task<List<Professor>> Obter()
    {
        var professors = new List<Professor>();

        string sql = @"
    SELECT 
        professor_id,
        nome,
        telefone,
        email
    FROM aluno_ai.professor
    WHERE 1 = 1
";

        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var Professor = new Professor();
                Professor.ProfessorId = reader.GetGuid("professor_id");
                Professor.Nome = reader.GetString("nome");
                Professor.Telefone = reader.GetString("telefone");
                Professor.Email = reader.GetString("email");

                professors.Add(Professor);
            }
            return professors;

        }
        catch
        {
            throw;
        }
    }

    public async Task<Professor?> Obter(Guid professorId)
    {
        const string sql = @"
    
            SELECT
                professor_id,
                nome,
                telefone,
                email
        
            FROM 
                professor_ai.professor
            WHERE 
                professor_id = @professor_id 
            LIMIT 1;
            ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("professor_id", NpgsqlDbType.Uuid).Value = professorId;

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync()) return null;

            var Professor = new Professor();

            Professor.ProfessorId = reader.GetGuid("professor_id");
            Professor.Nome = reader.GetString("nome");
            Professor.Telefone = reader.GetString("telefone");
            Professor.Email = reader.GetString("email");

            return Professor;
        }
        catch
        {
            throw;
        }
    }
}