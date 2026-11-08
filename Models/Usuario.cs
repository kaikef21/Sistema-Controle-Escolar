using System.Text.Json.Serialization;
namespace alunoapp.Models;

public class Usuario
{
    [JsonIgnore]
    public Guid UsuarioId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
}