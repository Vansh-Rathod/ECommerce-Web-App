using MailKit.Search;
using SharedReference;
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
        Task<CommonResponse<PagedResult<Seller>>> GetSellersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus, string filterByApproval, string filterByCity);

        Task<CommonResponse<Seller>> GetSellerByIdAsync(Guid sellerId);

        Task<CommonResponse<Seller>> GetSellerByUserIdAsync(Guid userId);

        Task<CommonResponse<Seller>> CreateSellerInDBAsync(Seller seller);

        Task<CommonResponse<Seller>> ApproveSellerBySellerIdAsync(Guid sellerId);

        Task<CommonResponse<Seller>> RejectSellerBySellerIdAsync(Guid sellerId);

        Task<CommonResponse<Seller>> MakeSellerInactiveBySellerIdAsync(Guid sellerId);

        Task<CommonResponse<Seller>> MakeSellerActiveBySellerIdAsync(Guid sellerId);

    }
}
