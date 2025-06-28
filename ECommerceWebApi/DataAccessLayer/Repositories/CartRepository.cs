using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto.Engines;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public CartRepository(ApplicationDbContext dbContext, ILoggerRepository loggerRepository)
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }

        // GET CART BY CART ID
        public async Task<CommonResponse<Cart>> GetCartByIdAsync(Guid cartId)
        {
            try
            {
                var cart = await _dbContext.Carts
                    .Include(cartObj => cartObj.Customer)
                    .Include(cartObj => cartObj.CartItems)
                    .FirstOrDefaultAsync(cart => cart.Id == cartId);

                if (cart != null)
                {
                    return CommonResponse<Cart>.SuccessResponse(
                    cart,
                    "Cart fetched successfully");
                }

                return CommonResponse<Cart>.FailureResponse(
                    new List<string> { $"Cart not found by Id: {cartId}." },
                    "Cart not found"
                );
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Failed to fetch Cart by Id: {cartId}.", SharedReference.Enums.Enum.LogLevel.Error, "CartRepository.GetCartByIdAsync()", ex, null, null, null);
                return CommonResponse<Cart>.FailureResponse(
                    new List<string> { $"Excpetion occurred while fetching Cart by Cart Id: {cartId}." },
                    "Failed to fetch Cart"
                );
            }
        }


        // GET CART BY CUSTOMER ID
        public async Task<CommonResponse<Cart>> GetCartByCustomerIdAsync(Guid customerId)
        {
            try
            {
                var cart = await _dbContext.Carts
                    .Include(cartObj => cartObj.Customer)
                        .ThenInclude(cust => cust.User)
                    .Include(cartObj => cartObj.CartItems)
                        .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(cart => cart.CustomerId == customerId);

                if (cart != null)
                {
                    return CommonResponse<Cart>.SuccessResponse(
                    cart,
                    "Cart fetched successfully");
                }

                return CommonResponse<Cart>.FailureResponse(
                    new List<string> { $"Cart not found by Customer Id: {customerId}." },
                    "Cart not found"
                );
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Failed to fetch Cart by Customer Id: {customerId}.", SharedReference.Enums.Enum.LogLevel.Error, "CartRepository.GetCartByCustomerIdAsync()", ex, null, null, null);
                return CommonResponse<Cart>.FailureResponse(
                    new List<string> { $"Exception occurred while fetching Cart by Customer Id: {customerId}." },
                    "Failed to fetch Cart"
                );
            }
        }


        // ADD PRODUCT TO CART
        public async Task<CommonResponse<CartItem>> AddToCartAsync(Guid cartId, Guid productId, int quantity)
        {
            try
            {
                var existingProduct = await _dbContext.Products.FirstOrDefaultAsync(productObj => productObj.Id == productId);

                if (existingProduct == null)
                {
                    return CommonResponse<CartItem>.FailureResponse(
                    new List<string> { $"Product not found by Product Id: {productId}." },
                    "Product not found");
                }

                var existingCart = await _dbContext.Carts.FirstOrDefaultAsync(cartObj => cartObj.Id == cartId);

                if (existingCart == null)
                {
                    return CommonResponse<CartItem>.FailureResponse(
                    new List<string> { $"Cart not found by Cart Id: {cartId}." },
                    "Cart not found");
                }

                var existingCartItem = await _dbContext.CartItems
                        .Include(cartItemObj => cartItemObj.Product)
                        .FirstOrDefaultAsync(cartItemObj => cartItemObj.CartId == cartId && cartItemObj.ProductId == productId);

                if (existingCartItem != null)
                {
                    existingCartItem.Quantity += quantity;

                    existingCart.UpdatedAt = DateTime.UtcNow;

                    await _dbContext.SaveChangesAsync();

                    return CommonResponse<CartItem>.SuccessResponse(
                    existingCartItem,
                    "Product added to cart successfully");
                }
                else
                {
                    var newItem = new CartItem
                    {
                        Id = Guid.NewGuid(),
                        CartId = cartId,
                        ProductId = productId,
                        Quantity = quantity,
                    };
                    _dbContext.CartItems.Add(newItem);

                    existingCart.UpdatedAt = DateTime.UtcNow;

                    await _dbContext.SaveChangesAsync();

                    // Reload newItem with Product included
                    var newCartItem = await _dbContext.CartItems
                        .Include(ci => ci.Product)
                        .FirstOrDefaultAsync(ci => ci.Id == newItem.Id);

                    return CommonResponse<CartItem>.SuccessResponse(
                    newCartItem,
                    "Product added to cart successfully");
                }

            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Failed to add product to cart.", SharedReference.Enums.Enum.LogLevel.Error, "CartRepository.AddToCartAsync()", ex, null, null, new Dictionary<string, object> { { "CartId", cartId }, { "ProductId", productId }, { "Quantity", quantity } });
                return CommonResponse<CartItem>.FailureResponse(
                    new List<string> { $"Exception occurred while adding product to cart." },
                    "Failed to add product in cart."
                );
            }
        }


        // REMOVE PRODUCT FROM CART
        public async Task<CommonResponse<CartItem>> RemoveFromCartAsync(Guid cartId, Guid productId, int quantity)
        {
            try
            {
                var existingProduct = await _dbContext.Products.FirstOrDefaultAsync(productObj => productObj.Id == productId);

                if (existingProduct == null)
                {
                    return CommonResponse<CartItem>.FailureResponse(
                    new List<string> { $"Product not found by Product Id: {productId}." },
                    "Product not found");
                }

                var existingCart = await _dbContext.Carts.FirstOrDefaultAsync(cartObj => cartObj.Id == cartId);

                if (existingCart == null)
                {
                    return CommonResponse<CartItem>.FailureResponse(
                    new List<string> { $"Cart not found by Cart Id: {cartId}." },
                    "Cart not found");
                }

                var existingCartItem = await _dbContext.CartItems
                    .Include(cartItemObj => cartItemObj.Product)
                .FirstOrDefaultAsync(cartItemObj => cartItemObj.CartId == cartId && cartItemObj.ProductId == productId);

                if (existingCartItem == null)
                {
                    return CommonResponse<CartItem>.FailureResponse(
                    new List<string> { $"Cart Item not found by Product Id: {productId}." },
                    "Cart item not found");
                }

                // if the item is totaly removed from the cart
                if (existingCartItem.Quantity == quantity)
                {
                    _dbContext.CartItems.Remove(existingCartItem);
                    existingCart.UpdatedAt = DateTime.UtcNow;
                    await _dbContext.SaveChangesAsync();

                    return CommonResponse<CartItem>.SuccessResponse(
                    existingCartItem,
                    "Cart Item removed successfully");
                }
                else
                {
                    if (existingCartItem.Quantity < quantity)
                    {
                        return CommonResponse<CartItem>.FailureResponse(
                            new List<string> { $"Cart does not have {quantity} of Cart Item." },
                            "Quantity exceded to remove from cart"
                        );
                    }
                    // if some valid quantity is removed from the cart
                    existingCartItem.Quantity -= quantity;

                    existingCart.UpdatedAt = DateTime.UtcNow;
                    await _dbContext.SaveChangesAsync();

                    return CommonResponse<CartItem>.SuccessResponse(
                    existingCartItem,
                    "Cart Item removed successfully");
                }
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Failed to remove product from cart.", SharedReference.Enums.Enum.LogLevel.Error, "CartRepository.RemoveFromCartAsync()", ex, null, null, new Dictionary<string, object> { { "CartId", cartId }, { "ProductId", productId }, { "Quantity", quantity } });
                return CommonResponse<CartItem>.FailureResponse(
                    new List<string> { $"Exception occurred while removing items from cart." },
                    "Failed to remove product from cart."
                );
            }
        }


        // CLEAR CART
        public async Task<CommonResponse<Cart>> ClearCartAsync(Guid cartId)
        {
            try
            {
                var existingCart = await _dbContext.Carts.FirstOrDefaultAsync(cartObj => cartObj.Id == cartId);

                if (existingCart == null)
                {
                    return CommonResponse<Cart>.FailureResponse(
                    new List<string> { $"Cart not found by Cart Id: {cartId}." },
                    "Cart not found");
                }

                var cartItems = _dbContext.CartItems.Where(item => item.CartId == cartId);

                if(cartItems == null)
                {
                    return CommonResponse<Cart>.FailureResponse(
                    new List<string> { $"Cart does not have Cart Items." },
                    "Cart is already empty");
                }

                _dbContext.CartItems.RemoveRange(cartItems);

                existingCart.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                return CommonResponse<Cart>.SuccessResponse(
                   existingCart,
                   "Cart cleared successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while clearing cart: " + ex.Message);

                await _loggerRepository.LogAsync($"Exception occurred while clearing cart.", SharedReference.Enums.Enum.LogLevel.Error, "CartRepository.ClearCartAsync()", ex, null, null, new Dictionary<string, object> { { "CartId", cartId } });
                return CommonResponse<Cart>.FailureResponse(
                    new List<string> { $"Exception occurred whie remloving items from cart." },
                    "Failed to clear cart."
                );
            }
        }
    }
}
