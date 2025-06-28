using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference
{
    public class CommonResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; } = new();
        public DateTime TimeStamp { get; set; } = DateTime.UtcNow;

        public static CommonResponse<T> SuccessResponse(T data, string message = "")
        {
            return new CommonResponse<T> { Success = true, Data = data, Message = message };
        }

        public static CommonResponse<T> FailureResponse(List<string> errors, string message = "")
        {
            return new CommonResponse<T> { Success = false, Errors = errors, Message = message };
        }
    }
}
