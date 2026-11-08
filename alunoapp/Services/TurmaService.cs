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
            await ValidarCampos(turma, Guid.Empty);
            var turmaId = await _turmaRepository.Cadastrar(turma);
            return turmaId;
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
            if (turma == null) throw new NotFoundException("Turma não encontrada com o ID informado. ");
            return turma;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter turma por ID {ex.Message}");
        }
    }

    private async Task ValidarCampos(Turma turma, Guid turmaId)
    {
        if (string.IsNullOrWhiteSpace(turma.Nome))
        {
            AddError(nameof(turma.Nome), "Informe o nome");
        }

        if (string.IsNullOrWhiteSpace(turma.Turno))
            AddError(nameof(turma.Turno), "Informe o turno.");

        if (string.IsNullOrWhiteSpace(turma.Sala))
            AddError(nameof(turma.Sala), "Informe a sala.");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}