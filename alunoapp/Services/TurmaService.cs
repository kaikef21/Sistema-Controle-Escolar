using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;

namespace alunoapp.Services;

public class TurmaService : BaseService
{
    private readonly TurmaRepository _turmaRepository;

    public TurmaService(TurmaRepository turmaRepository)
    {
        _turmaRepository = turmaRepository;
    }

    public async Task<Guid> Cadastrar(Turma turma)
    {
        try
        {
            ValidarCampos(turma, Guid.Empty);
            return await _turmaRepository.Cadastrar(turma);
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastrar turma: {ex.Message}");
        }
    }

    public async Task<List<Turma>> Obter()
    {
        try
        {
            return await _turmaRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter turma: {ex.Message}");
        }
    }

    public async Task<Turma> Obter(Guid turmaId)
    {
        try
        {
            var turma = await _turmaRepository.Obter(turmaId);
            if (turma == null) throw new NotFoundException("Turma não encontrada com o ID informado.");
            return turma;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter turma por ID: {ex.Message}");
        }
    }

    private void ValidarCampos(Turma turma, Guid turmaId)
    {
        ClearErrors();

        if (string.IsNullOrWhiteSpace(turma.Nome))
            AddError(nameof(turma.Nome), "Informe o nome.");

        if (turma.AnoLetivo <= 0)
            AddError(nameof(turma.AnoLetivo), "Informe o ano letivo.");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}