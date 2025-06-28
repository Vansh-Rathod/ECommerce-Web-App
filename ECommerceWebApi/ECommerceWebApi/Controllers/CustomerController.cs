using DataAccessLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedReference;
using SharedReference.Entities;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerController(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        // GET CUSTOMER PROFILE FROM THE TOKEN
        [Authorize(Roles = "Customer")]
        [HttpGet("profile")]
        public async Task<IActionResult> GetCustomerProfileAsync()
        {

            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customer = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }


            var response =  new
            {
                CustomerId = customer.Id,
                UserId = customer.UserId,
                IsActive = customer.IsActive,
                CreatedAt = customer.CreatedAt,

                CustomerName = customer.User?.FullName,
                CustomerEmail = customer.User?.Email,
                CustomerLastLogin = customer.User?.LastLogin,

                Is2FAEnabled = customer.User?.Is2FAEnabled,

                CustomerWallet = new
                {
                    WalletId = customer.Wallet?.Id,
                    Balance = customer.Wallet?.Balance,
                    Transactions = customer?.Wallet?.Transactions.Select(walletTransactionObj => new
                    {
                        TransactionId = walletTransactionObj.Id,
                        TransactionAmount = walletTransactionObj.Amount,
                        TransactionType = walletTransactionObj.TransactionType,
                        TransactionDescription = walletTransactionObj.Description,
                        TransactionDate = walletTransactionObj.TransactionDate,

                    })
                },

                CustomerCart = new
                {
                    CartId = customer?.Cart?.Id,
                    CartItems = customer?.Cart?.CartItems?.Select(carItemObj => new
                    {
                        CartItemId = carItemObj?.Id,
                        ProductId = carItemObj?.ProductId,
                        Quantity = carItemObj?.Quantity,
                    }),
                },

                CustomerOrders = customer?.Orders?.Select(orderObj => new
                {
                    OrderId = orderObj?.Id,
                    OrderDate = orderObj?.OrderDate,
                    EstimatedDeliveryTime = orderObj?.EstimatedDeliveryTime,
                    TotalAmount = orderObj?.TotalAmount,
                    OrderStatus = orderObj?.Status,
                    OrderItems = orderObj?.OrderItems.Select(orderItemObj => new
                    {
                        OrderItemId = orderItemObj?.Id,
                        ProductId = orderItemObj?.ProductId,
                        ProductName = orderItemObj?.Product.Name,
                        Quantity = orderItemObj?.Quantity,
                        PriceAtPurchase = orderItemObj?.PriceAtPurchase,
                        OrderItemStatus = orderItemObj?.Status,
                    })
                }),

                IsSeller = customer?.User?.SellerProfile?.IsApproved ?? false

            };

            return Ok(new APIResponse { Status = 200, Message = "Customer fetched successfully", Data = response });
        }


        // GET PAGINATED CUSTOMERS
        [Authorize(Roles = "Admin")]
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomersAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "fullname", [FromQuery] string sortOrder = "asc", [FromQuery] string filterByStatus = "all")
        {
            var customers = await _customerRepository.GetCustomersAsync(pageNumber, pageSize, searchText, sortField, sortOrder, filterByStatus);
            if (customers == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "No Customers Found" });
            }

            var response = customers.Select(customerObj => new
            {
                CustomerId = customerObj.Id,
                UserId = customerObj.UserId,
                IsActive = customerObj.IsActive,
                CreatedAt = customerObj.CreatedAt,

                CustomerName = customerObj.User?.FullName,
                CustomerEmail = customerObj.User?.Email,
                CustomerLastLogin = customerObj.User?.LastLogin,

                CustomerWallet = new
                {
                    WalletId = customerObj.Wallet?.Id,
                    Balance = customerObj.Wallet?.Balance,
                },

                CustomerCart = new
                {
                    CartId = customerObj.Cart?.Id,
                    CartItems = customerObj?.Cart?.CartItems?.Select(carItemObj => new
                    {
                        CartItemId = carItemObj?.Id,
                        ProductId = carItemObj?.ProductId,
                        Quantity = carItemObj?.Quantity,
                    }),
                },

                CustomerOrders = customerObj?.Orders?.Select(orderObj => new
                {
                    OrderId = orderObj?.Id,
                    OrderDate = orderObj?.OrderDate,
                    EstimatedDeliveryTime = orderObj?.EstimatedDeliveryTime,
                    TotalAmount = orderObj?.TotalAmount,
                    OrderStatus = orderObj?.Status,
                    OrderItems = orderObj?.OrderItems.Select(orderItemObj => new
                    {
                        OrderItemId = orderItemObj?.Id,
                        ProductId = orderItemObj?.ProductId,
                        Quantity = orderItemObj?.Quantity,
                        PriceAtPurchase = orderItemObj?.PriceAtPurchase,
                        OrderItemStatus = orderItemObj?.Status,
                    })
                }),

                IsSeller = customerObj?.User?.SellerProfile?.IsApproved ?? false

            });

            return Ok(new APIResponse { Status = 200, Message = "Customers fetched successfully", Data = response });
        }

        
        // GET CUSTOMER BY CUSTOMER ID
        [Authorize(Roles = "Admin")]
        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCustomerById(Guid customerId)
        {
            var customer = await _customerRepository.GetCustomerByIdAsync(customerId);

            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = $"No Customer Found by customerId: {customerId}" });
            }

            var response =  new
            {
                CustomerId = customer.Id,
                UserId = customer.UserId,
                IsActive = customer.IsActive,
                CreatedAt = customer.CreatedAt,

                CustomerName = customer.User?.FullName,
                CustomerEmail = customer.User?.Email,
                CustomerLastLogin = customer.User?.LastLogin,

                CustomerWallet = new
                {
                    WalletId = customer.Wallet?.Id,
                    Balance = customer.Wallet?.Balance,
                },

                CustomerCart = new
                {
                    CartId = customer.Cart?.Id,
                    CartItems = customer?.Cart?.CartItems?.Select(carItemObj => new
                    {
                        CartItemId = carItemObj?.Id,
                        ProductId = carItemObj?.ProductId,
                        Quantity = carItemObj?.Quantity,
                    }),
                },

                CustomerOrders = customer?.Orders?.Select(orderObj => new
                {
                    OrderId = orderObj?.Id,
                    OrderDate = orderObj?.OrderDate,
                    EstimatedDeliveryTime = orderObj?.EstimatedDeliveryTime,
                    TotalAmount = orderObj?.TotalAmount,
                    OrderStatus = orderObj?.Status,
                    OrderItems = orderObj?.OrderItems.Select(orderItemObj => new
                    {
                        OrderItemId = orderItemObj?.Id,
                        ProductId = orderItemObj?.ProductId,
                        Quantity = orderItemObj?.Quantity,
                        PriceAtPurchase = orderItemObj?.PriceAtPurchase,
                        OrderItemStatus = orderItemObj?.Status,
                    })
                }),

                IsSeller = customer?.User?.SellerProfile?.IsApproved ?? false

            };

            return Ok(new APIResponse { Status = 200, Message = "Customer Fetched Successfully", Data = response });
        }

       
        // MAKE CUSTOMER INACTIVE BY CUSTOMER ID
        [Authorize(Roles = "Admin")]
        [HttpPut("inactive/{customerId}")]
        public async Task<IActionResult> MakeCustomerInactiveByCustomerId(Guid customerId)
        {
            var result = await _customerRepository.MakeCustomerInactiveByCustomerIdAsync(customerId);
            if (!result)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to inactivate customer" });
            }

            return Ok(new APIResponse { Status = 200, Message = "Customer inactivated successfully", Data = null });
        }

        // MAKE CUSTOMER ACTIVE BY CUSTOMER ID
        [Authorize(Roles = "Admin")]
        [HttpPut("active/{customerId}")]
        public async Task<IActionResult> MakeCustomerActiveByCustomerId(Guid customerId)
        {
            var result = await _customerRepository.MakeCustomerActiveByCustomerIdAsync(customerId);
            if (!result)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to activate seller" });
            }

            return Ok(new APIResponse { Status = 200, Message = "Customer activated successfully", Data = null });
        }
    }
}
