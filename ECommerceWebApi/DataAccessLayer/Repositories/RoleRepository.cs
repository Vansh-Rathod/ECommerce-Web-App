using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public RoleRepository( ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }

        public async Task<CommonResponse<PagedResult<Role>>> GetAllRoles()
        {
            try
            {
                int pageNumber = 1;
                int pageSize = int.MaxValue;

                var query = _dbContext.Roles.AsQueryable();

                int totalRecords = await query.CountAsync();

                var roles = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

                var result = new PagedResult<Role>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = roles,
                    TotalRecords = totalRecords,
                };

                return CommonResponse<PagedResult<Role>>.SuccessResponse(
                   result,
                   "Roles fetched successfully");

            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving roles.", SharedReference.Enums.Enum.LogLevel.Error, "RoleRepository.GetAllRoles()", ex, null, null, null);
                return CommonResponse<PagedResult<Role>>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving roles." },
                       "Failed to fetch roles.");
            }
        }

        public async Task<CommonResponse<Role>> GetRoleByName( string roleName )
        {
            try
            {
                var role = await _dbContext.Roles
                    .FirstOrDefaultAsync(roleObj => roleObj.Name == roleName);

                if(role == null)
                {
                    return CommonResponse<Role>.FailureResponse(
                        new List<string> { "Role not found." },
                        "Role not found.");
                }

                return CommonResponse<Role>.SuccessResponse(
                   role,
                   "Role fetched successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving role by role name: {roleName}.", SharedReference.Enums.Enum.LogLevel.Error, "RoleRepository.GetRoleByName()", ex, null, null, new Dictionary<string, object> { { "RoleName", roleName } });
                return CommonResponse<Role>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving role by role name: {roleName}." },
                       "Failed to fetch role.");
            }
        }

        public async Task<CommonResponse<PagedResult<Role>>> GetRolesByNamesAsync( List<string> roleNames )
        {
            try
            {
                int pageNumber = 1;
                int pageSize = int.MaxValue;

                var query = _dbContext.Roles
                    .Where(roleObj => roleNames.Contains(roleObj.Name))
                    .AsQueryable();

                int totalRecords = await query.CountAsync();

                var roles = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

                var result = new PagedResult<Role>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = roles,
                    TotalRecords = totalRecords,
                };

                return CommonResponse<PagedResult<Role>>.SuccessResponse(
                   result,
                   "Roles fetched successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving roles by role names: {roleNames}.", SharedReference.Enums.Enum.LogLevel.Error, "RoleRepository.GetRolesByNamesAsync()", ex, null, null, new Dictionary<string, object> { { "RoleNames", roleNames } });
                return CommonResponse<PagedResult<Role>>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving roles by role names: {roleNames}." },
                       "Failed to fetch roles.");
            }
        }

        public async Task<CommonResponse<Role>> GetRoleById( Guid roleId )
        {
            try
            {
                var role = await _dbContext.Roles
                    .FirstOrDefaultAsync(roleObj => roleObj.Id == roleId);

                if(role == null)
                {
                    return CommonResponse<Role>.FailureResponse(
                        new List<string> { "Role not found." },
                        "Role not found.");
                }

                return CommonResponse<Role>.SuccessResponse(
                   role,
                   "Role fetched successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving role by id: {roleId}.", SharedReference.Enums.Enum.LogLevel.Error, "RoleRepository.GetRoleById()", ex, null, null, new Dictionary<string, object> { { "RoleId", roleId } });
                return CommonResponse<Role>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving role by id: {roleId}." },
                       "Failed to fetch role.");
            }
        }
    }
}
