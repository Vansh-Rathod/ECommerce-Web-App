using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedReference;
using SharedReference.WalletDTOs;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WalletController : ControllerBase
    {
        private readonly IWalletRepository _walletRepository;
        private readonly ICustomerRepository _customerRepository;

        public WalletController(IWalletRepository walletRepository, ICustomerRepository customerRepository)
        {
            _walletRepository = walletRepository;
            _customerRepository = customerRepository;
        }

        // GET WALLET
        [Authorize(Roles = "Customer")]
        [HttpGet]
        public async Task<IActionResult> GetWallet()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customer = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer for Wallet Not found" });
            }

            var wallet = await _walletRepository.GetWalletByCustomerIdAsync(customer.Id);
            if (wallet == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Wallet Not found by Customer" });
            }

            var response = new
            {
                WalletId = wallet.Id,
                Balance = wallet.Balance,
                LastUpdated = wallet.LastUpdated,

                CustomerId = wallet.CustomerId,
                CustomerName = wallet.Customer.User.FullName,
                CustomerEmail = wallet.Customer.User.Email,

                WalletTransactions = wallet.Transactions.Select(walletTransactionObj => new
                {
                    TransactionId = walletTransactionObj.Id,
                    TransactionAmount = walletTransactionObj.Amount,
                    TransactionType = walletTransactionObj.TransactionType,
                    TransactionDescription = walletTransactionObj.Description,
                    TransactionDate = walletTransactionObj.TransactionDate
                })
            };

            //var history = await _walletRepository.GetTransactionHistoryAsync(userGuid);
            return Ok(new APIResponse { Status = 200, Message = "Transaction history retrieved successfully", Data = response });
        }


        // GET TRANSACTIONS FROM WALLET
        [Authorize(Roles = "Customer")]
        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactionHistory()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customer = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer for Wallet Not found" });
            }

            var wallet = await _walletRepository.GetWalletByCustomerIdAsync(customer.Id);
            if (wallet == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Wallet Not found by Customer" });
            }

            var response = new
            {
                WalletId = wallet.Id,
                Balance = wallet.Balance,
                LastUpdated = wallet.LastUpdated,

                CustomerId = wallet.CustomerId,
                CustomerName = wallet.Customer.User.FullName,
                CustomerEmail = wallet.Customer.User.Email,

                WalletTransactions = wallet.Transactions.Select(walletTransactionObj => new
                {
                    TransactionId = walletTransactionObj.Id,
                    TransactionAmount = walletTransactionObj.Amount,
                    TransactionType = walletTransactionObj.TransactionType,
                    TransactionDescription = walletTransactionObj.Description,
                    TransactionDate = walletTransactionObj.TransactionDate
                })
            };

            //var history = await _walletRepository.GetTransactionHistoryAsync(userGuid);
            return Ok(new APIResponse { Status = 200, Message = "Transaction history retrieved successfully", Data = response });
        }

        // ADD FUNDS TO WALLET
        [Authorize(Roles = "Customer")]
        [HttpPost("add-funds")]
        public async Task<IActionResult> AddFunds([FromBody] AddFundsDto addFundsDto)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customer = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer for Wallet Not found" });
            }

            var wallet = await _walletRepository.GetWalletByCustomerIdAsync(customer.Id);
            if (wallet == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Wallet Not found by Customer" });
            }

            var walletTransaction = await _walletRepository.AddFundsAsync(wallet.Id, addFundsDto.Amount, addFundsDto.Description);

            if (walletTransaction == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to add funds" });
            }

            var response = new
            {
                WalletId = wallet.Id,
                Balance = wallet.Balance,
                LastUpdated = wallet.LastUpdated,

                CustomerId = wallet.CustomerId,
                CustomerName = wallet.Customer.User.FullName,
                CustomerEmail = wallet.Customer.User.Email,

                TransactionDetails =  new
                {
                    TransactionId = walletTransaction.Id,
                    TransactionAmount = walletTransaction.Amount,
                    TransactionType = walletTransaction.TransactionType,
                    TransactionDescription = walletTransaction.Description,
                    TransactionDate = walletTransaction.TransactionDate
                }
            };

            return Ok(new APIResponse { Status = 200, Message = "Funds added successfully", Data = response });
        }


        // PAY FUNDS FROM WALLET
        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] PayDto payDto)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customer = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer for Wallet Not found" });
            }

            var wallet = await _walletRepository.GetWalletByCustomerIdAsync(customer.Id);
            if (wallet == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Wallet Not found by Customer" });
            }

            var walletTransaction = await _walletRepository.PayAsync(wallet.Id, payDto.Amount, payDto.Description);

            if (walletTransaction == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Payment Unsuccessful" });
            }

            var response = new
            {
                WalletId = wallet.Id,
                Balance = wallet.Balance,
                LastUpdated = wallet.LastUpdated,

                CustomerId = wallet.CustomerId,
                CustomerName = wallet.Customer.User.FullName,
                CustomerEmail = wallet.Customer.User.Email,

                TransactionDetails = new
                {
                    TransactionId = walletTransaction.Id,
                    TransactionAmount = walletTransaction.Amount,
                    TransactionType = walletTransaction.TransactionType,
                    TransactionDescription = walletTransaction.Description,
                    TransactionDate = walletTransaction.TransactionDate
                }
            };

            return Ok(new APIResponse { Status = 200, Message = "Payment successful", Data = response });
        }
    }
}
