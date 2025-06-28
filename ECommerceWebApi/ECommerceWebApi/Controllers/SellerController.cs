using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedReference;
using SharedReference.Entities;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellerController : ControllerBase
    {
        private readonly ISellerRepository _sellerRepository;

        public SellerController(ISellerRepository sellerRepository)
        {
            _sellerRepository = sellerRepository;
        }

        // GET SELLER PROFILE FROM THE TOKEN
        [Authorize(Roles = "Seller")]
        [HttpGet("profile")]
        public async Task<IActionResult> GetSellerProfileAsync()
        {

            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var seller = await _sellerRepository.GetSellerByUserIdAsync(userGuid);
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Seller Not found" });
            }


            var response = new
            {
                SellerId = seller.Id,
                UserId = seller.UserId,
                StoreName = seller.StoreName,
                City = seller.City,
                IsApproved = seller.IsApproved,
                IsActive = seller.IsActive,
                CreatedAt = seller.CreatedAt,

                SellerName = seller.User.FullName,
                SellerEmail = seller.User.Email,
                SellerLastLogin = seller.User.LastLogin,

                Is2FAEnabled = seller.User.Is2FAEnabled,

                SellerProducts = seller.Products?.Select(productObj => new
                {
                    productObj.Id,
                    productObj.Name,
                    productObj.Description,
                    productObj.Price,
                    productObj.StockQuantity,
                    productObj.IsActive
                }),

                SellerOrders = seller.OrderItems?.Select(orderItemObj => new
                {
                    orderItemObj.Id,
                    orderItemObj.OrderId,
                    orderItemObj.ProductId,
                    orderItemObj.Quantity,
                    orderItemObj.PriceAtPurchase,
                    orderItemObj.Status

                })
            };

            return Ok(new APIResponse { Status = 200, Message = "Seller fetched successfully", Data = response });
        }


        // GET ALL SELLERS
        [Authorize(Roles = "Admin")]
        [HttpGet("sellers")]
        public async Task<IActionResult> GetSellersAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "fullname", [FromQuery] string sortOrder = "asc", [FromQuery] string filterByStatus = "all", [FromQuery] string filterByApproval = "all", [FromQuery] string filterByCity = "all")
        {
            var sellers = await _sellerRepository.GetSellersAsync(pageNumber, pageSize, searchText, sortField, sortOrder, filterByStatus, filterByApproval, filterByCity);
            if (sellers == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "No Sellers Found" });
            }

            var response = sellers.Select(sellerObj => new
            {
                SellerId = sellerObj.Id,
                UserId = sellerObj.UserId,
                StoreName = sellerObj.StoreName,
                City = sellerObj.City,
                IsApproved = sellerObj.IsApproved,
                IsActive = sellerObj.IsActive,
                CreatedAt = sellerObj.CreatedAt,

                SellerName = sellerObj.User?.FullName,
                SellerEmail = sellerObj.User?.Email,
                SellerLastLogin = sellerObj.User?.LastLogin,

                SellerProducts = sellerObj.Products?.Select(productObj => new
                {
                    productObj.Id,
                    productObj.Name,
                    productObj.Description,
                    productObj.Price,
                    productObj.StockQuantity,
                    productObj.IsActive
                }),

                //SellerOrders = sellerObj.OrderItems?.Select(orderItemObj => new
                //{
                //    orderItemObj.Id,
                //    orderItemObj.OrderId,
                //    orderItemObj.ProductId,
                //    orderItemObj.Quantity,
                //    orderItemObj.PriceAtPurchase,
                //    orderItemObj.Status

                //}),

                SellerOrders = sellerObj.OrderItems?
    .GroupBy(orderItem => orderItem.OrderId)
    .Select(group => new
    {
        OrderId = group.Key,
        OrderItems = group.Select(orderItemObj => new
        {
            orderItemObj.Id,
            orderItemObj.ProductId,
            orderItemObj.Quantity,
            orderItemObj.PriceAtPurchase,
            orderItemObj.Status
        }).ToList()
    }),

                IsCustomer = sellerObj?.User?.CustomerProfile?.IsActive ?? false

            });

            return Ok(new APIResponse { Status = 200, Message = "Sellers fetched successfully", Data = response });
        }


        // GET SELLER BY ID
        [Authorize(Roles = "Admin")]
        [HttpGet("{sellerId}")]
        public async Task<IActionResult> GetSellerById(Guid sellerId)
        {
            var seller = await _sellerRepository.GetSellerByIdAsync(sellerId);

            if (seller == null)
            {
                return Ok(new APIResponse { Status = 404, Message = $"No Seller Found by sellerId: {sellerId}" });
            }

            var response = new
            {
                SellerId = seller.Id,
                UserId = seller.UserId,
                StoreName = seller.StoreName,
                City = seller.City,
                IsApproved = seller.IsApproved,
                IsActive = seller.IsActive,
                CreatedAt = seller.CreatedAt,

                SellerName = seller.User.FullName,
                SellerEmail = seller.User.Email,
                SellerLastLogin = seller.User.LastLogin,

                SellerProducts = seller.Products?.Select(productObj => new
                {
                    productObj.Id,
                    productObj.Name,
                    productObj.Description,
                    productObj.Price,
                    productObj.StockQuantity,
                    productObj.IsActive
                }),

                SellerOrders = seller.OrderItems?.Select(orderItemObj => new
                {
                    orderItemObj.Id,
                    orderItemObj.OrderId,
                    orderItemObj.ProductId,
                    orderItemObj.Quantity,
                    orderItemObj.PriceAtPurchase,
                    orderItemObj.Status

                })
            };



            return Ok(new APIResponse { Status = 200, Message = "Seller Fetched Successfully", Data = response });
        }


        // APPROVE SELLER
        [Authorize(Roles = "Admin")]
        [HttpPost("approve-seller/{sellerId}")]
        public async Task<IActionResult> ApproveSeller(Guid sellerId)
        {
            var result = await _sellerRepository.ApproveSellerBySellerIdAsync(sellerId);
            if (!result)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to approve seller" });
            }
            return Ok(new APIResponse { Status = 200, Message = "Seller approved successfully", Data = null });
        }


        // REJECT SELLER
        [Authorize(Roles = "Admin")]
        [HttpDelete("reject-seller/{sellerId}")]
        public async Task<IActionResult> RejectSeller(Guid sellerId)
        {
            var result = await _sellerRepository.RejectSellerBySellerIdAsync(sellerId);
            if (!result)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to reject seller" });
            }

            return Ok(new APIResponse { Status = 200, Message = "Seller rejected successfully", Data = null });
        }


        // MAKE SELLER INACTIVE
        [Authorize(Roles = "Admin")]
        [HttpPut("inactive/{sellerId}")]
        public async Task<IActionResult> MakeSellerInactiveBySellerId(Guid sellerId)
        {
            var result = await _sellerRepository.MakeSellerInactiveBySellerIdAsync(sellerId);
            if (!result)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to inactivate seller" });
            }

            return Ok(new APIResponse { Status = 200, Message = "Seller inactivated successfully", Data = null });
        }


        // MAKE SELLER ACTIVE
        [Authorize(Roles = "Admin")]
        [HttpPut("active/{sellerId}")]
        public async Task<IActionResult> MakeSellerActiveBySellerId(Guid sellerId)
        {
            var result = await _sellerRepository.MakeSellerActiveBySellerIdAsync(sellerId);
            if (!result)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to activate seller" });
            }

            return Ok(new APIResponse { Status = 200, Message = "Seller activated successfully", Data = null });
        }
    }
}
