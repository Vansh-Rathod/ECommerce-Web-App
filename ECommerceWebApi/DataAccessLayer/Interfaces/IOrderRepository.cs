using SharedReference;
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
        Task<CommonResponse<Order>> PlaceOrderAsync(Guid customerId);

        Task<CommonResponse<Order>> GetOrderByIdAsync(Guid orderId);

        Task<CommonResponse<PagedResult<Order>>> GetOrdersByCustomerIdAsync(Guid customerId, int pageNumber, int pageSize, string searchText, int filterByYear );

        Task<CommonResponse<PagedResult<Order>>> GetOrdersBySellerIdAsync( Guid sellerId, int pageNumber, int pageSize, string searchText, string filterByOrderStatus );

        Task<CommonResponse<PagedResult<OrderItem>>> GetPendingOrderItemsBySellerAsync(Guid sellerId, int pageNumber, int pageSize, string searchText );

        Task<CommonResponse<OrderItem>> ApproveOrderItemAsync(Guid orderItemId);

        Task<CommonResponse<OrderItem>> RejectOrderItemAsync(Guid orderItemId);
    }
}
