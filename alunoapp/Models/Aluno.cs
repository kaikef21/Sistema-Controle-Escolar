using Microsoft.IdentityModel.Tokens;
using System.Net.NetworkInformation;
using System.Security.Cryptography.Xml;
using System.Text.Json.Serialization;
using System.Xml;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace alunoapp.Models;

public class Aluno
{
    [JsonIgnore]
    public virtual Guid AlunoId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Matricula { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Turma { get; set; } = string.Empty;
}