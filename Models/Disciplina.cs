using System.Text.Json.Serialization;

namespace alunoapp.Models;

public class Disciplina
{
    [JsonIgnore]
    public virtual Guid DisciplinaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
}