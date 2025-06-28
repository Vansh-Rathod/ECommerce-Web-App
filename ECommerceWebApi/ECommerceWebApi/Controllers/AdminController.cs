using DataAccessLayer.Interfaces;
using ECommerceWebApi.Services;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SharedReference;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {

        private readonly IUserRepository _userRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly ISellerRepository _sellerRepository;

        public AdminController(IUserRepository userRepository, ICustomerRepository customerRepository, ISellerRepository sellerRepository)
        {
            _userRepository = userRepository;
            _customerRepository = customerRepository;
            _sellerRepository = sellerRepository;
        }


        // GET ADMIN PROFILE FROM THE TOKEN
        [Authorize(Roles = "Admin")]
        [HttpGet("profile")]
        public async Task<IActionResult> GetAdminProfileAsync()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var userProfileDataResult = await _userRepository.GetUserByIdAsync(userGuid);

            if (!userProfileDataResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = userProfileDataResult.Message });
            }


            var response = new
            {
                UserId = userProfileDataResult.Data.Id,
                Name = userProfileDataResult.Data.FullName,
                Email = userProfileDataResult.Data.Email,
                RegisteredAt = userProfileDataResult.Data.CreatedAt,
                LastLogin = userProfileDataResult.Data.LastLogin,

                Roles = userProfileDataResult.Data.Roles.Select(userRoleObj => userRoleObj.Role.Name),

                SellerId = userProfileDataResult.Data?.SellerProfile?.Id,
                StoreName = userProfileDataResult.Data?.SellerProfile?.StoreName,
                City = userProfileDataResult.Data?.SellerProfile?.City,
                IsApproved = userProfileDataResult.Data?.SellerProfile?.IsApproved,
                SellerProfileStatus = userProfileDataResult.Data?.SellerProfile?.IsActive,
                SellerProfileCreatedDate = userProfileDataResult.Data?.SellerProfile?.CreatedAt,

                CustomerId = userProfileDataResult.Data?.CustomerProfile?.Id,
                CustomerProfileStatus = userProfileDataResult.Data?.CustomerProfile?.IsActive,
                CustomerProfileCreatedDate = userProfileDataResult.Data?.CustomerProfile?.CreatedAt,

                Is2FAEnabled = userProfileDataResult.Data?.Is2FAEnabled,
            };

            

            return Ok(new APIResponse { Status = 200, Message = "User Profile Fetched Successfully", Data = response });
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingApprovalRequests([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string sortField = "fullname", [FromQuery] string sortOrder = "asc")
        {
            var pendingUsersResult = await _userRepository.GetUnapprovedUsersAsync(pageNumber, pageSize, searchText, sortField, sortOrder);

            if (!pendingUsersResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = pendingUsersResult.Message });
            }

            var response = pendingUsersResult.Data.Select(userObj => new
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

            return Ok(new APIResponse { Status = 200, Message = "Unapproved Users Fetched Successfully", Data = response });
        }

    }
}
