using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using SharedReference;
using SharedReference.Entities;
using System.Collections.Generic;

namespace ECommerceWebApi.Services.EmailService
{
    public class EmailNotificationService : IEmailNotificationService
    {
        private readonly EmailService _emailService;

        public EmailNotificationService(EmailService emailService)
        {
            _emailService = emailService;
        }

        // send order approval request to seller
        public async Task SendSellerOrderApprovalRequestEmail(User user, List<OrderItem> items, Guid orderId)
        {
            await _emailService.SendOrderApprovalRequestEmail(user, items, orderId);
        }

        // send partial order items rejected email to customer
        public async Task SendCustomerOrderItemsRejectionEmail(User user, List<OrderItem> rejectedItems, decimal refund)
        {
            await _emailService.SendRejectionEmail(user, rejectedItems, refund);
        }

        // TODO: Send Invoice here also
        // send order approved email to customer
        public async Task SendCustomerOrderApprovedEmail(User user, List<OrderItem> approvedItems)
        {
            await _emailService.SendOrderApprovedEmail(user, approvedItems);
        }

        // send order completely rejected to customer
        public async Task SendCustomerOrderRejectedEmail(User user, List<OrderItem> rejectedItems, decimal refund)
        {
            await _emailService.SendOrderFullyRejectedEmail(user, rejectedItems, refund);
        }
    }
}
