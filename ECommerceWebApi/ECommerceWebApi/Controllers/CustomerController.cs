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

            var customerResult = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (!customerResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }


            var response =  new
            {
                CustomerId = customerResult.Data.Id,
                UserId = customerResult.Data.UserId,
                IsActive = customerResult.Data.IsActive,
                CreatedAt = customerResult.Data.CreatedAt,

                Name = customerResult.Data.User?.FullName,
                Email = customerResult.Data.User?.Email,
                LastLogin = customerResult.Data.User?.LastLogin,

                Is2FAEnabled = customerResult.Data.User?.Is2FAEnabled,

                Wallet = new
                {
                    WalletId = customerResult.Data.Wallet?.Id,
                    Balance = customerResult.Data.Wallet?.Balance,
                    Transactions = customerResult?.Data.Wallet?.Transactions.Select(walletTransactionObj => new
                    {
                        TransactionId = walletTransactionObj.Id,
                        TransactionAmount = walletTransactionObj.Amount,
                        TransactionType = walletTransactionObj.TransactionType,
                        TransactionDescription = walletTransactionObj.Description,
                        TransactionDate = walletTransactionObj.TransactionDate,

                    })
                },

                Cart = new
                {
                    CartId = customerResult?.Data.Cart?.Id,
                    CartItems = customerResult?.Data.Cart?.CartItems?.Select(carItemObj => new
                    {
                        CartItemId = carItemObj?.Id,
                        ProductId = carItemObj?.ProductId,
                        Quantity = carItemObj?.Quantity,
                    }),
                },

                Orders = customerResult?.Data.Orders?.Select(orderObj => new
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

                IsSeller = customerResult?.Data.User?.SellerProfile?.IsApproved ?? false

            };

            return Ok(new APIResponse { Status = 200, Message = "Customer fetched successfully", Data = response });
        }


        // GET PAGINATED CUSTOMERS
        [Authorize(Roles = "Admin")]
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomersAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "fullname", [FromQuery] string sortOrder = "asc", [FromQuery] string filterByStatus = "all")
        {
            var result = await _customerRepository.GetCustomersAsync(pageNumber, pageSize, searchText, sortField, sortOrder, filterByStatus);
            if (!result.Success || !result.Data.Items.Any())
            {
                return Ok(new APIResponse { Status = 404, Message = result.Message });
            }

            var customers = result.Data.Items.Select(customerObj => new
            {
                CustomerId = customerObj.Id,
                UserId = customerObj.UserId,
                IsActive = customerObj.IsActive,
                CreatedAt = customerObj.CreatedAt,

                Name = customerObj.User?.FullName,
                Email = customerObj.User?.Email,
                LastLogin = customerObj.User?.LastLogin,

                Wallet = new
                {
                    WalletId = customerObj.Wallet?.Id,
                    Balance = customerObj.Wallet?.Balance,
                },

                Cart = new
                {
                    CartId = customerObj.Cart?.Id,
                    CartItems = customerObj?.Cart?.CartItems?.Select(carItemObj => new
                    {
                        CartItemId = carItemObj?.Id,
                        ProductId = carItemObj?.ProductId,
                        Quantity = carItemObj?.Quantity,
                    }),
                },

                Orders = customerObj?.Orders?.Select(orderObj => new
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

            var response = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCustomers = result.Data.TotalRecords,
                Customers = customers
            };

            return Ok(new APIResponse { Status = 200, Message = "Customers fetched successfully", Data = response });
        }

        
        // GET CUSTOMER BY CUSTOMER ID
        [Authorize(Roles = "Admin")]
        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCustomerById(Guid customerId)
        {
            var customerResult = await _customerRepository.GetCustomerByIdAsync(customerId);

            if (!customerResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }

            var response =  new
            {
                Id = customerResult.Data.Id,
                UserId = customerResult.Data.UserId,
                IsActive = customerResult.Data.IsActive,
                CreatedAt = customerResult.Data.CreatedAt,

                Name = customerResult.Data.User?.FullName,
                Email = customerResult.Data.User?.Email,
                LastLogin = customerResult.Data.User?.LastLogin,

                Wallet = new
                {
                    WalletId = customerResult.Data.Wallet?.Id,
                    Balance = customerResult.Data.Wallet?.Balance,
                },

                Cart = new
                {
                    CartId = customerResult.Data.Cart?.Id,
                    CartItems = customerResult.Data?.Cart?.CartItems?.Select(carItemObj => new
                    {
                        CartItemId = carItemObj?.Id,
                        ProductId = carItemObj?.ProductId,
                        Quantity = carItemObj?.Quantity,
                    }),
                },

                Orders = customerResult.Data?.Orders?.Select(orderObj => new
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

                IsSeller = customerResult.Data?.User?.SellerProfile?.IsApproved ?? false

            };

            return Ok(new APIResponse { Status = 200, Message = "Customer Fetched Successfully", Data = response });
        }

       
        // MAKE CUSTOMER INACTIVE BY CUSTOMER ID
        [Authorize(Roles = "Admin")]
        [HttpPut("inactive/{customerId}")]
        public async Task<IActionResult> MakeCustomerInactiveByCustomerId(Guid customerId)
        {
            var result = await _customerRepository.MakeCustomerInactiveByCustomerIdAsync(customerId);
            if (!result.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to deactivate customer" });
            }

            return Ok(new APIResponse { Status = 200, Message = "Customer deactivated successfully", Data = null });
        }

        // MAKE CUSTOMER ACTIVE BY CUSTOMER ID
        [Authorize(Roles = "Admin")]
        [HttpPut("active/{customerId}")]
        public async Task<IActionResult> MakeCustomerActiveByCustomerId(Guid customerId)
        {
            var result = await _customerRepository.MakeCustomerActiveByCustomerIdAsync(customerId);
            if (!result.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to activate customer" });
            }

            return Ok(new APIResponse { Status = 200, Message = "Customer activated successfully", Data = null });
        }
    }
}
