using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public RefreshTokenRepository( ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }

        public async Task<CommonResponse<RefreshTokenModel>> GetRefreshTokenByTokenAsync( string refreshToken )
        {

            try
            {
                var tokenEntity = await _dbContext.RefreshTokens
            .Include(rt => rt.User)
            .Include(rt => rt.User.CustomerProfile)
            .Include(rt => rt.User.SellerProfile)
            .Include(rt => rt.User.Roles)
                .ThenInclude(userRoleObj => userRoleObj.Role)
            .FirstOrDefaultAsync(rt => rt.RefreshToken == refreshToken);

                if(tokenEntity == null)
                {
                    return CommonResponse<RefreshTokenModel>.FailureResponse(
                        new List<string> { "Refresh token not found." },
                        "Invalid token.");
                }

                return CommonResponse<RefreshTokenModel>.SuccessResponse(
                   tokenEntity,
                   "Refresh token fetched successfully.");

            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving refreshToken by token: {refreshToken}.", SharedReference.Enums.Enum.LogLevel.Error, "RefreshTokenRepository.GetRefreshTokenByTokenAsync()", ex, null, null, new Dictionary<string, object> { { "RefreshToken", refreshToken } });
                return CommonResponse<RefreshTokenModel>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving refreshToken by token: {refreshToken}." },
                       "Failed to fetch refresh token.");
            }
        }

        public async Task<CommonResponse<RefreshTokenModel>> GetRefreshTokenByIdAsync( Guid id )
        {

            try
            {
                var tokenEntity = await _dbContext.RefreshTokens
            .Include(rt => rt.User)
            .Include(rt => rt.User.CustomerProfile)
            .Include(rt => rt.User.SellerProfile)
            .Include(rt => rt.User.Roles)
                .ThenInclude(userRoleObj => userRoleObj.Role)
            .FirstOrDefaultAsync(rt => rt.Id == id);

                if(tokenEntity == null)
                {
                    return CommonResponse<RefreshTokenModel>.FailureResponse(
                        new List<string> { "Refresh token not found." },
                        "Invalid refresh token id.");
                }

                return CommonResponse<RefreshTokenModel>.SuccessResponse(
                   tokenEntity,
                   "Refresh token fetched successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving refreshToken by id: {id}.", SharedReference.Enums.Enum.LogLevel.Error, "RefreshTokenRepository.GetRefreshTokenByIdAsync()", ex, null, null, new Dictionary<string, object> { { "RefreshTokenId", id } });
                return CommonResponse<RefreshTokenModel>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving refreshToken by id: {id}." },
                       "Failed to fetch refresh token.");
            }
        }

        public async Task<CommonResponse<PagedResult<RefreshTokenModel>>> GetRefreshTokensByUserIdAsync( Guid userId )
        {

            try
            {

                int pageNumber = 1;
                int pageSize = int.MaxValue;

                var query = _dbContext.RefreshTokens
             .Include(rt => rt.User)
             .Include(rt => rt.User.CustomerProfile)
             .Include(rt => rt.User.SellerProfile)
             .Include(rt => rt.User.Roles)
                 .ThenInclude(ur => ur.Role)
             .Where(rt => rt.UserId == userId)
             .AsQueryable();

                int totalRecords = await query.CountAsync();

                var tokenEntities = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

                var result = new PagedResult<RefreshTokenModel>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = tokenEntities,
                    TotalRecords = totalRecords,
                };

                return CommonResponse<PagedResult<RefreshTokenModel>>.SuccessResponse(
                   result,
                   "Refresh tokens fetched successfully");

            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving refresh tokens by userId: {userId}.", SharedReference.Enums.Enum.LogLevel.Error, "RefreshTokenRepository.GetRefreshTokensByUserIdAsync()", ex, null, null, new Dictionary<string, object> { { "UserId", userId } });
                return CommonResponse<PagedResult<RefreshTokenModel>>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving refresh tokens by userId: {userId}." },
                       "Failed to fetch refresh tokens.");
            }
        }

        public async Task<CommonResponse<RefreshTokenModel>> SaveRefreshTokenAsync( RefreshTokenModel refreshTokenModel )
        {
            try
            {
                _dbContext.RefreshTokens.Add(refreshTokenModel);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<RefreshTokenModel>.SuccessResponse(
                   refreshTokenModel,
                   "Refresh token saved to DB successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while saving refresh token.", SharedReference.Enums.Enum.LogLevel.Error, "RefreshTokenRepository.SaveRefreshTokenAsync()", ex, null, null, new Dictionary<string, object> { { "RefreshToken", refreshTokenModel } });
                return CommonResponse<RefreshTokenModel>.FailureResponse(
                       new List<string> { $"Exception occurred while saving refresh token." },
                       "Failed to save refresh token.");
            }
        }

        public async Task<CommonResponse<RefreshTokenModel>> UpdateRefreshTokenAsync( RefreshTokenModel refreshTokenModel )
        {
            try
            {
                _dbContext.RefreshTokens.Update(refreshTokenModel);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<RefreshTokenModel>.SuccessResponse(
                   refreshTokenModel,
                   "Refresh token updated successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while updating refresh token.", SharedReference.Enums.Enum.LogLevel.Error, "RefreshTokenRepository.UpdateRefreshTokenAsync()", ex, null, null, new Dictionary<string, object> { { "RefreshToken", refreshTokenModel } });
                return CommonResponse<RefreshTokenModel>.FailureResponse(
                       new List<string> { $"Exception occurred while updating refresh token." },
                       "Failed to update refresh token.");
            }
        }
    }
}
