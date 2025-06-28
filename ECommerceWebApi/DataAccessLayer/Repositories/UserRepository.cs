using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public UserRepository(ApplicationDbContext dbContext, ILoggerRepository loggerRepository)
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }

        public async Task<CommonResponse<PagedResult<User>>> GetUsersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder)
        {
            try
            {
                var query = _dbContext.Users
                    .Include(userObj => userObj.Roles)
                        .ThenInclude(userRole => userRole.Role)
                    .Include(userObj => userObj.CustomerProfile)
                    .Include(userObj => userObj.SellerProfile)
                    .AsQueryable();

                // Filter by search text (FullName or Email)
                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(userObj =>
                        userObj.FullName.Contains(searchText) ||
                        userObj.Email.Contains(searchText));
                }

                int totalCount = await query.CountAsync();

                // Sorting
                bool ascending = sortOrder?.ToLower() == "asc";
                query = sortField?.ToLower() switch
                {
                    "fullname" => ascending ? query.OrderBy(userObj => userObj.FullName) : query.OrderByDescending(userObj => userObj.FullName),
                    "email" => ascending ? query.OrderBy(userObj => userObj.Email) : query.OrderByDescending(userObj => userObj.Email),
                    "createdat" => ascending ? query.OrderBy(userObj => userObj.CreatedAt) : query.OrderByDescending(userObj => userObj.CreatedAt),
                    _ => query.OrderByDescending(userObj => userObj.CreatedAt) // Default sort
                };

                // Pagination
                var users = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

                var pagedResult = new PagedResult<User>
                {
                    TotalCount = totalCount,
                    Items = users
                };

                return CommonResponse<PagedResult<User>>.SuccessResponse(
                   pagedResult,
                   "Users fetched successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Failed to fetch users.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.GetUsersAsync()", ex, null, null, null);
                return CommonResponse<PagedResult<User>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving users." },
                  "Failed to fetch Users"
              );
            }
        }

        //public async Task<List<User>> GetApprovedSellersAsync()
        //{
        //    try
        //    {
        //        return await _dbContext.Users
        //            .Include(userObj => userObj.Roles)
        //                .ThenInclude(userRole => userRole.Role)
        //            .Include(userObj => userObj.CustomerProfile)
        //            .Include(userObj => userObj.SellerProfile)
        //            .Where(user => user.SellerProfile != null && user.SellerProfile.IsApproved)
        //            .ToListAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Exception occurred while retrieving all users: " + ex.Message);
        //        return null;
        //    }
        //}

        public async Task<CommonResponse<List<User>>> GetUnapprovedUsersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder)
        {
            try
            {
                var unapprovedUsers = await _dbContext.Users
                       .Include(userObj => userObj.Roles)
                           .ThenInclude(userRole => userRole.Role)
                       .Include(userObj => userObj.CustomerProfile)
                       .Include(userObj => userObj.SellerProfile)
                       .Where(user => user.SellerProfile != null && !user.SellerProfile.IsApproved)
                       .ToListAsync();

                return CommonResponse<List<User>>.SuccessResponse(
                    unapprovedUsers,
                    "Unapproved users fetched successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Failed to fetch unapproved users.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.GetUnapprovedUsersAsync()", ex, null, null, null);
                return CommonResponse<List<User>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving unapproved users." },
                  "Failed to fetch Unapproved Users"
              );
            }
        }

        public async Task<CommonResponse<User>> CreateUserInDBAsync(User user)
        {
            try
            {
                await _dbContext.Users.AddAsync(user);

                var result = await _dbContext.SaveChangesAsync();

                if (result > 0)
                {
                    return CommonResponse<User>.SuccessResponse(
                    user,
                    "User created successfully");
                }

                await _loggerRepository.LogAsync($"Failed to create user in DB.", SharedReference.Enums.Enum.LogLevel.Critical, "UserRepository.CreateUserInDBAsync()", null, null, null, new Dictionary<string, object> { { "User", user } });
                return CommonResponse<User>.FailureResponse(
                  new List<string> { $"Something went wrong while creating user in DB." },
                  "Cannot create user in DB"
              );
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while creating user in DB.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.CreateUserInDBAsync()", ex, null, null, new Dictionary<string, object> { { "User", user } });
                return CommonResponse<User>.FailureResponse(
                  new List<string> { $"Exception occurred while creating user in DB." },
                  "Failed to create user in DB");
            }
        }

        public async Task<CommonResponse<User>> UpdateUserInDBAsync(User user)
        {
            try
            {
                _dbContext.Users.Update(user);

                var result = await _dbContext.SaveChangesAsync();

                if (result > 0)
                {
                    return CommonResponse<User>.SuccessResponse(
                    user,
                    "User updated successfully");
                }

                await _loggerRepository.LogAsync($"Failed to update user in DB.", SharedReference.Enums.Enum.LogLevel.Critical, "UserRepository.UpdateUserInDBAsync()", null, null, null, new Dictionary<string, object> { { "User", user } });
                return CommonResponse<User>.FailureResponse(
                  new List<string> { $"Something went wrong while updating user in DB." },
                  "Cannot update user in DB"
              );
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while updating user in DB.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.UpdateUserInDBAsync()", ex, null, null, new Dictionary<string, object> { { "User", user } });
                return CommonResponse<User>.FailureResponse(
                  new List<string> { $"Exception occurred while updating user in DB." },
                  "Failed to update user in DB");
            }
        }


        public async Task<CommonResponse<User>> GetUserByEmailAsync(string email)
        {
            try
            {
                var user =  await _dbContext.Users
                    .Include(userObj => userObj.Roles)
                        .ThenInclude(ur => ur.Role)
                    .Include(userObj => userObj.CustomerProfile)
                    .Include(userObj => userObj.SellerProfile)
                    .FirstOrDefaultAsync(userObj => userObj.Email == email);

                if(user != null)
                {
                    return CommonResponse<User>.SuccessResponse(
                        user,
                        "User fetched successfully");
                }
                    return CommonResponse<User>.FailureResponse(
                        new List<string> { $"User not found by email: {email}." },
                        "User not found");
                }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving user by email.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.GetUserByEmailAsync()", ex, null, null, new Dictionary<string, object> { { "Email", email} });
                return CommonResponse<User>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving user by email: {email}." },
                       "Failed to fetch user");
            }
        }


        public async Task<CommonResponse<List<User>>> GetUsersByRoleAsync(string role)
        {
            try
            {
                var users =  await _dbContext.Users
                        .Include(user => user.Roles)
                        .ThenInclude(userRole => userRole.Role)
                        .Include(user => user.CustomerProfile)
                        .Include(user => user.SellerProfile)
                        .Where(user => user.Roles.Any(ur => ur.Role.Name == role))
                        .ToListAsync();

                if(users != null && users.Count > 0)
                {
                    return CommonResponse<List<User>>.SuccessResponse(
                        users,
                        "Users by role fetched successfully");
                }

                return CommonResponse<List<User>>.FailureResponse(
                       new List<string> { $"Users not found by role: {role}." },
                       "Users not found");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving users by role.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.GetUsersByRoleAsync()", ex, null, null, new Dictionary<string, object> { { "Role", role} });
                return CommonResponse<List<User>>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving users by role: {role}." },
                       "Failed to fetch users by role");
            }
        }


        public async Task<CommonResponse<User>> GetUserByIdAsync(Guid userId)
        {
            try
            {
                var user =  await _dbContext.Users
                        .Include(user => user.Roles)
                            .ThenInclude(userRole => userRole.Role)
                        .Include(user => user.CustomerProfile)
                        .Include(user => user.SellerProfile)
                        .FirstOrDefaultAsync(user => user.Id == userId);

                if (user != null)
                {
                    return CommonResponse<User>.SuccessResponse(
                        user,
                        "User fetched successfully");
                }
                return CommonResponse<User>.FailureResponse(
                    new List<string> { $"User not found by User Id: {userId}." },
                    "User not found");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving user by id: " + ex.Message);

                await _loggerRepository.LogAsync($"Exception occurred while retrieving users by role.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.GetUserByIdAsync()", ex, null, null, new Dictionary<string, object> { { "UserId", userId } });
                return CommonResponse<User>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving user by User Id: {userId}." },
                       "Failed to fetch users by role");
            }
        }


        public async Task<CommonResponse<User>> DeleteUserAsync(Guid userId)
        {
            try
            {
                var user = await _dbContext.Users
                .Include(userObj => userObj.CustomerProfile)
                .Include(userObj => userObj.SellerProfile)
                .FirstOrDefaultAsync(userObj => userObj.Id == userId);

                if (user == null)
                {
                    return CommonResponse<User>.FailureResponse(
                    new List<string> { $"User not found by User Id: {userId}." },
                    "User not found");
                }
                

                _dbContext.Users.Remove(user);
                await _dbContext.SaveChangesAsync();
                return CommonResponse<User>.SuccessResponse(
                        user,
                        "User Removed successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while deleting user.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.DeleteUserAsync()", ex, null, null, new Dictionary<string, object> { { "UserId", userId } });
                return CommonResponse<User>.FailureResponse(
                       new List<string> { $"Exception occurred while deleting user." },
                       "Failed to remove user");
            }

        }

        public async Task<CommonResponse<User>> Change2FAStatus(Guid userId, bool status)
        {
            try
            {
                var user = await _dbContext.Users
                        .Include(user => user.Roles)
                            .ThenInclude(userRole => userRole.Role)
                        .Include(user => user.CustomerProfile)
                        .Include(user => user.SellerProfile)
                        .FirstOrDefaultAsync(user => user.Id == userId);

                if (user == null)
                {
                    return CommonResponse<User>.FailureResponse(
                   new List<string> { $"User not found by User Id: {userId}." },
                   "User not found");
                }

                user.Is2FAEnabled = status;

                _dbContext.Users.Update(user);

                var result = await _dbContext.SaveChangesAsync();

                if(result > 0)
                {
                    return CommonResponse<User>.SuccessResponse(
                       user,
                       "User 2FA status changed successfully");
                }

                return CommonResponse<User>.FailureResponse(
                  new List<string> { $"Unable to update 2FA status." },
                  "Failed to update 2FA status");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while changing 2FA Status.", SharedReference.Enums.Enum.LogLevel.Error, "UserRepository.Change2FAStatus()", ex, null, null, new Dictionary<string, object> { { "UserId", userId }, { "Status", status } });
                return CommonResponse<User>.FailureResponse(
                       new List<string> { $"Exception occurred while changing 2FA Status." },
                       "Failed to change 2FA status");
            }

        }

    }
}
