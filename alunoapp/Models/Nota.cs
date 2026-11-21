using System.Text.Json.Serialization;

namespace alunoapp.Models;

public class Nota
{
    [JsonIgnore]
    public virtual Guid NotaId { get; set; }
    public Guid AlunoId { get; set; }
    public Guid AtividadeId { get; set; }
    public decimal ValorNota { get; set; }
}