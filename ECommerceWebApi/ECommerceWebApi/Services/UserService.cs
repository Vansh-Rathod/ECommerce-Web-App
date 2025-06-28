using DataAccessLayer.Interfaces;
using Newtonsoft.Json.Linq;
using SharedReference;

namespace ECommerceWebApi.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        //public async Task<CommonResponse<object>> GetUnapprovedUsersAsync()
        //{
        //    var unapprovedUsers = await _userRepository.GetUnapprovedUsersAsync();
        //    if (unapprovedUsers == null)
        //    {
        //        return CommonResponse<object>.FailureResponse(
        //            new List<string> { "No Unapproved Users found in DB." },
        //            "No Unapproved Users Found"
        //        );
        //    }

        //    return CommonResponse<object>.SuccessResponse(unapprovedUsers, "Unapproved Users fetched successfully");
        //}

        //public async Task<CommonResponse<object>> GetUserByEmailAsync(string email)
        //{
        //    var user = await _userRepository.GetUserByEmailAsync(email);
        //    if(user == null)
        //    {
        //        return CommonResponse<object>.FailureResponse(
        //           new List<string> { $"No User found by {email} in DB." },
        //           $"No User found by {email} Found"
        //       );
        //    }

        //    return CommonResponse<object>.SuccessResponse(user, $"User by {email} fetched successfully");
        //}

        //public async Task<CommonResponse<object>> ApproveUserAsync(Guid userId)
        //{
        //    var isApproved = await _userRepository.ApproveUserAsync(userId);
        //    if (!isApproved)
        //    {
        //        return CommonResponse<object>.FailureResponse(
        //           new List<string> { "Failed to approve user." },
        //           "Failed to approve user."
        //       );
        //    }
        //    return CommonResponse<object>.SuccessResponse(userId, $"User by {userId} approved successfully");
        //}

        //public async Task<CommonResponse<object>> DeleteUserAsync(Guid userId)
        //{
        //    var isDeleted = await _userRepository.DeleteUserAsync(userId);
        //    if (!isDeleted)
        //    {
        //        return CommonResponse<object>.FailureResponse(
        //           new List<string> { "Failed to delete user." },
        //           "Failed to delete user."
        //       );
        //    }
        //    return CommonResponse<object>.SuccessResponse(userId, $"User by {userId} deleted successfully");
        //}

        //public async Task<CommonResponse<object>> CreateUserAsync(User user)
        //{

        //}
    }
}
