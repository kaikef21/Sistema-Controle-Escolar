using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;

namespace alunoapp.Services;

public class DisciplinaService : BaseService
{
    private readonly DisciplinaRepository _disciplinaRepository;

    public DisciplinaService(DisciplinaRepository disciplinaRepository)
    {
        _disciplinaRepository = disciplinaRepository;
    }

    public async Task<Guid> Cadastrar(Disciplina disciplina)
    {
        try
        {
            ValidarCampos(disciplina, Guid.Empty);
            var disciplinaId = await _disciplinaRepository.Cadastrar(disciplina);
            return disciplinaId;
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastrar disciplina: {ex.Message}");
        }
    }

    public async Task<List<Disciplina>> Obter()
    {
        try
        {
            return await _disciplinaRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter disciplina: {ex.Message}");
        }
    }

    public async Task<Disciplina> Obter(Guid disciplinaId)
    {
        try
        {
            var disciplina = await _disciplinaRepository.Obter(disciplinaId);
            if (disciplina == null) throw new NotFoundException("Disciplina não encontrada com o ID informado. ");
            return disciplina;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter disciplina por ID {ex.Message}");
        }
    }

    private void ValidarCampos(Disciplina disciplina, Guid disciplinaId)
    {
        if (string.IsNullOrWhiteSpace(disciplina.Nome))
            AddError(nameof(disciplina.Nome), "Informe um nome.");

        if (disciplina.CargaHoraria <= 0)
            AddError(nameof(disciplina.CargaHoraria), "Informe a carga horária.");

            if (Errors.Any())
            throw new ValidationException(Errors);
    }
}
