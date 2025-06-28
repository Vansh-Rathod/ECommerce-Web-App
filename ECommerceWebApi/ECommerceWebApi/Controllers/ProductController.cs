using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedReference;
using SharedReference.Entities;
using SharedReference.ProductDTOs;
using System.Reflection.Metadata.Ecma335;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly IUserRepository _userRepository;
        private readonly ISellerRepository _sellerRepository;

        public ProductController(IProductRepository productRepository, IUserRepository userRepository, ISellerRepository sellerRepository)
        {
            _productRepository = productRepository;
            _userRepository = userRepository;
            _sellerRepository = sellerRepository;
        }


        // GET PRODUCTS
        //[Authorize(Roles = "Seller")]
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "name", [FromQuery] string sortOrder = "asc", [FromQuery] string filterByPrice = "")
        {
            var products = await _productRepository.GetProductsAsync(pageNumber, pageSize, searchText, sortField, sortOrder, filterByPrice);

            if (products == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "No Products Found" });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var response = products.Select(productObj => new
            {
                ProductId = productObj.Id,
                Name = productObj.Name,
                Description = productObj.Description,
                Price = productObj.Price,
                StockQuantity = productObj.StockQuantity,
                IsActive = productObj.IsActive,
                CreatedAt = productObj.CreatedAt,
                UpdatedAt = productObj.UpdatedAt,
                SellerId = productObj.SellerId,
                ImageUrl = string.IsNullOrEmpty(productObj.ImageUrl)
            ? null
            : $"{baseUrl}{productObj.ImageUrl.Replace("\\", "/")}"  // Normalize for URLs
            });



            return Ok(new APIResponse { Status = 200, Message = "Products Fetched Successfully", Data = response });
        }

        // GET SELLER PRODUCTS
        [Authorize(Roles = "Seller")]
        [HttpGet("seller-products")]
        public async Task<IActionResult> GetSellerProducts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "name", [FromQuery] string sortOrder = "asc", [FromQuery] string filterByPrice = "")
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

            var products = await _productRepository.GetSellerProductsAsync(seller.Id, pageNumber, pageSize, searchText, sortField, sortOrder, filterByPrice);

            if (products == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "No products found for seller" });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var response = products.Select(productObj => new
            {
                ProductId = productObj.Id,
                Name = productObj.Name,
                Description = productObj.Description,
                Price = productObj.Price,
                StockQuantity = productObj.StockQuantity,
                IsActive = productObj.IsActive,
                CreatedAt = productObj.CreatedAt,
                UpdatedAt = productObj.UpdatedAt,
                SellerId = productObj.SellerId,
                ImageUrl = string.IsNullOrEmpty(productObj.ImageUrl)
            ? null
            : $"{baseUrl}{productObj.ImageUrl.Replace("\\", "/")}"  // Normalize for URLs
            });



            return Ok(new APIResponse { Status = 200, Message = "Products for seller fetched successfully", Data = response });
        }


        // GET PRODUCT BY ID
        //[Authorize(Roles = "Seller")]
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetProductById(Guid productId)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);

            if (product == null)
            {
                return Ok(new APIResponse { Status = 404, Message = $"No Product Found by productId: {productId}" });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var response = new
            {
                ProductId = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                SellerId = product.SellerId,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                ImageUrl = string.IsNullOrEmpty(product.ImageUrl)
            ? null
            : $"{baseUrl}{product.ImageUrl.Replace("\\", "/")}"  // Normalize for URLs
            };



            return Ok(new APIResponse { Status = 200, Message = "Product Fetched Successfully", Data = response });
        }


        // CREATE PRODUCT
        [Authorize(Roles = "Seller")]
        [HttpPost("products")]
        public async Task<IActionResult> AddPorduct([FromForm] AddProductDto addProductDto)
        {
            // validate fields from addProductDto, then call create product function 

            if (addProductDto == null || string.IsNullOrWhiteSpace(addProductDto.Name) || addProductDto.Price <= 0)
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid product data." });
            }

            if (addProductDto.Image == null || addProductDto.Image.Length == 0)
            {
                return Ok(new APIResponse { Status = 400, Message = "Product image is required." });
            }

            // Get current user ID from JWT token
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new APIResponse { Status = 401, Message = "User identity not found in token." });
            }

            // Parse userId to Guid
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid user ID format." });
            }

            // You may fetch the seller profile ID using the user ID if needed
            var userResult = await _userRepository.GetUserByIdAsync(userGuid);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = userResult.Message });
            }

            var seller = userResult.Data?.SellerProfile;
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }


            // Handle image upload
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{DateTime.UtcNow.Ticks}_{addProductDto.Image.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await addProductDto.Image.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/products/{uniqueFileName}"; // relative URL for frontend


            // Create product entity
            var product = new Product
            {
                Name = addProductDto.Name,
                Description = addProductDto.Description,
                Price = addProductDto.Price,
                StockQuantity = addProductDto.StockQuantity,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                SellerId = seller.Id,
                ImageUrl = imageUrl
            };

            var isProductCreated = await _productRepository.CreateProductAsync(product);

            if (!isProductCreated)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to create product" });
            }

            var response = new
            {
                ProductId = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                SellerId = product.SellerId,
                ImageUrl = imageUrl
            };

            return Ok(new APIResponse { Status = 200, Message = "Products Created Successfully", Data = response });
        }


        // UPDATE PRODUCT
        [Authorize(Roles = "Seller")]
        [HttpPut("{productId}")]
        public async Task<IActionResult> UpdateProduct(Guid productId, [FromForm] UpdateProductDto updateProductDto)
        {
            // Validate the input data
            if (updateProductDto == null || string.IsNullOrWhiteSpace(updateProductDto.Name) || updateProductDto.Price <= 0)
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid product data." });
            }

            // Get the current user ID from the JWT token
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new APIResponse { Status = 401, Message = "User identity not found in token." });
            }

            // Parse userId to Guid
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid user ID format." });
            }

            // Fetch user and seller profile
            var userResult = await _userRepository.GetUserByIdAsync(userGuid);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = userResult.Message });
            }

            var seller = userResult.Data.SellerProfile;
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to update
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null || product.SellerId != seller.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            // Handle optional image upload
            if (updateProductDto.Image != null && updateProductDto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = $"{DateTime.UtcNow.Ticks}_{Path.GetFileName(updateProductDto.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await updateProductDto.Image.CopyToAsync(stream);
                }

                product.ImageUrl = $"/uploads/products/{uniqueFileName}"; // Update image URL only if new image uploaded
            }

            // Update the product data
            product.Name = updateProductDto.Name;
            product.Description = updateProductDto.Description;
            product.Price = updateProductDto.Price;
            product.StockQuantity = updateProductDto.StockQuantity;
            product.UpdatedAt = DateTime.UtcNow;

            var isUpdated = await _productRepository.UpdateProductAsync(product);
            if (!isUpdated)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to update product." });
            }

            var response = new
            {
                ProductId = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                SellerId = product.SellerId,
                ImageUrl = product.ImageUrl
            };

            return Ok(new APIResponse { Status = 200, Message = "Product updated successfully.", Data = response });
        }


        // UPDATE PRODUCT STOCK
        [Authorize(Roles = "Seller")]
        [HttpPut("update-stock/{productId}")]
        public async Task<IActionResult> UpdateStock(Guid productId, [FromForm] UpdateStockDto updateStockDto)
        {
            // Validate the input data
            if (updateStockDto == null || updateStockDto.StockQuantity <= 0)
            {
                return Ok(new APIResponse { Status = 400, Message = "Stock Quantity is required and cannot be negative." });
            }

            // Get the current user ID from the JWT token
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new APIResponse { Status = 401, Message = "User identity not found in token." });
            }

            // Parse userId to Guid
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid user ID format." });
            }

            // Fetch user and seller profile
            var userResult = await _userRepository.GetUserByIdAsync(userGuid);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 401, Message = userResult.Message });
            }

            var seller = userResult.Data.SellerProfile;
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to update
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null || product.SellerId != seller.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            // Update the product data
            if(updateStockDto.Pattern == "Increase")
            {
                product.StockQuantity += updateStockDto.StockQuantity;
            }
            else if(updateStockDto.Pattern == "Decrease")
            {
                if(product.StockQuantity < updateStockDto.StockQuantity)
                {
                    return Ok(new APIResponse { Status = 400, Message = "Stock Qunatity cannot be negative." });
                }
                product.StockQuantity -= updateStockDto.StockQuantity;
            }
                

            var isStockQuantityUpdated = await _productRepository.UpdateProductAsync(product);
            if (!isStockQuantityUpdated)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to update product stock quantity." });
            }

            var response = new
            {
                ProductId = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                SellerId = product.SellerId,
                ImageUrl = product.ImageUrl
            };

            return Ok(new APIResponse { Status = 200, Message = "Product updated successfully.", Data = response });
        }


        // DELETE PRODUCT
        [Authorize(Roles = "Seller")]
        [HttpDelete("{productId}")]
        public async Task<IActionResult> DeleteProduct(Guid productId)
        {
            if (productId == Guid.Empty)
            {
                return Ok(new APIResponse { Status = 400, Message = "Product ID missing or invalid." });
            }

            // Get the current user ID from the JWT token
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new APIResponse { Status = 401, Message = "User identity not found in token." });
            }

            // Parse userId to Guid
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid user ID format in token." });
            }

            // Fetch user and seller profile
            var userResult = await _userRepository.GetUserByIdAsync(userGuid);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = userResult.Message });
            }

            var seller = userResult.Data.SellerProfile;
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to delete
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null || product.SellerId != seller.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            var isDeleted = await _productRepository.DeleteProductAsync(productId);
            if (!isDeleted)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to delete product." });
            }

            return Ok(new APIResponse { Status = 200, Message = "Product deleted successfully." });
        }


        // MAKE PRODUCT INACTIVE
        [Authorize(Roles = "Seller")]
        [HttpPut("inactive/{productId}")]
        public async Task<IActionResult> MakeProductInactive(Guid productId)
        {
            if (productId == Guid.Empty)
            {
                return Ok(new APIResponse { Status = 400, Message = "Product ID missing or invalid." });
            }

            // Get the current user ID from the JWT token
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new APIResponse { Status = 401, Message = "User identity not found in token." });
            }

            // Parse userId to Guid
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid user ID format in token." });
            }

            // Fetch user and seller profile
            var userResult = await _userRepository.GetUserByIdAsync(userGuid);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 401, Message = userResult.Message });
            }

            var seller = userResult.Data.SellerProfile;
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to delete
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null || product.SellerId != seller.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            var isInactive = await _productRepository.MakeProductInactiveAsync(productId);
            if (!isInactive)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to Inactivate product." });
            }

            return Ok(new APIResponse { Status = 200, Message = "Product Inactivated successfully." });
        }


        // MAKE PRODUCT ACTIVE
        [Authorize(Roles = "Seller")]
        [HttpPut("active/{productId}")]
        public async Task<IActionResult> MakeProductActive(Guid productId)
        {
            if (productId == Guid.Empty)
            {
                return Ok(new APIResponse { Status = 400, Message = "Product ID missing or invalid." });
            }

            // Get the current user ID from the JWT token
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new APIResponse { Status = 401, Message = "User identity not found in token." });
            }

            // Parse userId to Guid
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 400, Message = "Invalid user ID format in token." });
            }

            // Fetch user and seller profile
            var userResult = await _userRepository.GetUserByIdAsync(userGuid);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = userResult.Message });
            }

            var seller = userResult.Data.SellerProfile;
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to delete
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null || product.SellerId != seller.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            var isActive = await _productRepository.MakeProductActiveAsync(productId);
            if (!isActive)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to Activate product." });
            }

            return Ok(new APIResponse { Status = 200, Message = "Product Activated successfully." });
        }
    }
}
