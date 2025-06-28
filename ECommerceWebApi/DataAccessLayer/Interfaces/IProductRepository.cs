using Microsoft.AspNetCore.Mvc;
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
        Task<List<Product>> GetProductsAsync(int pageNumber , int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice);

        Task<List<Product>> GetSellerProductsAsync(Guid sellerId, int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice);

        Task<Product> GetProductByIdAsync(Guid productId);

        Task<bool> CreateProductAsync(Product product);

        Task<bool> UpdateProductAsync(Product product);

        Task<bool> DeleteProductAsync(Guid productId);

        Task<bool> MakeProductInactiveAsync(Guid productId);

        Task<bool> MakeProductActiveAsync(Guid productId);
    }
}
