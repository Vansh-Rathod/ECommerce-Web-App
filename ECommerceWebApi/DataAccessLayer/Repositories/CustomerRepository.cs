using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public CustomerRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Customer>> GetCustomersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus)
        {
            try
            {
                IQueryable<Customer> query = _dbContext.Customers.AsQueryable()
                    .Include(customerObj => customerObj.User)
                        .ThenInclude(userObj => userObj.SellerProfile)
                    .Include(customerObj => customerObj.Wallet)
                    .Include(customerObj => customerObj.Cart)
                        .ThenInclude(cartObj => cartObj.CartItems)
                    .Include(customerObj => customerObj.Orders)
                        .ThenInclude(orderObj => orderObj.OrderItems);

                //    var query = _dbContext.Sellers
                //.Where(s => s.IsActive); // Only active products

                // Filter by search text
                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(customerObj =>
                        customerObj.User.FullName.Contains(searchText));
                }

                //// Filter by IsActive status
                //if (!string.IsNullOrEmpty(filterByStatus))
                //{
                //    if (bool.TryParse(filterByStatus, out bool isActive))
                //    {
                //        query = query.Where(customerObj => customerObj.IsActive == isActive);
                //    }
                //}

                // Filter by IsActive status (values: "all", "active", "inactive")
                if (!string.IsNullOrWhiteSpace(filterByStatus) && filterByStatus.ToLower() != "all")
                {
                    switch (filterByStatus.ToLower())
                    {
                        case "active":
                            query = query.Where(customerObj => customerObj.IsActive);
                            break;
                        case "inactive":
                            query = query.Where(customerObj => !customerObj.IsActive);
                            break;
                        case "all":
                            // No filtering needed
                            break;
                        default:
                            Console.WriteLine($"Invalid filterByStatus value: {filterByStatus}. Expected 'all', 'active', or 'inactive'.");
                            break;
                    }
                }

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";
                query = sortField?.ToLower() switch
                {
                    "fullname" => ascending ? query.OrderBy(customerObj => customerObj.User.FullName) : query.OrderByDescending(customerObj => customerObj.User.FullName),
                    //"createdat" => ascending ? query.OrderBy(customerObj => customerObj.CreatedAt) : query.OrderByDescending(customerObj => customerObj.CreatedAt),
                    _ => query.OrderByDescending(customerObj => customerObj.User.FullName) // default sort
                };

                // Pagination
                query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error occurred while fetching customers: " + ex.Message);
                return new List<Customer>();
            }
        }


        public async Task<Customer> GetCustomerByIdAsync(Guid customerId)
        {
            try
            {
                return await _dbContext.Customers
                    .Include(customerObj => customerObj.User)
                        .ThenInclude(userObj => userObj.SellerProfile)
                    .Include(customerObj => customerObj.Wallet)
                    .Include(customerObj => customerObj.Cart)
                        .ThenInclude(cartObj => cartObj.CartItems)
                    .Include(customerObj => customerObj.Orders)
                        .ThenInclude(orderObj => orderObj.OrderItems)
                    .FirstOrDefaultAsync(customer => customer.Id == customerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving customer by id: " + ex.Message);
                return null;
            }
        }

        public async Task<Customer> GetCustomerByUserIdAsync(Guid userId)
        {
            try
            {
                return await _dbContext.Customers
                    .Include(customerObj => customerObj.User)
                    .Include(customerObj => customerObj.Wallet)
                        .ThenInclude(walletObj => walletObj.Transactions)
                    .Include(customerObj => customerObj.Cart)
                    .Include(customerObj => customerObj.Orders)
                        .ThenInclude(orderObj => orderObj.OrderItems)
                            .ThenInclude(orderItemObj => orderItemObj.Product)
                    .FirstOrDefaultAsync(customer => customer.UserId == userId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving customer by user id: " + ex.Message);
                return null;
            }
        }


        public async Task<bool> CreateCustomerInDBAsync(Customer customer)
        {
            try
            {
                await _dbContext.Customers.AddAsync(customer);

                var result = await _dbContext.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception Occurred: " + ex.Message);
                return false;
            }
        }


        public async Task<bool> MakeCustomerInactiveByCustomerIdAsync(Guid customerId)
        {
            try
            {
                var customer = await _dbContext.Customers.FindAsync(customerId);
                if (customer == null)
                {
                    return false;
                }

                customer.IsActive = false;
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error making customer inactive: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> MakeCustomerActiveByCustomerIdAsync(Guid customerId)
        {
            try
            {
                var customer = await _dbContext.Customers.FindAsync(customerId);
                if (customer == null)
                {
                    return false;
                }

                customer.IsActive = true;
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error making customer active: " + ex.Message);
                return false;
            }
        }

    }
}
