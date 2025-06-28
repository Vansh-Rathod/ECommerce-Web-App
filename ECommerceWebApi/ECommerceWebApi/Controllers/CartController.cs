using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedReference;
using SharedReference.CartDTOs;
using SharedReference.Entities;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;
        private readonly ICustomerRepository _customerRepository;
       

        public CartController(ICartRepository cartRepository, ICustomerRepository customerRepository)
        {
            _cartRepository = cartRepository;
            _customerRepository = customerRepository;
          
        }


        // GET ALL THE CART ITEMS
        [Authorize(Roles = "Customer")]
        [HttpGet]
        public async Task<IActionResult> GetCartItems()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customerResult = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customerResult == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }

            var cartResult = await _cartRepository.GetCartByCustomerIdAsync(customerResult.Id);
            if (!cartResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = cartResult.Message });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var response = new
            {
                CartId = cartResult.Data.Id,
                UpdatedAt = cartResult.Data.UpdatedAt,
                CustomerId = cartResult.Data.CustomerId,
                CustomerName = cartResult.Data.Customer?.User?.FullName,
                CustomerEmail = cartResult.Data.Customer?.User?.Email,

                CartItems = cartResult.Data.CartItems.Select(cartItemObj => new
                {
                    CartItemId = cartItemObj.Id,

                    ProductId = cartItemObj?.ProductId,
                    ProductName = cartItemObj?.Product?.Name,
                    ProductDescription = cartItemObj?.Product?.Description,
                    ProductPrice = cartItemObj?.Product?.Price,
                    ProductStockQuantity = cartItemObj?.Product?.StockQuantity,
                    ProductCreatedAt = cartItemObj?.Product?.CreatedAt,
                    ProductUpdatedAt = cartItemObj?.Product?.UpdatedAt,
                    ProductSellerId = cartItemObj?.Product?.SellerId,
                    ProductImageUrl = string.IsNullOrEmpty(cartItemObj?.Product?.ImageUrl)
            ? null
            : $"{baseUrl}{cartItemObj?.Product?.ImageUrl.Replace("\\", "/")}",

                    CartItemQuantity = cartItemObj?.Quantity,
                })
            };



            return Ok(new APIResponse { Status = 200, Message = "Cart items fetched successfully}", Data = response });
        }


        // ADD PRODUCT TO CART
        [Authorize(Roles = "Customer")]
        [HttpPost("add")]
        public async Task<IActionResult> AddProductToCart([FromBody] AddToCartDto addToCartDto)
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

            var cartResult = await _cartRepository.GetCartByCustomerIdAsync(customer.Id);
            if (!cartResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = cartResult.Message });
            }

            var cartItemResult = await _cartRepository.AddToCartAsync(cartResult.Data.Id, addToCartDto.ProductId, addToCartDto.Quantity);

            if (!cartItemResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = cartItemResult.Message });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var response = new
            {
                CartId = cartResult.Data.Id,
                UpdatedAt = cartResult.Data.UpdatedAt,
                CustomerId = cartResult.Data.CustomerId,
                CustomerName = cartResult.Data.Customer?.User?.FullName,
                CustomerEmail = cartResult.Data.Customer?.User?.Email,

                CartItem = new
                {
                    ProductId = cartItemResult.Data.ProductId,
                    ProductName = cartItemResult.Data?.Product?.Name,
                    ProductDescription = cartItemResult.Data?.Product?.Description,
                    ProductPrice = cartItemResult.Data?.Product?.Price,
                    ProductStockQuantity = cartItemResult.Data?.Product?.StockQuantity,
                    ProductCreatedAt = cartItemResult.Data?.Product?.CreatedAt,
                    ProductUpdatedAt = cartItemResult.Data?.Product?.UpdatedAt,
                    ProductSellerId = cartItemResult.Data?.Product?.SellerId,
                    ProductImageUrl = string.IsNullOrEmpty(cartItemResult.Data?.Product?.ImageUrl)
            ? null
            : $"{baseUrl}{cartItemResult.Data.Product.ImageUrl.Replace("\\", "/")}",

                    QuantityAdded = addToCartDto.Quantity,
                    QuantityInCart = cartItemResult.Data?.Quantity,
                }

            };

            return Ok(new APIResponse { Status = 200, Message = "Item added to cart successfully", Data = response });
        }



        // REMOVE PRODUCT FROM CART
        [Authorize(Roles = "Customer")]
        [HttpPut("remove")]
        public async Task<IActionResult> RemoveProductFromCart([FromBody] RemoveFromCartDto removeFromCartDto)
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

            var cartResult = await _cartRepository.GetCartByCustomerIdAsync(customer.Id);
            if (!cartResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Cart Not found" });
            }

            var cartItemResult = await _cartRepository.RemoveFromCartAsync(cartResult.Data.Id, removeFromCartDto.ProductId, removeFromCartDto.Quantity);

            if (!cartItemResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = cartItemResult.Message });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var response = new
            {
                CartId = cartResult.Data.Id,
                UpdatedAt = cartResult.Data.UpdatedAt,
                CustomerId = cartResult.Data.CustomerId,
                CustomerName = cartResult.Data.Customer?.User?.FullName,
                CustomerEmail = cartResult.Data.Customer?.User?.Email,

                CartItem = new
                {
                    ProductId = cartItemResult.Data.ProductId,
                    ProductName = cartItemResult.Data?.Product?.Name,
                    ProductDescription = cartItemResult.Data?.Product?.Description,
                    ProductPrice = cartItemResult.Data?.Product?.Price,
                    ProductStockQuantity = cartItemResult.Data?.Product?.StockQuantity,
                    ProductCreatedAt = cartItemResult.Data?.Product?.CreatedAt,
                    ProductUpdatedAt = cartItemResult.Data?.Product?.UpdatedAt,
                    ProductSellerId = cartItemResult.Data?.Product?.SellerId,
                    ProductImageUrl = string.IsNullOrEmpty(cartItemResult.Data?.Product?.ImageUrl)
            ? null
            : $"{baseUrl}{cartItemResult.Data.Product.ImageUrl.Replace("\\", "/")}",

                    QuantityRemoved = removeFromCartDto.Quantity,
                    QuantityInCart = cartItemResult.Data?.Quantity,
                }

            };



            return Ok(new APIResponse { Status = 200, Message = "Item removed from cart successfully", Data = response });
        }

        // CLEAR CART
        [Authorize(Roles = "Customer")]
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
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

            var cartResult = await _cartRepository.GetCartByCustomerIdAsync(customer.Id);
            if (!cartResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = cartResult.Message });
            }

            var clearCartResult = await _cartRepository.ClearCartAsync(cartResult.Data.Id);

            if (!clearCartResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = clearCartResult.Message });
            }

            return Ok(new APIResponse { Status = 200, Message = "Cart cleared successfully" });
        }


    }
}
