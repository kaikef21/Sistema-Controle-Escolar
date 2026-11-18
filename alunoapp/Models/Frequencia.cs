using System.Text.Json.Serialization;

namespace alunoapp.Models;

public class Frequencia
{
    [JsonIgnore]
    public virtual Guid FrequenciaId { get; set; }
    public Guid AlunoId { get; set; }
    public DateTime DataAula { get; set; }
    public bool Presente { get; set; } = true;
}