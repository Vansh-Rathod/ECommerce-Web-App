using DataAccessLayer.Interfaces;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class LoggerRepository : ILoggerRepository
    {
        private readonly IConfiguration _configuration;

        public LoggerRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task LogAsync(string message, SharedReference.Enums.Enum.LogLevel level = SharedReference.Enums.Enum.LogLevel.Info, string source = "Application", Exception? exception = null, Guid? userId = null, string? userEmail = null, Dictionary<string, object>? additionalData = null)
        {
            try
            {
                // 1. Get log folder path from appsettings.json
                string folderPath = _configuration["LoggerSettings:LogFolderPath"];

                // 2. Ensure the folder exists
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                // 3. Build daily log file name
                string filePath = Path.Combine(folderPath, $"log_{DateTime.UtcNow:yyyy-MM-dd}.txt");

                // 4. Build log object
                var logEntry = new
                {
                    Id = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow.ToString("o"), // ISO 8601 format
                    Level = level.ToString(),
                    Source = source,
                    Message = message,
                    Exception = exception?.ToString(),
                    StackTrace = exception?.StackTrace,
                    UserId = userId,
                    UserEmail = userEmail,
                    AdditionalData = additionalData

                    // Additional Data can have IPAddress, Device(IPhone, Samsung, etc.)
                };

                // 5. Serialize to pretty JSON
                string logContent = JsonConvert.SerializeObject(logEntry, Formatting.Indented);

                // 6. Append log entry to file
                await File.AppendAllTextAsync(filePath, logContent + Environment.NewLine + new string('-', 80) + Environment.NewLine);
            }
            catch (Exception logEx)
            {
                // Fallback in case logging itself fails
                Console.WriteLine("Logging failed: " + logEx.Message);
            }
        }
    }
}
