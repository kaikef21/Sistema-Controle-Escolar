using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;

namespace alunoapp.Services;

public class NotaService : BaseService
{
    private readonly NotaRepository _notaRepository;

    public NotaService(NotaRepository notaRepository)
    {
        _notaRepository = notaRepository;
    }

    public async Task<Guid> Cadastrar(Nota nota)
    {
        try
        {
            ValidarCampos(nota, Guid.Empty);
            return await _notaRepository.Cadastrar(nota);
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastrar nota: {ex.Message}");
        }
    }

    public async Task<List<Nota>> Obter()
    {
        try
        {
            return await _notaRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter nota: {ex.Message}");
        }
    }

    public async Task<Nota> Obter(Guid notaId)
    {
        try
        {
            var nota = await _notaRepository.Obter(notaId);
            if (nota == null) throw new NotFoundException("Nota não encontrada com o ID informado.");
            return nota;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter nota por ID: {ex.Message}");
        }
    }

    private void ValidarCampos(Nota nota, Guid notaId)
    {
        ClearErrors();

        if (nota.AlunoId == Guid.Empty)
            AddError(nameof(nota.AlunoId), "Informe o aluno.");

        if (nota.AtividadeId == Guid.Empty)
            AddError(nameof(nota.AtividadeId), "Informe a atividade.");

        if (nota.ValorNota < 0)
            AddError(nameof(nota.ValorNota), "O valor da nota não pode ser negativo.");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}