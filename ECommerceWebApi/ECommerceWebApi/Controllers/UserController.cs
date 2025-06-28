using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedReference;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly ISellerRepository _sellerRepository;

        public UserController(IUserRepository userRepository, ICustomerRepository customerRepository, ISellerRepository sellerRepository)
        {
            _userRepository = userRepository;
            _customerRepository = customerRepository;
            _sellerRepository = sellerRepository;
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "fullname", [FromQuery] string sortOrder = "asc")
        {
            var result = await _userRepository.GetUsersAsync(pageNumber, pageSize, searchText, sortField, sortOrder);

            if (!result.Success)
            {
                var data = new
                {
                    TotalUsers = 0,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Users = new List<User>()
                };

                return Ok(new APIResponse { Status = 404, Message = result.Message, Data = null});
            }

            var users = result.Data.Items.Select(userObj => new
            {
                UserId = userObj.Id,
                Name = userObj.FullName,
                Email = userObj.Email,
                RegisteredAt = userObj.CreatedAt,
                LastLogin = userObj.LastLogin,

                Roles = userObj.Roles.Select(userRoleObj => userRoleObj.Role.Name),

                SellerId = userObj?.SellerProfile?.Id,
                StoreName = userObj?.SellerProfile?.StoreName,
                City = userObj?.SellerProfile?.City,
                IsApproved = userObj?.SellerProfile?.IsApproved,
                SellerProfileStatus = userObj?.SellerProfile?.IsActive,
                SellerProfileCreatedDate = userObj?.SellerProfile?.CreatedAt,

                CustomerId = userObj?.CustomerProfile?.Id,
                CustomerProfileStatus = userObj?.CustomerProfile?.IsActive,
                CustomerProfileCreatedDate = userObj?.CustomerProfile?.CreatedAt,
            });

            var response = new
            {
                TotalUsers = result.Data.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Users = users
            };


            return Ok(new APIResponse { Status = 200, Message = "Users Fetched Successfully", Data = response });
        }


        // GET USER BY ID
        [Authorize(Roles = "Admin")]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(Guid userId)
        {
            var userResult = await _userRepository.GetUserByIdAsync(userId);

            if (!userResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = userResult.Message });
            }

            var response = new
            {
                UserId = userResult.Data.Id,
                Name = userResult.Data.FullName,
                Email = userResult.Data.Email,
                RegisteredAt = userResult.Data.CreatedAt,
                LastLogin = userResult.Data.LastLogin,

                Roles = userResult.Data.Roles.Select(userRoleObj => userRoleObj.Role.Name),

                SellerId = userResult.Data?.SellerProfile?.Id,
                StoreName = userResult.Data?.SellerProfile?.StoreName,
                City = userResult.Data?.SellerProfile?.City,
                IsApproved = userResult.Data?.SellerProfile?.IsApproved,
                SellerProfileStatus = userResult.Data?.SellerProfile?.IsActive,
                SellerProfileCreatedDate = userResult.Data?.SellerProfile?.CreatedAt,

                CustomerId = userResult.Data?.CustomerProfile?.Id,
                CustomerProfileStatus = userResult.Data?.CustomerProfile?.IsActive,
                CustomerProfileCreatedDate = userResult.Data?.CustomerProfile?.CreatedAt,
            };



            return Ok(new APIResponse { Status = 200, Message = "User Fetched Successfully", Data = response });
        }


        [Authorize(Roles = "Admin,Seller,Customer")]
        [HttpPut("change2FAStatus")]
        public async Task<IActionResult> ChangeUser2FAStatus([FromBody] bool status)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var result = await _userRepository.Change2FAStatus(userGuid, status);

            if (!result.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = result.Message });
            }

            return Ok(new APIResponse { Status = 200, Message = "2FA Status Changed Successfully", Data = null });
        }

    }
}