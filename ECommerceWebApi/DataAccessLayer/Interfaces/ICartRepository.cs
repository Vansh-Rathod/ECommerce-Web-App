using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface ICartRepository
    {
        Task<CommonResponse<Cart>> GetCartByIdAsync(Guid cartId);

        Task<CommonResponse<Cart>> GetCartByCustomerIdAsync(Guid customerId);

        Task<CommonResponse<CartItem>> AddToCartAsync(Guid cartId, Guid productId, int quantity);

        Task<CommonResponse<CartItem>> RemoveFromCartAsync(Guid cartId, Guid productId, int quantity);

        Task<CommonResponse<Cart>> ClearCartAsync(Guid cartId);
    }
}
