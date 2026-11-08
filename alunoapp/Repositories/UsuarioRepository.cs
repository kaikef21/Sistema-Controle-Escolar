using alunoapp.Models;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace alunoapp.Repositories;

public class UsuarioRepository : BaseRepository
{
    public UsuarioRepository(IDbConnection connection) : base(connection) { }

    public async Task<Guid> Cadastrar(Usuario usuario)
    {

        const string sql = @"
        INSERT INTO aluno_ai.usuario
        (
            username, 
            senha, 
            nome,
            perfil
        )
        VALUES
        (
            @username, 
            @senha, 
            @nome,
            @perfil
        )
        RETURNING usuario_id;
        ";
        try
        {
            await EnsureOpenAsync();

            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("username", NpgsqlDbType.Varchar).Value = usuario.Username;
            cmd.Parameters.Add("senha", NpgsqlDbType.Varchar).Value = usuario.Senha;
            cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = usuario.Nome;
            cmd.Parameters.Add("perfil", NpgsqlDbType.Varchar).Value = usuario.Perfil;

            var result = await cmd.ExecuteScalarAsync();

            return (Guid)result!;
        }
        catch
        {
            throw;
        }
    }

    public async Task<List<Usuario>> Obter()
    {
        var usuarios = new List<Usuario>();
        const string sql = @"
       SELECT 

        usuario_id,
        username,
        senha,
        nome,
        perfil

        FROM aluno_ai.usuario 

        WHERE 1 = 1
        ";
        try
        {
            await EnsureOpenAsync();
            await using var cmd = new NpgsqlCommand(sql, Connection);
            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var Usuario = new Usuario();
                Usuario.UsuarioId = reader.GetGuid("usuario_id");
                Usuario.Username = reader.GetString("username");
                Usuario.Senha = reader.GetString("senha");
                Usuario.Nome = reader.GetString("nome");
                Usuario.Perfil = reader.GetString("perfil");

                usuarios.Add(Usuario);
            }
            return usuarios;
        }
        catch
        {
            throw;
        }
    }

    public async Task<Usuario> Obter(Guid usuarioId)
    {
        const string sql = @"
       SELECT 

        usuario_id,
        username,
        senha,
        nome,
        perfil

        FROM aluno_ai.usuario 

        WHERE usuario_id = @usuario_id
        ";
        try
        {
            await EnsureOpenAsync();
            await using var cmd = new NpgsqlCommand(sql, Connection);

            cmd.Parameters.Add("usuario_id", NpgsqlDbType.Uuid).Value = usuarioId;
            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync()) return null;

            var Usuario = new Usuario();

            Usuario.UsuarioId = reader.GetGuid("usuario_id");
            Usuario.Username = reader.GetString("username");
            Usuario.Senha = reader.GetString("senha");
            Usuario.Nome = reader.GetString("nome");
            Usuario.Perfil = reader.GetString("perfil");

            return Usuario;
        }
        catch
        {
            throw;
        }
    }
}