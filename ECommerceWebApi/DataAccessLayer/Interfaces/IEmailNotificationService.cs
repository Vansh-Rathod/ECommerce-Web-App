using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IEmailNotificationService
    {
        // send order approval request to seller
        Task SendSellerOrderApprovalRequestEmail(User user, List<OrderItem> items, Guid orderId);

        // send partial order items rejected email to customer
        Task SendCustomerOrderItemsRejectionEmail(User user, List<OrderItem> rejectedItems, decimal refund);

        // send order approved email to customer
        Task SendCustomerOrderApprovedEmail(User user, List<OrderItem> approvedItems);

        // send order completely rejected to customer
        Task SendCustomerOrderRejectedEmail(User user, List<OrderItem> rejectedItems, decimal refund);
    }
}
