namespace alunoapp.Utils;

public class DateTimeHelper
{
    private static readonly TimeZoneInfo BrasiliaTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    public static DateTime AgoraBrasilia() => SaoPaulo();

    public static DateTime SaoPaulo()
    {
        var local = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, BrasiliaTimeZone);
        return DateTime.SpecifyKind(local, DateTimeKind.Unspecified);
    }

    public static DateTime AgoraUtc() => DateTime.UtcNow;
}