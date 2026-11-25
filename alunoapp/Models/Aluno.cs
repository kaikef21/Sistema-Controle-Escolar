using System.Text.Json.Serialization;

namespace alunoapp.Models;

public class Aluno
{
    [JsonIgnore]
    public Guid AlunoId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Matricula { get; set; } = string.Empty;
    public Guid TurmaId { get; set; }
}