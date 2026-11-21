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
            confirmar_senha
        )
        VALUES
        (
            @username,
            @senha,
            @nome,
            @confirmar_senha
        )
        RETURNING usuario_id;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);

        cmd.Parameters.Add("username", NpgsqlDbType.Varchar).Value = usuario.Username;
        cmd.Parameters.Add("senha", NpgsqlDbType.Varchar).Value = usuario.Senha;
        cmd.Parameters.Add("nome", NpgsqlDbType.Varchar).Value = usuario.Nome;
        cmd.Parameters.Add("confirmar_senha", NpgsqlDbType.Varchar).Value = usuario.ConfirmarSenha.ToDbValue();

        var result = await cmd.ExecuteScalarAsync();
        return (Guid)result!;
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
            confirmar_senha
        FROM aluno_ai.usuario;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            usuarios.Add(new Usuario
            {
                UsuarioId = reader.GetGuid("usuario_id"),
                Username = reader.GetString("username"),
                Senha = reader.GetString("senha"),
                Nome = reader.GetString("nome"),
                ConfirmarSenha = reader.GetStringNullable("confirmar_senha") ?? string.Empty
            });
        }

        return usuarios;
    }

    public async Task<Usuario?> Obter(Guid usuarioId)
    {
        const string sql = @"
        SELECT
            usuario_id,
            username,
            senha,
            nome,
            confirmar_senha
        FROM aluno_ai.usuario
        WHERE usuario_id = @usuario_id
        LIMIT 1;
        ";

        await EnsureOpenAsync();
        await using var cmd = new NpgsqlCommand(sql, Connection);
        cmd.Parameters.Add("usuario_id", NpgsqlDbType.Uuid).Value = usuarioId;

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return new Usuario
        {
            UsuarioId = reader.GetGuid("usuario_id"),
            Username = reader.GetString("username"),
            Senha = reader.GetString("senha"),
            Nome = reader.GetString("nome"),
            ConfirmarSenha = reader.GetStringNullable("confirmar_senha") ?? string.Empty
        };
    }
}