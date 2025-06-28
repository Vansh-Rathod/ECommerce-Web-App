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
        Task<Wallet> GetWalletByIdAsync(Guid walletId);

        Task<Wallet> GetWalletByCustomerIdAsync(Guid customerId);

        Task<List<WalletTransaction>> GetTransactionHistoryAsync(Guid walletId);

        Task<WalletTransaction> AddFundsAsync(Guid walletId, decimal amount, string Description);

        Task<WalletTransaction> PayAsync(Guid walletId, decimal amount, string Description);

        Task<WalletTransaction> RefundAmountToWalletAsync(Guid walletId, decimal amount, Guid orderId, string orderItemName);
    }
}
