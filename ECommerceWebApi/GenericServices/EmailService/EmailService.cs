using GenericServices.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MimeKit;
using SharedReference;

namespace GenericServices.EmailService
{
    public class EmailService : IEmailService
    {
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpEmail;
        private readonly string _smtpPassword;
        //private readonly string _appBaseUrl;
        private readonly ILoggerRepository _loggerRepository;

        public EmailService( IConfiguration configuration, ILoggerRepository loggerRepository )
        {
            _smtpHost = configuration["SmtpSettings:Host"];
            _smtpPort = int.Parse(configuration["SmtpSettings:Port"]);
            _smtpEmail = configuration["SmtpSettings:Email"];
            _smtpPassword = configuration["SmtpSettings:Password"];
            //_appBaseUrl = configuration["AppSettings:APP_BASE_URL"];
            _loggerRepository = loggerRepository;
        }

        public async Task<CommonResponse<object>> SendEmailAsync( string toEmail, string subject, string htmlBody, FileContentResult? attachment )
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("Hydra ECommerce Service", _smtpEmail));
            emailMessage.To.Add(MailboxAddress.Parse(toEmail));
            emailMessage.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };

            if(attachment != null)
            {
                builder.Attachments.Add(attachment.FileDownloadName, attachment.FileContents, ContentType.Parse(attachment.ContentType));
            }

            emailMessage.Body = builder.ToMessageBody();

            try
            {

                using var client = new SmtpClient();
                //await client.ConnectAsync(_smtpHost, _smtpPort, false);
                await client.ConnectAsync(_smtpHost, _smtpPort, MailKit.Security.SecureSocketOptions.StartTlsWhenAvailable);
                await client.AuthenticateAsync(_smtpEmail, _smtpPassword);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);

                return CommonResponse<object>.SuccessResponse(
                        toEmail,
                        "Eamil sent successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while sending email.", SharedReference.Enums.Enum.LogLevel.Error, "EmailService.SendEmailAsync()", ex, null, null, new Dictionary<string, object> { { "ToEmail", toEmail }, { "Subject", subject }, { "HtmlBody", htmlBody }, { "Attachment", attachment } });
                return CommonResponse<object>.FailureResponse(
                       new List<string> { $"Exception occurred while sending email." },
                       "Failed to send email");
            }
        }
    }
}
