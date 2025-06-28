using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using SharedReference;
using SharedReference.Entities;

namespace ECommerceWebApi.Services.EmailService
{
    public class EmailService
    {
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpEmail;
        private readonly string _smtpPassword;
        private readonly string _appBaseUrl;


        public EmailService(IConfiguration configuration)
        {
            _smtpHost = configuration["SmtpSettings:Host"];
            _smtpPort = int.Parse(configuration["SmtpSettings:Port"]);
            _smtpEmail = configuration["SmtpSettings:Email"];
            _smtpPassword = configuration["SmtpSettings:Password"];
            _appBaseUrl = configuration["AppSettings:APP_BASE_URL"];
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("Vansh ECommerce Service", _smtpEmail));
            emailMessage.To.Add(MailboxAddress.Parse(toEmail));
            emailMessage.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            emailMessage.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, false);
            await client.AuthenticateAsync(_smtpEmail, _smtpPassword);
            await client.SendAsync(emailMessage);
            await client.DisconnectAsync(true);
        }

        public async Task SendInvoiceEmailAsync(string toEmail, string subject, string body, byte[] pdfContent)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("Your Company", _smtpEmail));
            emailMessage.To.Add(new MailboxAddress("", toEmail));
            emailMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body  // The email body with HTML content
            };

            // Add PDF as an attachment
            bodyBuilder.Attachments.Add("Invoice.pdf", pdfContent, ContentType.Parse("application/pdf"));

            emailMessage.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_smtpHost, _smtpPort, false);
                await client.AuthenticateAsync(_smtpEmail, _smtpPassword);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }


        public async Task SendApprovalRequestToAdminAsync(User newUser, string adminEmail, string approvalToken, string rejectionToken)
        {
            var roleNames = string.Join(", ", newUser.Roles.Select(ur => ur.Role.Name));
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("Vansh ECommerce Service", _smtpEmail));
            emailMessage.To.Add(new MailboxAddress("", adminEmail));
            emailMessage.Subject = $"New {roleNames} Registration - Approval Request";

            //var approveUrl = $"{_appBaseUrl}/api/Admin/approve-user/{newUser.Id}";
            //var rejectUrl = $"{_appBaseUrl}/api/Admin/reject-user/{newUser.Id}";
            // you can also use react frontend URL of the admin approvals page

            var approveUrl = $"{_appBaseUrl}/api/Auth/approve-user-by-approval-token?approvalToken={approvalToken}";
            var rejectUrl = $"{_appBaseUrl}/api/Auth/reject-user-by-rejection-token?rejectionToken={rejectionToken}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
            <h1>A new {roleNames} has registered!</h1>
            <p><strong>Name:</strong> {newUser.FullName}</p>
            <p>Please review and take action:</p>
            <a href='{approveUrl}' style='padding: 10px 15px; background-color: green; color: white; text-decoration: none; margin-right: 10px;'>Approve</a>
            <a href='{rejectUrl}' style='padding: 10px 15px; background-color: red; color: white; text-decoration: none;'>Reject</a>"
            };

            emailMessage.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_smtpHost, _smtpPort, false);
                await client.AuthenticateAsync(_smtpEmail, _smtpPassword);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }


        public async Task SendOrderApprovalRequestEmail(User user, List<OrderItem> items, Guid orderId)
        {
            var itemListHtml = string.Join("", items.Select(i => $"<li>{i.Quantity} x {i.Product?.Name ?? "Product"} @ {i.PriceAtPurchase:C}</li>"));
            var body = $@"
<h2>Hello {user.FullName},</h2>
<p>You have new order items awaiting approval for Order <strong>#{orderId}</strong>:</p>
<ul>{itemListHtml}</ul>
<p><a href='{_appBaseUrl}/seller/orders'>Review & Act</a></p>
<p>Thank you,<br/>E-Commerce Platform</p>";

            await SendEmailAsync(user.Email, "Order Items Awaiting Approval", body);
        }


        public async Task SendRejectionEmail(User user, List<OrderItem> rejectedItems, decimal refund)
        {
            var items = string.Join("", rejectedItems.Select(i => $"<li>{i.Quantity} x {i.Product?.Name ?? "Product"} @ {i.PriceAtPurchase:C}</li>"));
            var body = $@"
<h2>Hello {user.FullName},</h2>
<p>Some of your order items were rejected:</p>
<ul>{items}</ul>
<p>Total refund: <strong>{refund:C}</strong></p>
<p>Refund has been processed to your wallet.</p>
<p>Thank you,<br/>E-Commerce Platform</p>";

            await SendEmailAsync(user.Email, "Order Items Rejected & Refund Processed", body);
        }


        public async Task SendOrderApprovedEmail(User user, List<OrderItem> approvedItems)
        {
            var items = string.Join("", approvedItems.Select(i =>
        $"<li>{i.Quantity} x {i.Product?.Name ?? "Product"} @ {i.PriceAtPurchase:C}</li>"
    ));

            var body = $@"
<h2>Hello {user.FullName},</h2>
<p>Good news! Your order items have been approved and are being prepared for delivery:</p>
<ul>{items}</ul>
<p>We’ll notify you once they’re out for delivery.</p>
<p>Thank you for shopping with us!<br/>E-Commerce Platform</p>";

            await SendEmailAsync(user.Email, "Your Order Has Been Approved", body);
        }


        public async Task SendOrderFullyRejectedEmail(User user, List<OrderItem> rejectedItems, decimal refund)
        {
            var items = string.Join("", rejectedItems.Select(i => $"<li>{i.Quantity} x {i.Product?.Name ?? "Product"} @ {i.PriceAtPurchase:C}</li>"));
            var body = $@"
<h2>Hello {user.FullName},</h2>
<p>Unfortunately, all your order items were rejected:</p>
<ul>{items}</ul>
<p>Total refund: <strong>{refund:C}</strong></p>
<p>The amount has been refunded to your wallet.</p>
<p>We apologize for the inconvenience.</p>
<p>Thank you,<br/>E-Commerce Platform</p>";

            await SendEmailAsync(user.Email, "Your Order Was Rejected", body);
        }
        
    }
}
