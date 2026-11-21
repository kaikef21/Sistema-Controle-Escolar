using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;

namespace alunoapp.Services;

public class AtividadeService : BaseService
{
    private readonly AtividadeRepository _atividadeRepository;

    public AtividadeService(AtividadeRepository atividadeRepository)
    {
        _atividadeRepository = atividadeRepository;
    }

    public async Task<Guid> Cadastrar(Atividade atividade)
    {
        try
        {
            ValidarCampos(atividade, Guid.Empty);
            return await _atividadeRepository.Cadastrar(atividade);
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastrar atividade: {ex.Message}");
        }
    }

    public async Task<List<Atividade>> Obter()
    {
        try
        {
            return await _atividadeRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter atividade: {ex.Message}");
        }
    }

    public async Task<Atividade> Obter(Guid atividadeId)
    {
        try
        {
            var atividade = await _atividadeRepository.Obter(atividadeId);
            if (atividade == null) throw new NotFoundException("Atividade não encontrada com o ID informado.");
            return atividade;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter atividade por ID: {ex.Message}");
        }
    }

    private void ValidarCampos(Atividade atividade, Guid atividadeId)
    {
        ClearErrors();

        if (string.IsNullOrWhiteSpace(atividade.Titulo))
            AddError(nameof(atividade.Titulo), "Informe um título.");

        if (atividade.NotaMaxima.HasValue && atividade.NotaMaxima <= 0)
            AddError(nameof(atividade.NotaMaxima), "A nota máxima deve ser maior que zero.");

        if (string.IsNullOrWhiteSpace(atividade.Tipo))
            AddError(nameof(atividade.Tipo), "Informe um tipo.");

        if (atividade.TurmaId == Guid.Empty)
            AddError(nameof(atividade.TurmaId), "Informe uma turma.");

        if (atividade.DataRealizacao == default)
            AddError(nameof(atividade.DataRealizacao), "Informe a data de realização.");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}