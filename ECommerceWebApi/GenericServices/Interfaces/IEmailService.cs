using Microsoft.AspNetCore.Mvc;
using SharedReference;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericServices.Interfaces
{
    public interface IEmailService
    {
        Task<CommonResponse<object>> SendEmailAsync( string toEmail, string subject, string htmlBody, FileContentResult? attachment );
    }
}
