using MailKit.Search;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface ISellerRepository
    {
        Task<List<Seller>> GetSellersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus, string filterByApproval, string filterByCity);

        Task<Seller> GetSellerByIdAsync(Guid sellerId);

        Task<Seller> GetSellerByUserIdAsync(Guid userId);

        Task<bool> CreateSellerInDBAsync(Seller seller);

        Task<bool> ApproveSellerBySellerIdAsync(Guid sellerId);

        Task<bool> RejectSellerBySellerIdAsync(Guid sellerId);

        Task<bool> MakeSellerInactiveBySellerIdAsync(Guid sellerId);

        Task<bool> MakeSellerActiveBySellerIdAsync(Guid sellerId);

    }
}
