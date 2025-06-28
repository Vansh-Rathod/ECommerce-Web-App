using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
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

        public WalletRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }



        public async Task<Wallet> GetWalletByIdAsync(Guid walletId)
        {
            try
            {
                return await _dbContext.Wallets
                    .Include(walletObj => walletObj.Customer)
                    .Include(walletObj => walletObj.Transactions)
                    .FirstOrDefaultAsync(wallet => wallet.Id == walletId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving wallet by id: " + ex.Message);
                return null;
            }
        }


        public async Task<Wallet> GetWalletByCustomerIdAsync(Guid customerId)
        {
            try
            {
                return await _dbContext.Wallets
                    .Include(walletObj => walletObj.Customer)
                    .Include(walletObj => walletObj.Transactions)
                    .FirstOrDefaultAsync(wallet => wallet.CustomerId == customerId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving wallet by customer id: " + ex.Message);
                return null;
            }
        }


        public async Task<List<WalletTransaction>> GetTransactionHistoryAsync(Guid walletId)
        {
            try
            {
                return await _dbContext.WalletTransactions
                .Where(walletTransactionObj => walletTransactionObj.WalletId == walletId)
                .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving wallet transactions by wallet id: " + ex.Message);
                return null;
            }
        }


        public async Task<WalletTransaction> AddFundsAsync(Guid walletId, decimal amount, string description)
        {
            try
            {
                var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(wallet => wallet.Id == walletId);
                if (wallet == null)
                {
                    return null;
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
                return transaction;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while adding funds in wallet: " + ex.Message);
                return null;
            }
        }


        public async Task<WalletTransaction> PayAsync(Guid walletId, decimal amount, string description)
        {
            try
            {
                var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(wallet => wallet.Id == walletId);
                if (wallet == null)
                {
                    return null;
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

                return transaction;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while paying funds from wallet: " + ex.Message);
                return null;
            }
        }


        public async Task<WalletTransaction> RefundAmountToWalletAsync(Guid walletId, decimal amount, Guid orderId, string orderItemName)
        {
            try
            {
                var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(wallet => wallet.Id == walletId);
                if (wallet == null)
                {
                    return null;
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

                return transaction;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while refunding funds to wallet: " + ex.Message);
                return null;
            }
        }
    }
}
