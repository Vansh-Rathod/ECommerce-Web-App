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
    public class SellerRepository : ISellerRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public SellerRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Seller>> GetSellersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus, string filterByApproval, string filterByCity)
        {
            try
            {
                IQueryable<Seller> query = _dbContext.Sellers.AsQueryable()
                    .Include(sellrObj => sellrObj.User)
                    .Include(sellrObj => sellrObj.Products)
                    .Include(sellrObj => sellrObj.OrderItems);

            //    var query = _dbContext.Sellers
            //.Where(s => s.IsActive); // Only active products

                // Filter by search text
                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(sellerObj =>
                        sellerObj.StoreName.Contains(searchText));
                }

                // Filter by IsActive status
                if (!string.IsNullOrEmpty(filterByStatus) && filterByStatus.ToLower() != "all")
                {
                    if (bool.TryParse(filterByStatus, out bool isActive))
                    {
                        query = query.Where(seller => seller.IsActive == isActive);
                    }
                }

                // Filter by approval status
                if (!string.IsNullOrEmpty(filterByApproval) && filterByApproval.ToLower() != "all")
                {
                    if (bool.TryParse(filterByApproval, out bool isApproved))
                    {
                        query = query.Where(seller => seller.IsApproved == isApproved);
                    }
                }

                // Filter by city
                if (!string.IsNullOrWhiteSpace(filterByCity) && filterByCity.ToLower() != "all")
                {
                    string lowerCity = filterByCity.ToLower();
                    query = query.Where(seller => seller.City.ToLower().Contains(lowerCity));
                }

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";
                query = sortField?.ToLower() switch
                {
                    "fullname" => ascending ? query.OrderBy(s => s.User.FullName) : query.OrderByDescending(s => s.User.FullName),
                    "storename" => ascending ? query.OrderBy(s => s.StoreName) : query.OrderByDescending(s => s.StoreName),
                    "city" => ascending ? query.OrderBy(s => s.City) : query.OrderByDescending(s => s.City),
                    //"createdat" => ascending ? query.OrderBy(s => s.CreatedAt) : query.OrderByDescending(s => s.CreatedAt),
                    _ => query.OrderByDescending(s => s.StoreName) // default sort
                };

                // Pagination
                query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error occurred while fetching sellers: " + ex.Message);
                return new List<Seller>();
            }
        }

        public async Task<Seller> GetSellerByIdAsync(Guid sellerId)
        {
            try
            {
                return await _dbContext.Sellers
                    .Include(customerObj => customerObj.User)
                    .Include(customerObj => customerObj.Products)
                    .Include(customerObj => customerObj.OrderItems)
                    .FirstOrDefaultAsync(seller => seller.Id == sellerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving seller by id: " + ex.Message);
                return null;
            }
        }

        public async Task<Seller> GetSellerByUserIdAsync(Guid userId)
        {
            try
            {
                return await _dbContext.Sellers
                    .Include(customerObj => customerObj.User)
                    .Include(customerObj => customerObj.Products)
                    .Include(customerObj => customerObj.OrderItems)
                    .FirstOrDefaultAsync(seller => seller.UserId == userId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving seller by user id: " + ex.Message);
                return null;
            }
        }

        public async Task<bool> CreateSellerInDBAsync(Seller seller)
        {
            try
            {
                await _dbContext.Sellers.AddAsync(seller);

                var result = await _dbContext.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception Occurred: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> ApproveSellerBySellerIdAsync(Guid sellerId)
        {
            try
            {
                // Find the seller by sellerId
                var seller = await _dbContext.Sellers
                    .FirstOrDefaultAsync(s => s.Id == sellerId);

                if (seller == null || seller.IsApproved)
                {
                    // If seller doesn't exist or seller is already approved then, return false
                    return false;
                }

                // Approve the seller by setting IsApproved to true
                seller.IsApproved = true;
                seller.IsActive = true;  // Set the seller to active

                // Save changes to the database
                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while approving seller: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> RejectSellerBySellerIdAsync(Guid sellerId)
        {
            try
            {
                // Get the seller by sellerId, including related User and CustomerProfile
                var seller = await _dbContext.Sellers
                    .Include(s => s.User)
                        .ThenInclude(u => u.CustomerProfile)
                    .FirstOrDefaultAsync(s => s.Id == sellerId);

                if (seller == null || seller.IsApproved)
                {
                    // if seller not found or seller is already approved then, reutrn false
                    return false;
                }

                var user = seller.User;

                // Remove the seller profile
                _dbContext.Sellers.Remove(seller);

                // If the user does NOT have a customer profile, also remove the user
                if (user?.CustomerProfile == null)
                {
                    _dbContext.Users.Remove(user);
                }

                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while rejecting seller: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> MakeSellerInactiveBySellerIdAsync(Guid sellerId)
        {
            try
            {
                var seller = await _dbContext.Sellers.FindAsync(sellerId);
                if (seller == null || !seller.IsApproved)
                {
                    return false;
                }

                seller.IsActive = false;
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error making seller inactive: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> MakeSellerActiveBySellerIdAsync(Guid sellerId)
        {
            try
            {
                var seller = await _dbContext.Sellers.FindAsync(sellerId);
                if (seller == null || !seller.IsApproved)
                {
                    return false;
                }

                seller.IsActive = true;
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error making seller active: " + ex.Message);
                return false;
            }
        }
    }
}
