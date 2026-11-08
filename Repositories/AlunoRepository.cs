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
            data_nascimento,
            cpf,
            nome_responsavel,
            telefone_responsavel,
            email
        )
        VALUES
        (
            @nome,
            @data_nascimento,
            @cpf,
            @nome_responsavel,
            @telefone_responsavel,
            @email
        )
        RETURNING aluno_id
        ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = aluno.Nome;
            cmd.Parameters.Add("data_nascimento", NpgsqlDbType.Varchar).Value = aluno.DataNascimento;
            cmd.Parameters.Add("cpf", NpgsqlDbType.Varchar).Value = aluno.Cpf;
            cmd.Parameters.Add("nome_responsavel", NpgsqlDbType.Varchar).Value = aluno.NomeResponsavel;
            cmd.Parameters.Add("telefone_responsavel", NpgsqlDbType.Varchar).Value = aluno.TelefoneResponsavel;
            cmd.Parameters.Add("email", NpgsqlDbType.Varchar).Value = aluno.Email;
            
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
                data_nascimento,
                cpf,
                nome_responsavel,
                telefone_responsavel,
                email

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
                Aluno.DataNascimento = reader.GetString("data_nascimento");
                Aluno.Cpf = reader.GetString("cpf");
                Aluno.NomeResponsavel = reader.GetString("nome_responsavel");
                Aluno.TelefoneResponsavel = reader.GetString("telefone_responsavel");
                Aluno.Email = reader.GetString("email");

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
                data_nascimento,
                cpf,
                nome_responsavel,
                telefone_responsavel,
                email
        
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
            Aluno.DataNascimento = reader.GetString("data_nascimento");
            Aluno.Cpf = reader.GetString("cpf");
            Aluno.NomeResponsavel = reader.GetString("nome_responsavel");
            Aluno.TelefoneResponsavel = reader.GetString("telefone_responsavel");
            Aluno.Email = reader.GetString("email");

            return Aluno;
        }
        catch
        {
            throw;
        }
    }
}