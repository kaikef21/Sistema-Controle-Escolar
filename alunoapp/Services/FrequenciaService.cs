using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;

namespace alunoapp.Services;

public class FrequenciaService : BaseService
{
    private readonly FrequenciaRepository _frequenciaRepository;

    public FrequenciaService(FrequenciaRepository frequenciaRepository)
    {
        _frequenciaRepository = frequenciaRepository;
    }

    public async Task<Guid> Cadastrar(Frequencia frequencia)
    {
        try
        {
            ValidarCampos(frequencia, Guid.Empty);
            return await _frequenciaRepository.Cadastrar(frequencia);
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastrar frequência: {ex.Message}");
        }
    }

    public async Task<List<Frequencia>> Obter()
    {
        try
        {
            return await _frequenciaRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter frequência: {ex.Message}");
        }
    }

    public async Task<Frequencia> Obter(Guid frequenciaId)
    {
        try
        {
            var frequencia = await _frequenciaRepository.Obter(frequenciaId);
            if (frequencia == null) throw new NotFoundException("Frequência não encontrada com o ID informado.");
            return frequencia;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter frequência por ID: {ex.Message}");
        }
    }

    private void ValidarCampos(Frequencia frequencia, Guid frequenciaId)
    {
        ClearErrors();

        if (frequencia.AlunoId == Guid.Empty)
            AddError(nameof(frequencia.AlunoId), "Informe o aluno.");

        if (frequencia.DataAula == default)
            AddError(nameof(frequencia.DataAula), "Informe a data da aula.");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}