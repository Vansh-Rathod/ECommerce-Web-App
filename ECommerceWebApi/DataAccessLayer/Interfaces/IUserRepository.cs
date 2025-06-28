using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IUserRepository
    {
        Task<CommonResponse<PagedResult<User>>> GetUsersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder);

        Task<CommonResponse<List<User>>> GetUnapprovedUsersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder);

        Task<CommonResponse<User>> CreateUserInDBAsync(User user);

        Task<CommonResponse<User>> UpdateUserInDBAsync(User user);

        Task<CommonResponse<User>> GetUserByEmailAsync(string email);

        Task<CommonResponse<List<User>>> GetUsersByRoleAsync(string role);

        Task<CommonResponse<User>> GetUserByIdAsync(Guid userId);

        Task<CommonResponse<User>> DeleteUserAsync(Guid userId);

        Task<CommonResponse<User>> Change2FAStatus(Guid userId, bool status);
    }
}
