using GenericServices.Interfaces;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericServices.EmailService
{
    public class EmailTemplates : IEmailTemplates
    {
        public CommonResponse<string> GenerateSellerApprovalRequestEmailTemplate( User newUser, string approveUrl, string rejectUrl )
        {
            var htmlBody = GenerateSellerApprovalRequestEmailBody(newUser, approveUrl, rejectUrl);

            return CommonResponse<string>.SuccessResponse(htmlBody, "Seller approval request email template generated successfully");
        }

        public CommonResponse<string> GenerateOTPVerificationEmailTemplate( string otpCode, string userName )
        {
            var htmlBody = GenerateOTPVerificationEmailBody(otpCode, userName);

            return CommonResponse<string>.SuccessResponse(htmlBody, "OTP verification email template generated successfully");
        }


        public CommonResponse<string> GenerateOrderApprovalRequestEmailTemplate( User seller, List<OrderItem> orderItems, Guid orderId )
        {
            var htmlBody = GenerateOrderApprovalRequestEmailBody(seller, orderItems, orderId);

            return CommonResponse<string>.SuccessResponse(htmlBody, "Order approval request email template generated successfully");
        }

        public CommonResponse<string> GenerateOrderApprovedEmailTemplate( string customerName, List<OrderItem> approvedItems, Guid orderId )
        {
            var htmlBody = GenerateOrderApprovedEmailBody(customerName, approvedItems, orderId);

            return CommonResponse<string>.SuccessResponse(htmlBody, "Order approved request email template generated successfully");
        }

        public CommonResponse<string> GenerateOrderRejectedEmailTemplate( string customerName, List<OrderItem> rejectedItems, decimal totalRefund, Guid orderId )
        {
            var htmlBody = GenerateOrderRejectedEmailBody(customerName, rejectedItems, totalRefund, orderId);

            return CommonResponse<string>.SuccessResponse(htmlBody, "Order rejected request email template generated successfully");
        }

        public CommonResponse<string> GeneratePartialOrderApprovedEmailTemplate( string customerName, List<OrderItem> approvedItems, List<OrderItem> rejectedItems, decimal totalRefund, Guid orderId )
        {
            var htmlBody = GeneratePartialOrderApprovedEmailBody(customerName, approvedItems, rejectedItems, totalRefund, orderId);

            return CommonResponse<string>.SuccessResponse(htmlBody, "Order partially approved email template generated successfully");
        }



        // --------------------------------------------------------------------------------------------------------------------

        private string GenerateOTPVerificationEmailBody( string otpCode, string userName )
        {
            return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Your Security Code</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            line-height: 1.6;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-top: 40px;
            margin-bottom: 40px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }}
        .content {{
            padding: 40px 30px;
            text-align: center;
        }}
        .greeting {{
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 25px;
        }}
        .message {{
            font-size: 16px;
            color: #5a6c7d;
            margin-bottom: 30px;
            line-height: 1.7;
        }}
        .otp-container {{
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            box-shadow: 0 5px 15px rgba(240, 147, 251, 0.3);
        }}
        .otp-label {{
            color: white;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .otp-code {{
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }}
        .warning {{
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            color: #856404;
        }}
        .warning-icon {{
            font-size: 20px;
            margin-right: 8px;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            margin: 0;
            color: #6c757d;
            font-size: 14px;
        }}
        .security-tips {{
            background-color: #e8f4fd;
            border-left: 4px solid #0066cc;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }}
        .security-tips h3 {{
            margin: 0 0 10px 0;
            color: #0066cc;
            font-size: 16px;
        }}
        .security-tips ul {{
            margin: 0;
            padding-left: 20px;
            color: #2c5282;
        }}
        .security-tips li {{
            margin-bottom: 5px;
            font-size: 14px;
        }}
        @media (max-width: 600px) {{
            .container {{
                margin: 10px;
                border-radius: 8px;
            }}
            .header, .content, .footer {{
                padding: 25px 20px;
            }}
            .otp-code {{
                font-size: 28px;
                letter-spacing: 4px;
            }}
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 Security Verification</h1>
            <p>Your account security is our priority</p>
        </div>
        
        <div class='content'>
            <div class='greeting'>
                Hello {(string.IsNullOrEmpty(userName) ? "there" : userName)},
            </div>
            
            <div class='message'>
                We received a request to sign in to your account. To complete your login, please use the verification code below:
            </div>
            
            <div class='otp-container'>
                <div class='otp-label'>Your Verification Code</div>
                <div class='otp-code'>{otpCode}</div>
            </div>
            
            <div class='warning'>
                <span class='warning-icon'>⚠️</span>
                <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. Please use it immediately to complete your login.
            </div>
            
            <div class='security-tips'>
                <h3>🛡️ Security Tips</h3>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>We will never ask for this code via phone or email</li>
                    <li>If you didn't request this code, please ignore this email</li>
                </ul>
            </div>
        </div>
        
        <div class='footer'>
            <p>
                This is an automated message. Please do not reply to this email.<br>
                If you're having trouble, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>";
        }

        private string GenerateSellerApprovalRequestEmailBody( User newUser, string approveUrl, string rejectUrl )
        {
            var roleNames = string.Join(", ", newUser.Roles.Select(ur => ur.Role.Name));
            var registrationDate = newUser.CreatedAt.ToString("MMM dd, yyyy 'at' hh:mm tt");

            return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>New Seller Registration</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;'>
            <h1 style='color: white; margin: 0; font-size: 28px; font-weight: 300;'>
                🎉 New {roleNames} Registration
            </h1>
            <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;'>
                Action Required - Pending Approval
            </p>
        </div>
        
        <!-- Content -->
        <div style='padding: 40px 30px;'>
            
            <!-- Alert Box -->
            <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f39c12;'>
                <div style='display: flex; align-items: center;'>
                    <span style='font-size: 20px; margin-right: 10px;'>⚠️</span>
                    <strong style='color: #856404; font-size: 16px;'>New seller registration requires your approval</strong>
                </div>
            </div>
            
            <!-- User Details Card -->
            <div style='background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #e9ecef;'>
                <h2 style='color: #343a40; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;'>
                    👤 <span style='margin-left: 10px;'>Applicant Details</span>
                </h2>
                
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 12px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057; width: 30%;'>
                            Full Name:
                        </td>
                        <td style='padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;'>
                            {newUser.FullName}
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 12px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;'>
                            Email:
                        </td>
                        <td style='padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;'>
                            <a href='mailto:{newUser.Email}' style='color: #007bff; text-decoration: none;'>
                                {newUser.Email}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 12px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;'>
                            Role:
                        </td>
                        <td style='padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;'>
                            <span style='background-color: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;'>
                                {roleNames}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 12px 0; font-weight: bold; color: #495057;'>
                            Registration Date:
                        </td>
                        <td style='padding: 12px 0; color: #212529;'>
                            {registrationDate}
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Instructions -->
            <div style='margin-bottom: 30px;'>
                <h3 style='color: #343a40; margin: 0 0 15px 0; font-size: 18px;'>📋 Next Steps</h3>
                <p style='color: #6c757d; line-height: 1.6; margin: 0; font-size: 15px;'>
                    Please review the applicant's information and choose an appropriate action below. 
                    The applicant will be notified of your decision via email.
                </p>
            </div>
            
            <!-- Action Buttons -->
            <div style='text-align: center; margin: 35px 0;'>
                <table style='margin: 0 auto; border-collapse: separate; border-spacing: 15px 0;'>
                    <tr>
                        <td>
                            <a href='{approveUrl}' 
                               style='display: inline-block; padding: 15px 30px; background: linear-gradient(45deg, #28a745, #20c997); 
                                      color: white; text-decoration: none; border-radius: 8px; font-weight: 600; 
                                      font-size: 16px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); 
                                      transition: all 0.3s ease; min-width: 120px; text-align: center;'>
                                ✅ Approve
                            </a>
                        </td>
                        <td>
                            <a href='{rejectUrl}' 
                               style='display: inline-block; padding: 15px 30px; background: linear-gradient(45deg, #dc3545, #e74c3c); 
                                      color: white; text-decoration: none; border-radius: 8px; font-weight: 600; 
                                      font-size: 16px; box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3); 
                                      transition: all 0.3s ease; min-width: 120px; text-align: center;'>
                                ❌ Reject
                            </a>
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Divider -->
            <hr style='border: none; height: 1px; background: linear-gradient(to right, transparent, #dee2e6, transparent); margin: 40px 0;'>
            
            <!-- Footer Info -->
            <div style='text-align: center; color: #6c757d; font-size: 14px; line-height: 1.5;'>
                <p style='margin: 0 0 10px 0;'>
                    This is an automated notification from your application system.
                </p>
                <p style='margin: 0; font-size: 13px; color: #adb5bd;'>
                    Please do not reply to this email. If you have questions, contact your system administrator.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;'>
            <p style='margin: 0; color: #6c757d; font-size: 13px;'>
                © {DateTime.Now.Year} Hydra ECommerce Services. All rights reserved.
            </p>
        </div>
        
    </div>
</body>
</html>";
        }

        private string GenerateOrderApprovalRequestEmailBody( User seller, List<OrderItem> orderItems, Guid orderId )
        {
            var totalItems = orderItems.Count;
            var totalQuantity = orderItems.Sum(item => item.Quantity);

            var htmlBody = $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Order Approval Request</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }}
        .order-details {{
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }}
        .items-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }}
        .items-table th,
        .items-table td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}
        .items-table th {{
            background-color: #f2f2f2;
            font-weight: bold;
        }}
        .items-table tbody tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        .action-required {{
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .action-required h3 {{
            color: #856404;
            margin-top: 0;
        }}
        .footer {{
            background-color: #333;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 0 0 5px 5px;
            font-size: 12px;
        }}
        .btn {{
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
        }}
        .btn-secondary {{
            background-color: #6c757d;
        }}
        .summary {{
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
        }}
        .summary-item {{
            text-align: center;
            flex: 1;
        }}
        .summary-number {{
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>New Order Approval Request</h1>
        <p>Order ID: #{orderId.ToString()}</p>
    </div>
    
    <div class='content'>
        <h2>Hello {seller.FullName},</h2>
        
        <p>You have received a new order that requires your approval. Please review the order details below and check your stock availability in the application.</p>
        
        <div class='order-details'>
            <h3>Order Summary</h3>
            <div class='summary'>
                <div class='summary-item'>
                    <div class='summary-number'>{totalItems}</div>
                    <div>Product Types</div>
                </div>
                <div class='summary-item'>
                    <div class='summary-number'>{totalQuantity}</div>
                    <div>Total Quantity</div>
                </div>
                <div class='summary-item'>
                    <div class='summary-number'>#{orderId}</div>
                    <div>Order ID</div>
                </div>
            </div>
        </div>
        
        <h3>Ordered Items</h3>
        <table class='items-table'>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>SKU/Code</th>
                    <th>Requested Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Amount</th>
                </tr>
            </thead>
            <tbody>";

            foreach(var item in orderItems)
            {
                var totalAmount = item.Quantity * item.PriceAtPurchase;
                htmlBody += $@"
                <tr>
                    <td>{item.Product?.Name ?? "N/A"}</td>
                    <td>{item.ProductId.ToString()}</td>
                    <td>{item.Quantity}</td>
                    <td>${item.PriceAtPurchase:F2}</td>
                    <td>${totalAmount:F2}</td>
                </tr>";
            }

            var grandTotal = orderItems.Sum(item => item.Quantity * item.PriceAtPurchase);

            htmlBody += $@"
            </tbody>
            <tfoot>
                <tr style='font-weight: bold; background-color: #f2f2f2;'>
                    <td colspan='4'>Grand Total</td>
                    <td>${grandTotal:F2}</td>
                </tr>
            </tfoot>
        </table>
        
        <div class='action-required'>
            <h3>Action Required</h3>
            <p><strong>Please follow these steps:</strong></p>
            <ol>
                <li>Log in to your seller dashboard</li>
                <li>Check your current stock levels for the requested items</li>
                <li>Verify if you can fulfill the complete order</li>
                <li>Approve or reject the order based on your stock availability</li>
            </ol>
            <p><strong>Important:</strong> Please respond within 24 hours to ensure timely order processing.</p>
        </div>
        
        <div style='text-align: center; margin: 20px 0;'>
            <a href='#' class='btn'>Login to Dashboard</a>
            <a href='#' class='btn btn-secondary'>View Order Details</a>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Thank you for your prompt attention to this matter.</p>
        
        <p>Best regards,<br>
        The Marketplace Team</p>
    </div>
    
    <div class='footer'>
        <p>This is an automated message. Please do not reply directly to this email.</p>
        <p>&copy; 2024 Your Marketplace. All rights reserved.</p>
    </div>
</body>
</html>";

            return htmlBody;
        }

        private string GenerateOrderApprovedEmailBody( string customerName, List<OrderItem> approvedItems, Guid orderId )
        {
            decimal totalAmount = approvedItems.Sum(item => item.Quantity * item.PriceAtPurchase);

            var sb = new StringBuilder();
            sb.Append(@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Order Approved</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .success-icon { background-color: #28a745; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
        .order-details { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6; }
        .order-id { font-size: 18px; font-weight: 600; color: #495057; }
        .total-amount { font-size: 20px; font-weight: 700; color: #28a745; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .items-table th { background-color: #e9ecef; padding: 12px; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6; }
        .items-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        .item-name { font-weight: 500; color: #495057; }
        .item-price { font-weight: 600; color: #28a745; }
        .next-steps { background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .next-steps h3 { margin-top: 0; color: #007bff; }
        .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Order Approved!</h1>
            <p>Great news! Your order has been approved and is being processed</p>
        </div>
        
        <div class='content'>
            <div class='success-icon'>✓</div>
            
            <h2>Hello " + customerName + @",</h2>
            <p>We're excited to let you know that your order has been <strong>approved</strong> and is now being prepared for delivery!</p>
            
            <div class='order-details'>
                <div class='order-header'>
                    <span class='order-id'>Order #" + orderId.ToString() + @"</span>
                    <span class='total-amount'>₹" + totalAmount.ToString("N2") + @"</span>
                </div>
                
                <table class='items-table'>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>");

            foreach(var item in approvedItems)
            {
                decimal itemTotal = item.Quantity * item.PriceAtPurchase;
                sb.Append($@"
                        <tr>
                            <td class='item-name'>{item.Product.Name}</td>
                            <td>{item.Quantity}</td>
                            <td class='item-price'>₹{item.PriceAtPurchase:N2}</td>
                            <td class='item-price'>₹{itemTotal:N2}</td>
                        </tr>");
            }

            sb.Append(@"
                    </tbody>
                </table>
            </div>
            
            <div class='next-steps'>
                <h3>What happens next?</h3>
                <ul>
                    <li>Your order is being prepared by our team</li>
                    <li>You'll receive a tracking notification once shipped</li>
                    <li>Expected delivery within 3-5 business days</li>
                    <li>You can track your order status in your account</li>
                </ul>
            </div>
            
            <p>Thank you for choosing us! If you have any questions, feel free to contact our support team.</p>
        </div>
        
        <div class='footer'>
            <p><strong>Customer Support</strong></p>
            <p>Email: support@company.com | Phone: +91-XXXXXXXXXX</p>
            <p>&copy; 2024 Hydra Ecommerce Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>");

            return sb.ToString();
        }

        private string GenerateOrderRejectedEmailBody( string customerName, List<OrderItem> rejectedItems, decimal totalRefund, Guid orderId )
        {
            var sb = new StringBuilder();
            sb.Append(@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Order Update</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .info-icon { background-color: #ffc107; color: #212529; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; font-weight: bold; }
        .order-details { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6; }
        .order-id { font-size: 18px; font-weight: 600; color: #495057; }
        .refund-amount { font-size: 20px; font-weight: 700; color: #28a745; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .items-table th { background-color: #e9ecef; padding: 12px; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6; }
        .items-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        .item-name { font-weight: 500; color: #495057; }
        .item-price { font-weight: 600; color: #dc3545; }
        .refund-info { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .refund-info h3 { margin-top: 0; color: #17a2b8; }
        .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
        .footer p { margin: 5px 0; }
        .sorry-message { background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px 0; color: #721c24; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Order Update</h1>
            <p>Important information about your recent order</p>
        </div>
        
        <div class='content'>
            <div class='info-icon'>!</div>
            
            <h2>Hello " + customerName + @",</h2>
            
            <div class='sorry-message'>
                <strong>We sincerely apologize</strong> - Unfortunately, we had to reject your order due to stock unavailability or other operational constraints.
            </div>
            
            <div class='order-details'>
                <div class='order-header'>
                    <span class='order-id'>Order #" + orderId.ToString() + @"</span>
                    <span class='refund-amount'>Refund: ₹" + totalRefund.ToString("N2") + @"</span>
                </div>
                
                <table class='items-table'>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>");

            foreach(var item in rejectedItems)
            {
                decimal itemTotal = item.Quantity * item.PriceAtPurchase;
                sb.Append($@"
                        <tr>
                            <td class='item-name'>{item.Product.Name}</td>
                            <td>{item.Quantity}</td>
                            <td class='item-price'>₹{item.PriceAtPurchase:N2}</td>
                            <td class='item-price'>₹{itemTotal:N2}</td>
                        </tr>");
            }

            sb.Append(@"
                    </tbody>
                </table>
            </div>
            
            <div class='refund-info'>
                <h3>💰 Refund Information</h3>
                <ul>
                    <li><strong>Refund Amount:</strong> ₹" + totalRefund.ToString("N2") + @"</li>
                    <li><strong>Refund Method:</strong> Credited to your wallet</li>
                    <li><strong>Processing Time:</strong> Immediate</li>
                    <li>You can use this amount for future purchases</li>
                </ul>
            </div>
            
            <p>We understand this is disappointing, and we're committed to serving you better in the future. Please check our current inventory for similar products or contact us for alternatives.</p>
            
            <p><strong>We value your business and look forward to serving you again soon!</strong></p>
        </div>
        
        <div class='footer'>
            <p><strong>Customer Support</strong></p>
            <p>Email: support@company.com | Phone: +91-XXXXXXXXXX</p>
            <p>&copy; 2024 Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>");

            return sb.ToString();
        }

        private string GeneratePartialOrderApprovedEmailBody( string customerName, List<OrderItem> approvedItems, List<OrderItem> rejectedItems, decimal totalRefund, Guid orderId )
        {
            decimal approvedAmount = approvedItems.Sum(item => item.Quantity * item.PriceAtPurchase);

            var sb = new StringBuilder();
            sb.Append(@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Order Partially Approved</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #fd7e14, #e55a4f); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .partial-icon { background-color: #fd7e14; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
        .section { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6; }
        .section-title { font-size: 18px; font-weight: 600; color: #495057; }
        .approved-section .section-title { color: #28a745; }
        .rejected-section .section-title { color: #dc3545; }
        .amount { font-size: 18px; font-weight: 700; }
        .approved-amount { color: #28a745; }
        .refund-amount { color: #17a2b8; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .items-table th { background-color: #e9ecef; padding: 12px; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6; }
        .items-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        .item-name { font-weight: 500; color: #495057; }
        .approved-price { font-weight: 600; color: #28a745; }
        .rejected-price { font-weight: 600; color: #dc3545; }
        .summary-box { background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .summary-box h3 { margin-top: 0; color: #007bff; }
        .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📦 Order Partially Approved</h1>
            <p>Some items approved, some items unavailable</p>
        </div>
        
        <div class='content'>
            <div class='partial-icon'>⚡</div>
            
            <h2>Hello " + customerName + @",</h2>
            <p>Thank you for your order! We've processed your request and have <strong>good news and updates</strong> to share:</p>
            
            <!-- Approved Items Section -->
            <div class='section approved-section'>
                <div class='section-header'>
                    <span class='section-title'>✅ Approved Items (Order #" + orderId.ToString() + @")</span>
                    <span class='amount approved-amount'>₹" + approvedAmount.ToString("N2") + @"</span>
                </div>
                
                <table class='items-table'>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>");

            foreach(var item in approvedItems)
            {
                decimal itemTotal = item.Quantity * item.PriceAtPurchase;
                sb.Append($@"
                        <tr>
                            <td class='item-name'>{item.Product.Name}</td>
                            <td>{item.Quantity}</td>
                            <td class='approved-price'>₹{item.PriceAtPurchase:N2}</td>
                            <td class='approved-price'>₹{itemTotal:N2}</td>
                        </tr>");
            }

            sb.Append(@"
                    </tbody>
                </table>
                <p><small>✅ These items are being prepared for delivery</small></p>
            </div>
            
            <!-- Rejected Items Section -->
            <div class='section rejected-section'>
                <div class='section-header'>
                    <span class='section-title'>❌ Unavailable Items</span>
                    <span class='amount refund-amount'>Refund: ₹" + totalRefund.ToString("N2") + @"</span>
                </div>
                
                <table class='items-table'>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Refund</th>
                        </tr>
                    </thead>
                    <tbody>");

            foreach(var item in rejectedItems)
            {
                decimal itemTotal = item.Quantity * item.PriceAtPurchase;
                sb.Append($@"
                        <tr>
                            <td class='item-name'>{item.Product.Name}</td>
                            <td>{item.Quantity}</td>
                            <td class='rejected-price'>₹{item.PriceAtPurchase:N2}</td>
                            <td class='rejected-price'>₹{itemTotal:N2}</td>
                        </tr>");
            }

            sb.Append(@"
                    </tbody>
                </table>
                <p><small>❌ These items were out of stock and amount has been refunded to your wallet</small></p>
            </div>
            
            <div class='summary-box'>
                <h3>📋 Order Summary</h3>
                <ul>
                    <li><strong>Approved Items:</strong> " + approvedItems.Count + @" items worth ₹" + approvedAmount.ToString("N2") + @"</li>
                    <li><strong>Refunded Items:</strong> " + rejectedItems.Count + @" items worth ₹" + totalRefund.ToString("N2") + @"</li>
                    <li><strong>Refund Status:</strong> Immediately credited to your wallet</li>
                    <li><strong>Delivery Status:</strong> Approved items will be delivered in 3-5 business days</li>
                </ul>
            </div>
            
            <p>We apologize for any inconvenience caused by the unavailable items. Your approved items are being processed and will be shipped soon. The refunded amount is available in your wallet for future purchases.</p>
            
            <p><strong>Thank you for your understanding and continued trust in us!</strong></p>
        </div>
        
        <div class='footer'>
            <p><strong>Customer Support</strong></p>
            <p>Email: support@company.com | Phone: +91-XXXXXXXXXX</p>
            <p>&copy; 2024 Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>");

            return sb.ToString();
        }


    }
}
