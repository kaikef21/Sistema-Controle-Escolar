using System.Text.Json.Serialization;

namespace alunoapp.Models;

public class Turma
{
    [JsonIgnore]
    public virtual Guid TurmaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int AnoLetivo { get; set; }
}