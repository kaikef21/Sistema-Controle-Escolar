using alunoapp.Models;
using alunoapp.Repositories;
using alunoapp.Services;
using alunoapp.Controllers;
using alunoapp.Startup;
using Microsoft.AspNetCore.Identity;
using System.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("A variável de ambiente DefaultConnection não foi encontrada ou configurada.");

builder.Services.AddScoped<IDbConnection>(x => new Npgsql.NpgsqlConnection(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Resolve o conflito usando o caminho completo das classes (namespace + nome)
    options.CustomSchemaIds(type => type.FullName);
});


builder.Services.AddHealthChecks();

builder.Services.AddAuthorization();

builder.Services.AddScoped<UsuarioRepository>();
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<AlunoRepository>();
builder.Services.AddScoped<AlunoService>();
builder.Services.AddScoped<TurmaRepository>();
builder.Services.AddScoped<TurmaService>();
builder.Services.AddScoped<DisciplinaRepository>();
builder.Services.AddScoped<DisciplinaService>();

builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();
builder.Services.AddCors(x => x.AddPolicy("*", y => y
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader()));

var app = builder.Build();

app.UseCustomExceptionHandlerConfiguration();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("*");
app.UseAuthorization();

app.MapUsuarioEndpoints();
app.MapTurmaEndpoints();
app.MapAlunoEndpoints();
app.MapDisciplinaEndpoints();

app.MapHealthChecks("/health");

app.Run();