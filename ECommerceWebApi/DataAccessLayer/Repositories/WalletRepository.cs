using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class WalletRepository : IWalletRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public WalletRepository(ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }



        public async Task<CommonResponse<Wallet>> GetWalletByIdAsync(Guid walletId)
        {
            try
            {
                var wallet = await _dbContext.Wallets
                    .Include(walletObj => walletObj.Customer)
                    .Include(walletObj => walletObj.Transactions)
                    .FirstOrDefaultAsync(wallet => wallet.Id == walletId);

                if(wallet != null)
                {
                    return CommonResponse<Wallet>.SuccessResponse(
                        wallet,
                        "Wallet fetched successfully");
                }
                return CommonResponse<Wallet>.FailureResponse(
                    new List<string> { $"Wallet not found by walletId: {walletId}." },
                    "Wallet not found");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving wallet by id: {walletId}.", SharedReference.Enums.Enum.LogLevel.Error, "WalletRepository.GetWalletByIdAsync()", ex, null, null, new Dictionary<string, object> { { "WalletId", walletId } });
                return CommonResponse<Wallet>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving wallet by id: {walletId}." },
                       "Failed to fetch wallet");
            }
        }


        public async Task<CommonResponse<Wallet>> GetWalletByCustomerIdAsync(Guid customerId)
        {
            try
            {
                var wallet = await _dbContext.Wallets
                    .Include(walletObj => walletObj.Customer)
                    .Include(walletObj => walletObj.Transactions)
                    .FirstOrDefaultAsync(wallet => wallet.CustomerId == customerId);

                if(wallet != null)
                {
                    return CommonResponse<Wallet>.SuccessResponse(
                        wallet,
                        "Wallet fetched successfully");
                }
                return CommonResponse<Wallet>.FailureResponse(
                    new List<string> { $"Wallet not found by customerId: {customerId}." },
                    "Wallet not found");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving wallet by customer id: {customerId}.", SharedReference.Enums.Enum.LogLevel.Error, "WalletRepository.GetWalletByCustomerIdAsync()", ex, null, null, new Dictionary<string, object> { { "CustomerId", customerId } });
                return CommonResponse<Wallet>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving wallet by customer id: {customerId}." },
                       "Failed to fetch wallet");
            }
        }


        public async Task<CommonResponse<PagedResult<WalletTransaction>>> GetTransactionHistoryAsync(Guid walletId, int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByAmount, string filterByTransactionType, DateTime? fromDate = null, DateTime? toDate = null )
        {
            try
            {
                var query = _dbContext.WalletTransactions
            .Where(t => t.WalletId == walletId)
            .AsQueryable();

                // Filter by searchText (if transaction has a description or reference text)
                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(t =>
                        t.Description.Contains(searchText));
                }

                // Filter by amount
                if(!string.IsNullOrWhiteSpace(filterByAmount) && filterByAmount.ToLower() != "all")
                {
                    switch(filterByAmount.ToLower())
                    {
                        case "below1000":
                            query = query.Where(t => t.Amount < 1000);
                            break;
                        case "1000to5000":
                            query = query.Where(t => t.Amount >= 1000 && t.Amount <= 5000);
                            break;
                        case "5000to10000":
                            query = query.Where(t => t.Amount >= 5000 && t.Amount <= 10000);
                            break;
                        case "above10000":
                            query = query.Where(t => t.Amount > 10000);
                            break;
                    }
                }

                // Filter by transaction type
                if(!string.IsNullOrWhiteSpace(filterByTransactionType) && filterByTransactionType.ToLower() != "all")
                {
                    query = query.Where(t => t.TransactionType.ToLower() == filterByTransactionType.ToLower());
                }

                // Filter by date range
                if(fromDate.HasValue)
                {
                    query = query.Where(t => t.TransactionDate >= fromDate.Value);
                }

                if(toDate.HasValue)
                {
                    query = query.Where(t => t.TransactionDate <= toDate.Value);
                }

                int totalRecords = await query.CountAsync();

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";

                query = sortField?.ToLower() switch
                {
                    "amount" => ascending ? query.OrderBy(t => t.Amount) : query.OrderByDescending(t => t.Amount),
                    "transactiondate" => ascending ? query.OrderBy(t => t.TransactionDate) : query.OrderByDescending(t => t.TransactionDate),
                    "transactiontype" => ascending ? query.OrderBy(t => t.TransactionType) : query.OrderByDescending(t => t.TransactionType),
                    _ => query.OrderByDescending(t => t.TransactionDate) // default sorting
                };

                // Pagination
                var pagedTransactions = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var pagedResult = new PagedResult<WalletTransaction>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = pagedTransactions,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<WalletTransaction>>.SuccessResponse(
                    pagedResult,
                    "Wallet transactions fetched successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving wallet transactions.", SharedReference.Enums.Enum.LogLevel.Error, "WalletRepository.GetTransactionHistoryAsync()", ex, null, null, new Dictionary<string, object> { { "WalletId", walletId } });
                return CommonResponse<PagedResult<WalletTransaction>>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving wallet transactions." },
                       "Failed to fetch wallet transactions");
            }
        }


        public async Task<CommonResponse<WalletTransaction>> AddFundsAsync(Guid walletId, decimal amount, string description)
        {
            try
            {
                var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(wallet => wallet.Id == walletId);
                if (wallet == null)
                {
                    return CommonResponse<WalletTransaction>.FailureResponse(
                   new List<string> { $"Wallet not found by walletId: {walletId}." },
                   "Wallet not found");
                }



                wallet.Balance += amount;
                wallet.LastUpdated = DateTime.UtcNow;

                var transaction = new WalletTransaction
                {
                    Id = Guid.NewGuid(),
                    WalletId = walletId,
                    Amount = amount,
                    TransactionType = "Deposit",
                    Description = description,
                    TransactionDate = DateTime.UtcNow
                };

                _dbContext.WalletTransactions.Add(transaction);
               
                await _dbContext.SaveChangesAsync();

                return CommonResponse<WalletTransaction>.SuccessResponse(
                        transaction,
                        "Funds added to wallet successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while adding funds to wallet.", SharedReference.Enums.Enum.LogLevel.Error, "WalletRepository.AddFundsAsync()", ex, null, null, new Dictionary<string, object> { { "WalletId", walletId }, { "Amount", amount }, { "Description", description } });
                return CommonResponse<WalletTransaction>.FailureResponse(
                       new List<string> { $"Exception occurred while adding funds to wallet." },
                       "Failed to add funds to wallet");
            }
        }


        public async Task<CommonResponse<WalletTransaction>> PayAsync(Guid walletId, decimal amount, string description)
        {
            try
            {
                var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(wallet => wallet.Id == walletId);
                if(wallet == null)
                {
                    return CommonResponse<WalletTransaction>.FailureResponse(
                   new List<string> { $"Wallet not found by walletId: {walletId}." },
                   "Wallet not found");
                }



                wallet.Balance -= amount;
                wallet.LastUpdated = DateTime.UtcNow;

                var transaction = new WalletTransaction
                {
                    Id = Guid.NewGuid(),
                    WalletId = walletId,
                    Amount = amount,
                    TransactionType = "Debit",
                    Description = description,
                    TransactionDate = DateTime.UtcNow
                };

                _dbContext.WalletTransactions.Add(transaction);

                await _dbContext.SaveChangesAsync();

                return CommonResponse<WalletTransaction>.SuccessResponse(
                        transaction,
                        "Funds payed from wallet successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while paying funds from wallet.", SharedReference.Enums.Enum.LogLevel.Error, "WalletRepository.PayAsync()", ex, null, null, new Dictionary<string, object> { { "WalletId", walletId }, { "Amount", amount }, { "Description", description } });
                return CommonResponse<WalletTransaction>.FailureResponse(
                       new List<string> { $"Exception occurred while paying funds from wallet." },
                       "Failed to pay funds from wallet");
            }
        }


        public async Task<CommonResponse<WalletTransaction>> RefundAmountToWalletAsync(Guid walletId, decimal amount, Guid orderId, string orderItemName)
        {
            try
            {
                var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(wallet => wallet.Id == walletId);
                if(wallet == null)
                {
                    return CommonResponse<WalletTransaction>.FailureResponse(
                   new List<string> { $"Wallet not found by walletId: {walletId}." },
                   "Wallet not found");
                }



                wallet.Balance += amount;
                wallet.LastUpdated = DateTime.UtcNow;

                var transaction = new WalletTransaction
                {
                    Id = Guid.NewGuid(),
                    WalletId = walletId,
                    Amount = amount,
                    TransactionType = "Credit",
                    Description = $"Refunded {amount} to wallet for Order Item: {orderItemName} with Order ID: {orderId}",
                    TransactionDate = DateTime.UtcNow
                };

                _dbContext.WalletTransactions.Add(transaction);

                await _dbContext.SaveChangesAsync();

                return CommonResponse<WalletTransaction>.SuccessResponse(
                        transaction,
                        "Funds refunded to wallet successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while refunding funds to wallet.", SharedReference.Enums.Enum.LogLevel.Error, "WalletRepository.RefundAmountToWalletAsync()", ex, null, null, new Dictionary<string, object> { { "WalletId", walletId }, { "Amount", amount }, { "OrderId", orderId }, { "OrderItemName", orderItemName } });
                return CommonResponse<WalletTransaction>.FailureResponse(
                       new List<string> { $"Exception occurred while refunding funds to wallet." },
                       "Failed to refund funds to wallet");
            }
        }
    }
}
