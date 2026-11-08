using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace alunoapp.Models;

public class Aluno 
{
    [JsonIgnore]
    public virtual Guid AlunoId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? DataNascimento { get; set; }
    public string Cpf { get; set; } = string.Empty;
    public string NomeResponsavel { get; set; } = string.Empty;
    public string TelefoneResponsavel { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}