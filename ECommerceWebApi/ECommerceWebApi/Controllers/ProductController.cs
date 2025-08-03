using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
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
        [Authorize(Roles = "Admin,Customer")]
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "name", [FromQuery] string sortOrder = "asc", [FromQuery] string filterByPrice = "all", [FromQuery] string filterByStatus = "all" )
        {
            var productsResult = await _productRepository.GetProductsAsync(pageNumber, pageSize, searchText, sortField, sortOrder, filterByPrice, filterByStatus);

            if (!productsResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "No Products Found" });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var products = productsResult.Data.Items.Select(productObj => new
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

            var response = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalUsers = productsResult.Data.TotalRecords,
                Users = products
            };

            return Ok(new APIResponse { Status = 200, Message = "Products Fetched Successfully", Data = response });
        }


        // GET SELLER PRODUCTS
        [Authorize(Roles = "Seller")]
        [HttpGet("seller-products")]
        public async Task<IActionResult> GetSellerProducts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "name", [FromQuery] string sortOrder = "asc", [FromQuery] string filterByPrice = "", [FromQuery] string filterByStatus = "all" )
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

            var productsResult = await _productRepository.GetSellerProductsAsync(seller.Id, pageNumber, pageSize, searchText, sortField, sortOrder, filterByPrice, filterByStatus);

            if (!productsResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "No products found for seller" });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var products = productsResult.Data.Items.Select(productObj => new
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

            var response = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalUsers = productsResult.Data.TotalRecords,
                Users = products
            };

            return Ok(new APIResponse { Status = 200, Message = "Products for seller fetched successfully", Data = response });
        }


        // GET PRODUCT BY ID
        //[Authorize(Roles = "Seller")]
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetProductById(Guid productId)
        {
            var productResult = await _productRepository.GetProductByIdAsync(productId);

            if (!productResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "No product found." });
            }

            // Base URL from the current request
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var response = new
            {
                ProductId = productResult.Data.Id,
                Name = productResult.Data.Name,
                Description = productResult.Data.Description,
                Price = productResult.Data.Price,
                StockQuantity = productResult.Data.StockQuantity,
                IsActive = productResult.Data.IsActive,
                SellerId = productResult.Data.SellerId,
                CreatedAt = productResult.Data.CreatedAt,
                UpdatedAt = productResult.Data.UpdatedAt,
                ImageUrl = string.IsNullOrEmpty(productResult.Data.ImageUrl)
            ? null
            : $"{baseUrl}{productResult.Data.ImageUrl.Replace("\\", "/")}"  // Normalize for URLs
            };



            return Ok(new APIResponse { Status = 200, Message = "Product Fetched Successfully", Data = response });
        }


        // CREATE PRODUCT
        [Authorize(Roles = "Seller")]
        [HttpPost("products")]
        public async Task<IActionResult> AddProduct([FromForm] AddProductDto addProductDto)
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

            var sellerResult = userResult.Data?.SellerProfile;
            if (sellerResult == null)
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
                SellerId = sellerResult.Id,
                ImageUrl = imageUrl
            };

            var productResult = await _productRepository.CreateProductAsync(product);

            if (!productResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to create product" });
            }

            var response = new
            {
                ProductId = productResult.Data.Id,
                Name = productResult.Data.Name,
                Description = productResult.Data.Description,
                Price = productResult.Data.Price,
                StockQuantity = productResult.Data.StockQuantity,
                IsActive = productResult.Data.IsActive,
                CreatedAt = productResult.Data.CreatedAt,
                UpdatedAt = productResult.Data.UpdatedAt,
                SellerId = productResult.Data.SellerId,
                ImageUrl = imageUrl
            };

            return Ok(new APIResponse { Status = 200, Message = "Product Created Successfully", Data = response });
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

            var sellerResult = userResult.Data.SellerProfile;
            if (sellerResult == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to update
            var productResult = await _productRepository.GetProductByIdAsync(productId);
            if (!productResult.Success || productResult.Data.SellerId != sellerResult.Id)
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

                productResult.Data.ImageUrl = $"/uploads/products/{uniqueFileName}"; // Update image URL only if new image uploaded
            }

            // Update the product data
            productResult.Data.Name = updateProductDto.Name;
            productResult.Data.Description = updateProductDto.Description;
            productResult.Data.Price = updateProductDto.Price;
            productResult.Data.StockQuantity = updateProductDto.StockQuantity;
            productResult.Data.UpdatedAt = DateTime.UtcNow;

            var updateProductResult = await _productRepository.UpdateProductAsync(productResult.Data);
            if (!updateProductResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to update product." });
            }

            var response = new
            {
                ProductId = updateProductResult.Data.Id,
                Name = updateProductResult.Data.Name,
                Description = updateProductResult.Data.Description,
                Price = updateProductResult.Data.Price,
                StockQuantity = updateProductResult.Data.StockQuantity,
                IsActive = updateProductResult.Data.IsActive,
                CreatedAt = updateProductResult.Data.CreatedAt,
                UpdatedAt = updateProductResult.Data.UpdatedAt,
                SellerId = updateProductResult.Data.SellerId,
                ImageUrl = updateProductResult.Data.ImageUrl
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

            var sellerResult = userResult.Data.SellerProfile;
            if (sellerResult == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to update
            var productResult = await _productRepository.GetProductByIdAsync(productId);
            if (!productResult.Success || productResult.Data.SellerId != sellerResult.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            // Update the product data
            if(updateStockDto.Pattern == "Increase")
            {
                productResult.Data.StockQuantity += updateStockDto.StockQuantity;
            }
            else if(updateStockDto.Pattern == "Decrease")
            {
                if(productResult.Data.StockQuantity < updateStockDto.StockQuantity)
                {
                    return Ok(new APIResponse { Status = 400, Message = "Stock Quantity cannot be negative." });
                }
                productResult.Data.StockQuantity -= updateStockDto.StockQuantity;
            }
                

            var updatedProductResult = await _productRepository.UpdateProductAsync(productResult.Data);
            if (!updatedProductResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to update product stock quantity." });
            }

            var response = new
            {
                ProductId = updatedProductResult.Data.Id,
                Name = updatedProductResult.Data.Name,
                Description = updatedProductResult.Data.Description,
                Price = updatedProductResult.Data.Price,
                StockQuantity = updatedProductResult.Data.StockQuantity,
                IsActive = updatedProductResult.Data.IsActive,
                CreatedAt = updatedProductResult.Data.CreatedAt,
                UpdatedAt = updatedProductResult.Data.UpdatedAt,
                SellerId = updatedProductResult.Data.SellerId,
                ImageUrl = updatedProductResult.Data.ImageUrl
            };

            return Ok(new APIResponse { Status = 200, Message = "Product stock updated successfully.", Data = response });
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

            var sellerResult = userResult.Data.SellerProfile;
            if (sellerResult == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to delete
            var productResult = await _productRepository.GetProductByIdAsync(productId);
            if (!productResult.Success || productResult.Data.SellerId != sellerResult.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            var updatedProductResult = await _productRepository.DeleteProductAsync(productId);
            if (!updatedProductResult.Success)
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

            var sellerResult = userResult.Data.SellerProfile;
            if (sellerResult == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to delete
            var productResult = await _productRepository.GetProductByIdAsync(productId);
            if (!productResult.Success || productResult.Data.SellerId != sellerResult.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            var updatedProductResult = await _productRepository.MakeProductInactiveAsync(productId);
            if (!updatedProductResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to Deactivate product." });
            }

            return Ok(new APIResponse { Status = 200, Message = "Product Deactivated successfully." });
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

            var sellerResult = userResult.Data.SellerProfile;
            if (sellerResult == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Seller profile not found." });
            }

            // Find the product to delete
            var productResult = await _productRepository.GetProductByIdAsync(productId);
            if (!productResult.Success || productResult.Data.SellerId != sellerResult.Id)
            {
                return Ok(new APIResponse { Status = 404, Message = "Product not found or unauthorized." });
            }

            var updateProductResult = await _productRepository.MakeProductActiveAsync(productId);
            if (!updateProductResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to Activate product." });
            }

            return Ok(new APIResponse { Status = 200, Message = "Product Activated successfully." });
        }
    }
}
