using System.Text.Json.Serialization;

namespace alunoapp.Models;

public class Professor
{
    [JsonIgnore]
    public virtual Guid ProfessorId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
}