using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
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

        public ProductRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        public async Task<List<Product>> GetProductsAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice)
        {
            try
            {
                //IQueryable<Product> query = _dbContext.Products.AsQueryable();

                var query = _dbContext.Products
            .Where(p => p.IsActive); // Only active products

                // Filter by search text
                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(p =>
                        p.Name.Contains(searchText) ||
                        p.Description.Contains(searchText));
                }

                // Filter by price range
                if (!string.IsNullOrEmpty(filterByPrice))
                {
                    switch (filterByPrice)
                    {
                        case "Below100":
                            query = query.Where(p => p.Price < 100);
                            break;
                        case "100To500":
                            query = query.Where(p => p.Price >= 100 && p.Price <= 500);
                            break;
                        case "Above500":
                            query = query.Where(p => p.Price > 500);
                            break;
                    }
                }

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";

                query = sortField?.ToLower() switch
                {
                    "name" => ascending ? query.OrderBy(p => p.Name) : query.OrderByDescending(p => p.Name),
                    "price" => ascending ? query.OrderBy(p => p.Price) : query.OrderByDescending(p => p.Price),
                    //"createdat" => ascending ? query.OrderBy(p => p.CreatedAt) : query.OrderByDescending(p => p.CreatedAt),
                    _ => query.OrderByDescending(p => p.Name) // default
                };

                // Pagination
                query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error occurred while fetching products: " + ex.Message);
                return new List<Product>();
            }
        }

        public async Task<List<Product>> GetSellerProductsAsync(Guid sellerId, int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByPrice)
        {
            try
            {
                //IQueryable<Product> query = _dbContext.Products.AsQueryable();

                var query = _dbContext.Products
            //.Where(productObj => productObj.IsActive && productObj.SellerId == sellerId); // Only active products
            .Where(productObj => productObj.SellerId == sellerId);

                // Filter by search text
                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(p =>
                        p.Name.Contains(searchText) ||
                        p.Description.Contains(searchText));
                }

                // Filter by price range
                if (!string.IsNullOrEmpty(filterByPrice))
                {
                    switch (filterByPrice)
                    {
                        case "Below100":
                            query = query.Where(p => p.Price < 100);
                            break;
                        case "100To500":
                            query = query.Where(p => p.Price >= 100 && p.Price <= 500);
                            break;
                        case "Above500":
                            query = query.Where(p => p.Price > 500);
                            break;
                    }
                }

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";

                query = sortField?.ToLower() switch
                {
                    "name" => ascending ? query.OrderBy(p => p.Name) : query.OrderByDescending(p => p.Name),
                    "price" => ascending ? query.OrderBy(p => p.Price) : query.OrderByDescending(p => p.Price),
                    //"createdat" => ascending ? query.OrderBy(p => p.CreatedAt) : query.OrderByDescending(p => p.CreatedAt),
                    _ => query.OrderByDescending(p => p.Name) // default
                };

                // Pagination
                query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error occurred while fetching products: " + ex.Message);
                return new List<Product>();
            }
        }

        public async Task<Product> GetProductByIdAsync(Guid productId)
        {
            try
            {
                return await _dbContext.Products
                         .FirstOrDefaultAsync(product => product.Id == productId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving product by id: " + ex.Message);
                return null;
            }
        }

        public async Task<bool> CreateProductAsync(Product product)
        {
            try
            {
                await _dbContext.Products.AddAsync(product);

                var result = await _dbContext.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception Occurred: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> UpdateProductAsync(Product product)
        {
            try
            {
                _dbContext.Products.Update(product);

                var result = await _dbContext.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception Occurred: " + ex.Message);
                return false;
            }
        }


        public async Task<bool> DeleteProductAsync(Guid productId)
        {
            try
            {
                var product = await _dbContext.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                _dbContext.Products.Remove(product);
                var result = await _dbContext.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception Occurred: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> MakeProductInactiveAsync(Guid productId)
        {
            try
            {
                var product = await _dbContext.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }
                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;

                _dbContext.Products.Update(product);
                var result = await _dbContext.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception Occurred: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> MakeProductActiveAsync(Guid productId)
        {
            try
            {
                var product = await _dbContext.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                product.IsActive = true;
                product.UpdatedAt = DateTime.UtcNow;

                _dbContext.Products.Update(product);
                var result = await _dbContext.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception Occurred: " + ex.Message);
                return false;
            }
        }

    }
}
