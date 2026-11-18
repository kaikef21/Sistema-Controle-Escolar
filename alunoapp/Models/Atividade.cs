using System.Text.Json.Serialization;

namespace alunoapp.Models;

public class Atividade
{
    [JsonIgnore]
    public virtual Guid AtividadeId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Tipo { get; set; }
    public Guid TurmaId { get; set; }
    public decimal? NotaMaxima { get; set; }
}