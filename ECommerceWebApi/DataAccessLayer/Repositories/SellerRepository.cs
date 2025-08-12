using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class SellerRepository : ISellerRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public SellerRepository( ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }

        public async Task<CommonResponse<PagedResult<Seller>>> GetSellersAsync( int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus, string filterByApproval, string filterByCity )
        {
            try
            {
                var query = _dbContext.Sellers.AsQueryable()
                    .Include(sellrObj => sellrObj.User)
                    .Include(sellrObj => sellrObj.Products)
                    .Include(sellrObj => sellrObj.OrderItems)
                    .AsQueryable();

                //    var query = _dbContext.Sellers
                //.Where(s => s.IsActive); // Only active products

                // Filter by search text
                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(sellerObj =>
                        sellerObj.StoreName.Contains(searchText));
                }

                // Filter by IsActive status
                if(!string.IsNullOrEmpty(filterByStatus) && filterByStatus.ToLower() != "all")
                {
                    switch(filterByStatus.ToLower())
                    {
                        case "active":
                            query = query.Where(seller => seller.IsActive == true);
                            break;
                        case "inactive":
                            query = query.Where(seller => seller.IsActive == false);
                            break;
                    }
                }

                // Filter by approval status
                if(!string.IsNullOrEmpty(filterByApproval) && filterByApproval.ToLower() != "all")
                {
                    switch(filterByApproval.ToLower())
                    {
                        case "approved":
                            query = query.Where(seller => seller.IsApproved == true);
                            break;
                        case "notapproved":
                        case "pending":
                            query = query.Where(seller => seller.IsApproved == false);
                            break;
                    }
                }

                // Filter by city
                if(!string.IsNullOrWhiteSpace(filterByCity) && filterByCity.ToLower() != "all")
                {
                    string lowerCity = filterByCity.ToLower();
                    query = query.Where(seller => seller.City.ToLower().Contains(lowerCity));
                }

                int totalRecords = await query.CountAsync();

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";
                query = sortField?.ToLower() switch
                {
                    "fullname" => ascending ? query.OrderBy(s => s.User.FullName) : query.OrderByDescending(s => s.User.FullName),
                    "storename" => ascending ? query.OrderBy(s => s.StoreName) : query.OrderByDescending(s => s.StoreName),
                    "city" => ascending ? query.OrderBy(s => s.City) : query.OrderByDescending(s => s.City),
                    "createdat" => ascending ? query.OrderBy(s => s.CreatedAt) : query.OrderByDescending(s => s.CreatedAt),
                    _ => query.OrderByDescending(s => s.StoreName) // default sort
                };

                // Pagination
                var pagedSellers = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

                var pagedResult = new PagedResult<Seller>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = pagedSellers,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<Seller>>.SuccessResponse(
                   pagedResult,
                   "Sellers fetched successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving sellers.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.GetSellersAsync()", ex, null, null, null);
                return CommonResponse<PagedResult<Seller>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving sellers." },
                  "Failed to fetch sellers."
              );
            }
        }

        public async Task<CommonResponse<Seller>> GetSellerByIdAsync( Guid sellerId )
        {
            try
            {
                var seller = await _dbContext.Sellers
                    .Include(customerObj => customerObj.User)
                    .Include(customerObj => customerObj.Products)
                    .Include(customerObj => customerObj.OrderItems)
                    .FirstOrDefaultAsync(seller => seller.Id == sellerId);

                if(seller != null)
                {
                    return CommonResponse<Seller>.SuccessResponse(
                        seller,
                        "Seller fetched successfully");
                }

                return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller not found by sellerId: {sellerId}." },
                    "Seller not found");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving seller by id: {sellerId}.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.GetSellerByIdAsync()", ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } });
                return CommonResponse<Seller>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving seller by id: {sellerId}." },
                       "Failed to fetch seller");
            }
        }

        public async Task<CommonResponse<Seller>> GetSellerByUserIdAsync( Guid userId )
        {
            try
            {
                var seller = await _dbContext.Sellers
                    .Include(customerObj => customerObj.User)
                    .Include(customerObj => customerObj.Products)
                    .Include(customerObj => customerObj.OrderItems)
                    .FirstOrDefaultAsync(seller => seller.UserId == userId);

                if(seller != null)
                {
                    return CommonResponse<Seller>.SuccessResponse(
                        seller,
                        "Seller fetched successfully");
                }

                return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller not found by user id: {userId}." },
                    "Seller not found");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving seller by user id: {userId}.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.GetSellerByUserIdAsync()", ex, null, null, new Dictionary<string, object> { { "UserId", userId } });
                return CommonResponse<Seller>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving seller by user id: {userId}." },
                       "Failed to fetch seller");
            }
        }

        public async Task<CommonResponse<Seller>> CreateSellerInDBAsync( Seller seller )
        {
            try
            {
                await _dbContext.Sellers.AddAsync(seller);

                await _dbContext.SaveChangesAsync();

                return CommonResponse<Seller>.SuccessResponse(
                    seller,
                    "Seller created successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while creating seller.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.CreateSellerInDBAsync()", ex, null, null, new Dictionary<string, object> { { "Seller", seller } });
                return CommonResponse<Seller>.FailureResponse(
                       new List<string> { $"Exception occurred while creating seller." },
                       "Failed to create seller");
            }
        }

        public async Task<CommonResponse<Seller>> ApproveSellerBySellerIdAsync( Guid sellerId )
        {
            try
            {
                // Find the seller by sellerId
                var seller = await _dbContext.Sellers
                    .Include(s => s.User)
                        .ThenInclude(u => u.CustomerProfile)
                    .FirstOrDefaultAsync(s => s.Id == sellerId);

                if(seller == null)
                {
                    return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller not found by seller id: {sellerId}." },
                    "Seller not found");
                }

                if(seller.IsApproved)
                {
                    return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller is already approved" },
                    "Seller is already approved");
                }

                // Approve the seller by setting IsApproved to true
                seller.IsApproved = true;
                seller.IsActive = true;  // Set the seller to active

                // Save changes to the database
                await _dbContext.SaveChangesAsync();

                return CommonResponse<Seller>.SuccessResponse(
                    seller,
                    "Seller approved successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while approving seller.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.ApproveSellerBySellerIdAsync()", ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } });
                return CommonResponse<Seller>.FailureResponse(
                       new List<string> { $"Exception occurred while approving seller." },
                       "Failed to approve seller");
            }
        }

        public async Task<CommonResponse<Seller>> RejectSellerBySellerIdAsync( Guid sellerId )
        {
            try
            {
                // Get the seller by sellerId, including related User and CustomerProfile
                var seller = await _dbContext.Sellers
                    .Include(s => s.User)
                        .ThenInclude(u => u.CustomerProfile)
                    .FirstOrDefaultAsync(s => s.Id == sellerId);

                if(seller == null)
                {
                    return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller not found by seller id: {sellerId}." },
                    "Seller not found");
                }

                // If Seller is pending for approval then only reject seller
                if(!seller.IsApproved)
                {
                    var user = seller.User;

                    // Remove the seller profile
                    _dbContext.Sellers.Remove(seller);

                    // If the user does NOT have a customer profile, also remove the user
                    if(user?.CustomerProfile == null)
                    {
                        _dbContext.Users.Remove(user);
                    }

                    await _dbContext.SaveChangesAsync();

                    return CommonResponse<Seller>.SuccessResponse(
                        seller,
                        "Seller rejected successfully");
                }
                return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller is already approved" },
                    "Seller is already approved");

            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while rejecting seller.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.RejectSellerBySellerIdAsync()", ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } } );
                return CommonResponse<Seller>.FailureResponse(
                       new List<string> { $"Exception occurred while rejecting seller." },
                       "Failed to reject seller");
            }
        }

        public async Task<CommonResponse<Seller>> MakeSellerInactiveBySellerIdAsync( Guid sellerId )
        {
            try
            {
                var seller = await _dbContext.Sellers.FindAsync(sellerId);

                if(seller == null)
                {
                    return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller not found by seller id: {sellerId}." },
                    "Seller not found");
                }

                if(!seller.IsApproved)
                {
                    return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller profile is not approved" },
                    "Seller profile is not approved");
                }

                seller.IsActive = false;
                await _dbContext.SaveChangesAsync();

                return CommonResponse<Seller>.SuccessResponse(
                    seller,
                    "Seller inactivated successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while inactivating seller.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.MakeSellerInactiveBySellerIdAsync()", ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } });
                return CommonResponse<Seller>.FailureResponse(
                       new List<string> { $"Exception occurred while inactivating seller." },
                       "Failed to inactivate seller");
            }
        }

        public async Task<CommonResponse<Seller>> MakeSellerActiveBySellerIdAsync( Guid sellerId )
        {
            try
            {
                var seller = await _dbContext.Sellers.FindAsync(sellerId);
                if(seller == null)
                {
                    return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller not found by seller id: {sellerId}." },
                    "Seller not found");
                }

                if(!seller.IsApproved)
                {
                    return CommonResponse<Seller>.FailureResponse(
                    new List<string> { $"Seller profile is not approved" },
                    "Seller profile is not approved");
                }

                seller.IsActive = true;
                await _dbContext.SaveChangesAsync();

                return CommonResponse<Seller>.SuccessResponse(
                    seller,
                    "Seller activated successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while activating seller.", SharedReference.Enums.Enum.LogLevel.Error, "SellerRepository.MakeSellerActiveBySellerIdAsync()", ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } });
                return CommonResponse<Seller>.FailureResponse(
                       new List<string> { $"Exception occurred while activating seller." },
                       "Failed to activate seller");
            }
        }
    }
}
