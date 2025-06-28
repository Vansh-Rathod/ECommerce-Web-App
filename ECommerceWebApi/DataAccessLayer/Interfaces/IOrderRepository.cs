using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> PlaceOrderAsync(Guid customerId);

        Task<Order> GetOrderByIdAsync(Guid orderId);

        Task<List<Order>> GetOrdersByCustomerIdAsync(Guid customerId);

        Task<List<Order>> GetOrdersBySellerIdAsync(Guid sellerId);

        Task<List<OrderItem>> GetPendingOrderItemsBySellerAsync(Guid sellerId);

        Task<OrderItem> ApproveOrderItemAsync(Guid orderItemId);

        Task<OrderItem> RejectOrderItemAsync(Guid orderItemId);
    }
}
