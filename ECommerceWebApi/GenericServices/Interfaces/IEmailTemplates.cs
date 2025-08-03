using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericServices.Interfaces
{
    public interface IEmailTemplates
    {
        CommonResponse<string> GenerateSellerApprovalRequestEmailTemplate( User newUser, string approveUrl, string rejectUrl );

        CommonResponse<string> GenerateOTPVerificationEmailTemplate( string otpCode, string userName );

        CommonResponse<string> GenerateOrderApprovalRequestEmailTemplate( User seller, List<OrderItem> orderItems, Guid orderId );

        CommonResponse<string> GenerateOrderApprovedEmailTemplate( string customerName, List<OrderItem> approvedItems, Guid orderId );

        CommonResponse<string> GenerateOrderRejectedEmailTemplate( string customerName, List<OrderItem> rejectedItems, decimal totalRefund, Guid orderId );

        CommonResponse<string> GeneratePartialOrderApprovedEmailTemplate( string customerName, List<OrderItem> approvedItems, List<OrderItem> rejectedItems, decimal totalRefund, Guid orderId );
    }
}
