using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IWalletRepository
    {
        Task<CommonResponse<Wallet>> GetWalletByIdAsync(Guid walletId);

        Task<CommonResponse<Wallet>> GetWalletByCustomerIdAsync(Guid customerId);

        Task<CommonResponse<PagedResult<WalletTransaction>>> GetTransactionHistoryAsync(Guid walletId);

        Task<CommonResponse<WalletTransaction>> AddFundsAsync(Guid walletId, decimal amount, string Description);

        Task<CommonResponse<WalletTransaction>> PayAsync(Guid walletId, decimal amount, string Description);

        Task<CommonResponse<WalletTransaction>> RefundAmountToWalletAsync(Guid walletId, decimal amount, Guid orderId, string orderItemName);
    }
}
