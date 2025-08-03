using Microsoft.AspNetCore.Mvc;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IProductRepository
    {
        Task<CommonResponse<PagedResult<Product>>> GetProductsAsync( int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice, string filterByStatus );

        Task<CommonResponse<PagedResult<Product>>> GetSellerProductsAsync( Guid sellerId, int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice, string filterByStatus );

        Task<CommonResponse<Product>> GetProductByIdAsync( Guid productId );

        Task<CommonResponse<Product>> CreateProductAsync( Product product );

        Task<CommonResponse<Product>> UpdateProductAsync( Product product );

        Task<CommonResponse<Product>> DeleteProductAsync( Guid productId );

        Task<CommonResponse<Product>> MakeProductInactiveAsync( Guid productId );

        Task<CommonResponse<Product>> MakeProductActiveAsync( Guid productId );
    }
}
