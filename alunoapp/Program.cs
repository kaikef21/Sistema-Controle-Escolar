using alunoapp.Controllers;
using alunoapp.Models;
using alunoapp.Repositories;
using alunoapp.Services;
using alunoapp.Startup;
using Microsoft.AspNetCore.Identity;
using Npgsql;
using System.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("A string de conexão DefaultConnection não foi encontrada ou configurada.");

builder.Services.AddScoped(_ => new NpgsqlConnection(connectionString));
builder.Services.AddScoped<IDbConnection>(sp => sp.GetRequiredService<NpgsqlConnection>());

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
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
builder.Services.AddScoped<AtividadeRepository>();
builder.Services.AddScoped<AtividadeService>();
builder.Services.AddScoped<NotaRepository>();
builder.Services.AddScoped<NotaService>();
builder.Services.AddScoped<FrequenciaRepository>();
builder.Services.AddScoped<FrequenciaService>();

builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});

var app = builder.Build();

app.UseCustomExceptionHandlerConfiguration();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapUsuarioEndpoints();
app.MapTurmaEndpoints();
app.MapNotaEndpoints();
app.MapAlunoEndpoints();
app.MapFrequenciaEndpoints();
app.MapAtividadeEndpoints();

app.MapHealthChecks("/health");

app.Run();