using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;
using Microsoft.AspNetCore.Identity;

namespace alunoapp.Services;

public class UsuarioService : BaseService
{
    private readonly UsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher<Usuario> _passwordHasher;
    public UsuarioService(UsuarioRepository usuarioRepository, IPasswordHasher<Usuario> passwordHasher)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Guid> Cadastrar(Usuario usuario)
    {
        try
        {
            await ValidarCampos(usuario, Guid.Empty);
            usuario.Senha = _passwordHasher.HashPassword(usuario, usuario.Senha);

            var usuarioId = await _usuarioRepository.Cadastrar(usuario);
            return usuarioId;
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastra usuario: {ex.Message}");
        }
    }

    public async Task<List<Usuario>> Obter()
    {
        try
        {
            return await _usuarioRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter usuario: {ex.Message}");
        }
    }

    public async Task<Usuario> Obter(Guid usuarioId)
    {
        try
        {
            var usuario = await _usuarioRepository.Obter(usuarioId);
            if (usuario == null) throw new NotFoundException("Usuário não encontrado com o ID informado. ");
            return usuario;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter usuário por ID {ex.Message}");
        }
    }

    private async Task ValidarCampos(Usuario usuario, Guid usuarioId)
    {
        if (string.IsNullOrWhiteSpace(usuario.Username))
        {
            AddError(nameof(usuario.Username), "Informe o username");
        }

        if (string.IsNullOrWhiteSpace(usuario.Senha))
            AddError(nameof(usuario.Senha), "Informe a senha.");

        if (string.IsNullOrWhiteSpace(usuario.Nome))
            AddError(nameof(usuario.Nome), "Informe o nome.");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}