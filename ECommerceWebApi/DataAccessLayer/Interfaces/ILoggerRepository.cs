using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static SharedReference.Enums.Enum;

namespace DataAccessLayer.Interfaces
{
    public interface ILoggerRepository
    {
        Task LogAsync(string message,
                  LogLevel level = LogLevel.Info,
                  string source = "Application",
                  Exception? exception = null,
                  Guid? userId = null,
                  string? userEmail = null,
                  Dictionary<string, object>? additionalData = null);
    }
}
