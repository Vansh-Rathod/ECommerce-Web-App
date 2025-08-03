using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public ProductRepository( ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }


        public async Task<CommonResponse<PagedResult<Product>>> GetProductsAsync( int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice, string filterByStatus )
        {
            try
            {
                //IQueryable<Product> query = _dbContext.Products.AsQueryable();

                var query = _dbContext.Products
                    .AsNoTracking()
                    .AsQueryable();
            //.Where(productObj => productObj.IsActive); // Only active products

                // Filter by search text
                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(productObj =>
                        productObj.Name.Contains(searchText) ||
                        productObj.Description.Contains(searchText));
                }

                // Filter by status
                if(!string.IsNullOrEmpty(filterByStatus) && filterByStatus.ToLower() != "all")
                {
                    switch(filterByStatus.ToLower())
                    {
                        case "active":
                            query = query.Where(productObj => productObj.IsActive);
                            break;
                        case "inactive":
                            query = query.Where(productObj => !productObj.IsActive);
                            break;
                    }
                }

                // Filter by price range
                if(!string.IsNullOrEmpty(filterByPrice) && filterByPrice.ToLower() != "all")
                {
                    switch(filterByPrice.ToLower())
                    {
                        case "below100":
                            query = query.Where(productObj => productObj.Price < 100);
                            break;
                        case "100to500":
                            query = query.Where(productObj => productObj.Price >= 100 && productObj.Price <= 500);
                            break;
                        case "above500":
                            query = query.Where(productObj => productObj.Price > 500);
                            break;
                    }
                }

                int totalRecords = await query.CountAsync();

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";

                query = sortField?.ToLower() switch
                {
                    "name" => ascending ? query.OrderBy(productObj => productObj.Name) : query.OrderByDescending(productObj => productObj.Name),
                    "price" => ascending ? query.OrderBy(productObj => productObj.Price) : query.OrderByDescending(productObj => productObj.Price),
                    "createdat" => ascending ? query.OrderBy(productObj => productObj.CreatedAt) : query.OrderByDescending(productObj => productObj.CreatedAt),
                    _ => query.OrderByDescending(productObj => productObj.Name) // default
                };

                // Pagination
                var pagedProducts = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

                var pagedResult = new PagedResult<Product>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = pagedProducts,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<Product>>.SuccessResponse(
                   pagedResult,
                   "Products fetched successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving products.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.GetProductsAsync()", ex, null, null, null);
                return CommonResponse<PagedResult<Product>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving products." },
                  "Failed to fetch Products."
              );
            }
        }

        public async Task<CommonResponse<PagedResult<Product>>> GetSellerProductsAsync( Guid sellerId, int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice, string filterByStatus )
        {
            try
            {

                var query = _dbContext.Products
            //.Where(productObj => productObj.IsActive && productObj.SellerId == sellerId); // Only active products
            .Where(productObj => productObj.SellerId == sellerId)
            .AsNoTracking();

                // Filter by search text
                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(productObj =>
                        productObj.Name.Contains(searchText) ||
                        productObj.Description.Contains(searchText));
                }

                // Filter by status
                if(!string.IsNullOrEmpty(filterByStatus) && filterByStatus.ToLower() != "all")
                {
                    switch(filterByStatus.ToLower())
                    {
                        case "active":
                            query = query.Where(productObj => productObj.IsActive);
                            break;
                        case "inactive":
                            query = query.Where(productObj => !productObj.IsActive);
                            break;
                    }
                }

                // Filter by price range
                if(!string.IsNullOrEmpty(filterByPrice) && filterByPrice.ToLower() != "all")
                {
                    switch(filterByPrice.ToLower())
                    {
                        case "below100":
                            query = query.Where(productObj => productObj.Price < 100);
                            break;
                        case "100to500":
                            query = query.Where(productObj => productObj.Price >= 100 && productObj.Price <= 500);
                            break;
                        case "above500":
                            query = query.Where(productObj => productObj.Price > 500);
                            break;
                    }
                }

                int totalRecords = await query.CountAsync();

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";

                query = sortField?.ToLower() switch
                {
                    "name" => ascending ? query.OrderBy(productObj => productObj.Name) : query.OrderByDescending(productObj => productObj.Name),
                    "price" => ascending ? query.OrderBy(productObj => productObj.Price) : query.OrderByDescending(productObj => productObj.Price),
                    "createdat" => ascending ? query.OrderBy(productObj => productObj.CreatedAt) : query.OrderByDescending(productObj => productObj.CreatedAt),
                    _ => query.OrderByDescending(productObj => productObj.Name) // default
                };

                // Pagination
                var pagedProducts = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

                var pagedResult = new PagedResult<Product>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = pagedProducts,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<Product>>.SuccessResponse(
                   pagedResult,
                   "Products fetched successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving products for seller id: {sellerId}.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.GetSellerProductsAsync()", ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } });
                return CommonResponse<PagedResult<Product>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving products for seller id: {sellerId}." },
                  "Failed to fetch Products."
              );
            }
        }

        public async Task<CommonResponse<Product>> GetProductByIdAsync( Guid productId )
        {
            try
            {
                var product = await _dbContext.Products
                         .FirstOrDefaultAsync(product => product.Id == productId);

                if(product != null)
                {
                    return CommonResponse<Product>.SuccessResponse(
                        product,
                        "Product fetched successfully");
                }

                return CommonResponse<Product>.FailureResponse(
                    new List<string> { $"Product not found by productId: {productId}." },
                    "Product not found");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving product by id: {productId}.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.GetProductByIdAsync()", ex, null, null, new Dictionary<string, object> { { "ProductId", productId } });
                return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving product by id: {productId}." },
                       "Failed to fetch product");
            }
        }

        public async Task<CommonResponse<Product>> CreateProductAsync( Product product )
        {
            try
            {
                await _dbContext.Products.AddAsync(product);

                await _dbContext.SaveChangesAsync();

                return CommonResponse<Product>.SuccessResponse(
                    product,
                    "Product created successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while creating product.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.CreateProductAsync()", ex, null, null, new Dictionary<string, object> { { "Product", product } });
                return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Exception occurred while creating product." },
                       "Failed to create product");
            }
        }

        public async Task<CommonResponse<Product>> UpdateProductAsync( Product product )
        {
            try
            {
                _dbContext.Products.Update(product);

                await _dbContext.SaveChangesAsync();

                return CommonResponse<Product>.SuccessResponse(
                    product,
                    "Product updated successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while updating product.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.UpdateProductAsync()", ex, null, null, new Dictionary<string, object> { { "Product", product } });
                return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Exception occurred while updating product." },
                       "Failed to update product");
            }
        }


        public async Task<CommonResponse<Product>> DeleteProductAsync( Guid productId )
        {
            try
            {
                var product = await _dbContext.Products.FindAsync(productId);
                if(product == null)
                {
                    return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Product not found by product id: {productId}." },
                       "Product not found");
                }

                _dbContext.Products.Remove(product);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<Product>.SuccessResponse(
                    product,
                    "Product deleted successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while deleting product by product id: {productId}.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.DeleteProductAsync()", ex, null, null, new Dictionary<string, object> { { "ProductId", productId } });
                return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Exception occurred while deleting product by product id: {productId}." },
                       "Failed to delete product");
            }
        }

        public async Task<CommonResponse<Product>> MakeProductInactiveAsync( Guid productId )
        {
            try
            {
                var product = await _dbContext.Products.FindAsync(productId);
                if(product == null)
                {
                    return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Product not found by product id: {productId}." },
                       "Product not found");
                }
                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;

                _dbContext.Products.Update(product);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<Product>.SuccessResponse(
                    product,
                    "Product deactivated successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while deactivating product by product id: {productId}.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.MakeProductInactiveAsync()", ex, null, null, new Dictionary<string, object> { { "ProductId", productId } });
                return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Exception occurred while deactivating product by product id: {productId}." },
                       "Failed to deactivate product");
            }
        }

        public async Task<CommonResponse<Product>> MakeProductActiveAsync( Guid productId )
        {
            try
            {
                var product = await _dbContext.Products.FindAsync(productId);
                if(product == null)
                {
                    return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Product not found by product id: {productId}." },
                       "Product not found");
                }

                product.IsActive = true;
                product.UpdatedAt = DateTime.UtcNow;

                _dbContext.Products.Update(product);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<Product>.SuccessResponse(
                    product,
                    "Product activated successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while activating product by product id: {productId}.", SharedReference.Enums.Enum.LogLevel.Error, "ProductRepository.MakeProductActiveAsync()", ex, null, null, new Dictionary<string, object> { { "ProductId", productId } });
                return CommonResponse<Product>.FailureResponse(
                       new List<string> { $"Exception occurred while activating product by product id: {productId}." },
                       "Failed to activate product");
            }
        }

    }
}
