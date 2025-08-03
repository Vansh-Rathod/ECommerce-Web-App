using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GenericServices.Interfaces;

namespace DataAccessLayer.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public CustomerRepository( ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }

        public async Task<CommonResponse<PagedResult<Customer>>> GetCustomersAsync( int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus )
        {
            try
            {
                var query = _dbContext.Customers
                    .Include(customerObj => customerObj.User)
                        .ThenInclude(userObj => userObj.SellerProfile)
                    .Include(customerObj => customerObj.Wallet)
                    .Include(customerObj => customerObj.Cart)
                        .ThenInclude(cartObj => cartObj.CartItems)
                    .Include(customerObj => customerObj.Orders)
                        .ThenInclude(orderObj => orderObj.OrderItems)
                        .AsNoTracking()
                    .AsQueryable();

                // Filter by search text
                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(customerObj =>
                        customerObj.User.FullName.Contains(searchText));
                }

                // Filter by IsActive status (values: "all", "active", "inactive")
                if(!string.IsNullOrWhiteSpace(filterByStatus) && filterByStatus.ToLower() != "all")
                {
                    switch(filterByStatus.ToLower())
                    {
                        case "active":
                            query = query.Where(customerObj => customerObj.IsActive);
                            break;
                        case "inactive":
                            query = query.Where(customerObj => !customerObj.IsActive);
                            break;
                        default:
                            return CommonResponse<PagedResult<Customer>>.FailureResponse(
                        new List<string> { $"Invalid filterByStatus value: {filterByStatus}. Allowed: all, active, inactive." },
                        "Invalid filter"
                    );
                    }
                }

                int totalRecords = await query.CountAsync();

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";
                query = sortField?.ToLower() switch
                {
                    "fullname" => ascending ? query.OrderBy(customerObj => customerObj.User.FullName) : query.OrderByDescending(customerObj => customerObj.User.FullName),
                    "createdat" => ascending ? query.OrderBy(customerObj => customerObj.CreatedAt) : query.OrderByDescending(customerObj => customerObj.CreatedAt),
                    "order" => ascending ? query.OrderBy(customerObj => customerObj.Orders.Count) : query.OrderByDescending(customerObj => customerObj.Orders.Count),
                    _ => query.OrderByDescending(customerObj => customerObj.User.FullName) // default sort
                };

                // Pagination
                var pagedCustomers = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

                var pagedResult = new PagedResult<Customer>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = pagedCustomers,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<Customer>>.SuccessResponse(
                   pagedResult,
                   "Customers fetched successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving customers.", SharedReference.Enums.Enum.LogLevel.Error, "CustomerRepository.GetCustomersAsync()", ex, null, null, null);
                return CommonResponse<PagedResult<Customer>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving customers." },
                  "Failed to fetch Customers"
              );
            }
        }


        public async Task<CommonResponse<Customer>> GetCustomerByIdAsync( Guid customerId )
        {
            try
            {
                var customer = await _dbContext.Customers
                    .Include(customerObj => customerObj.User)
                        .ThenInclude(userObj => userObj.SellerProfile)
                    .Include(customerObj => customerObj.Wallet)
                    .Include(customerObj => customerObj.Cart)
                        .ThenInclude(cartObj => cartObj.CartItems)
                    .Include(customerObj => customerObj.Orders)
                        .ThenInclude(orderObj => orderObj.OrderItems)
                    .FirstOrDefaultAsync(customer => customer.Id == customerId);

                if(customer != null)
                {
                    return CommonResponse<Customer>.SuccessResponse(
                        customer,
                        "Customer fetched successfully");
                }
                return CommonResponse<Customer>.FailureResponse(
                    new List<string> { $"Customer not found by customerId: {customerId}." },
                    "Customer not found");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving customer by id: {customerId}.", SharedReference.Enums.Enum.LogLevel.Error, "CustomerRepository.GetCustomerByIdAsync()", ex, null, null, new Dictionary<string, object> { { "CustomerId", customerId } });
                return CommonResponse<Customer>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving customer by id: {customerId}." },
                       "Failed to fetch customer");
            }
        }

        public async Task<CommonResponse<Customer>> GetCustomerByUserIdAsync( Guid userId )
        {
            try
            {
                var customer = await _dbContext.Customers
                    .Include(customerObj => customerObj.User)
                    .Include(customerObj => customerObj.Wallet)
                        .ThenInclude(walletObj => walletObj.Transactions)
                    .Include(customerObj => customerObj.Cart)
                    .Include(customerObj => customerObj.Orders)
                        .ThenInclude(orderObj => orderObj.OrderItems)
                            .ThenInclude(orderItemObj => orderItemObj.Product)
                    .FirstOrDefaultAsync(customer => customer.UserId == userId);

                if(customer != null)
                {
                    return CommonResponse<Customer>.SuccessResponse(
                        customer,
                        "Customer fetched successfully");
                }
                return CommonResponse<Customer>.FailureResponse(
                    new List<string> { $"Customer not found by userId: {userId}." },
                    "Customer not found");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving customer by user id.", SharedReference.Enums.Enum.LogLevel.Error, "CustomerRepository.GetCustomerByUserIdAsync()", ex, null, null, new Dictionary<string, object> { { "UserId", userId } });
                return CommonResponse<Customer>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving customer by user id: {userId}." },
                       "Failed to fetch customer");
            }
        }


        public async Task<CommonResponse<Customer>> CreateCustomerInDBAsync( Customer customer )
        {
            try
            {
                await _dbContext.Customers.AddAsync(customer);

                await _dbContext.SaveChangesAsync();

                return CommonResponse<Customer>.SuccessResponse(
                    customer,
                    "Customer created successfully");

            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while creating customer.", SharedReference.Enums.Enum.LogLevel.Error, "CustomerRepository.CreateCustomerInDBAsync()", ex, null, null, new Dictionary<string, object> { { "Customer", customer } });
                return CommonResponse<Customer>.FailureResponse(
                       new List<string> { $"Exception occurred while creating customer." },
                       "Failed to create customer");
            }
        }


        public async Task<CommonResponse<Customer>> MakeCustomerInactiveByCustomerIdAsync( Guid customerId )
        {
            try
            {
                var customer = await _dbContext.Customers.FindAsync(customerId);
                if(customer == null)
                {
                    return CommonResponse<Customer>.FailureResponse(
                    new List<string> { $"Customer not found by customer id: {customerId}." },
                    "Customer not found");
                }

                customer.IsActive = false;
                await _dbContext.SaveChangesAsync();

                return CommonResponse<Customer>.SuccessResponse(
                        customer,
                        "Customer deactivated successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while deactivating customer.", SharedReference.Enums.Enum.LogLevel.Error, "CustomerRepository.MakeCustomerInactiveByCustomerIdAsync()", ex, null, null, new Dictionary<string, object> { { "CustomerIDd", customerId } });
                return CommonResponse<Customer>.FailureResponse(
                       new List<string> { $"Exception occurred while deactivating customer." },
                       "Failed to deactivate customer");
            }
        }

        public async Task<CommonResponse<Customer>> MakeCustomerActiveByCustomerIdAsync( Guid customerId )
        {
            try
            {
                var customer = await _dbContext.Customers.FindAsync(customerId);
                if(customer == null)
                {
                    return CommonResponse<Customer>.FailureResponse(
                    new List<string> { $"Customer not found by customer id: {customerId}." },
                    "Customer not found");
                }

                customer.IsActive = true;
                await _dbContext.SaveChangesAsync();
                return CommonResponse<Customer>.SuccessResponse(
                        customer,
                        "Customer activated successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while activating customer.", SharedReference.Enums.Enum.LogLevel.Error, "CustomerRepository.MakeCustomerActiveByCustomerIdAsync()", ex, null, null, new Dictionary<string, object> { { "CustomerIDd", customerId } });
                return CommonResponse<Customer>.FailureResponse(
                       new List<string> { $"Exception occurred while activating customer." },
                       "Failed to activate customer");
            }
        }

    }
}
