using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using SharedReference;
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

        public RefreshTokenRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<RefreshTokenModel> GetRefreshTokenByTokenAsync(string refreshToken)
        {

            try
            {
                return await _dbContext.RefreshTokens
                .Include(rt => rt.User)
                    .ThenInclude(userObj => userObj.Roles)
                        .ThenInclude(userRoleObj => userRoleObj.Role)
                .FirstOrDefaultAsync(rt => rt.RefreshToken == refreshToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving refreshToken by token: " + ex.Message);
                return null;
            }
        }

        public async Task<RefreshTokenModel> GetRefreshTokenByIdAsync(Guid id)
        {

            try
            {
                return await _dbContext.RefreshTokens
                .Include(rt => rt.User)
                    .ThenInclude(userObj => userObj.Roles)
                        .ThenInclude(userRoleObj => userRoleObj.Role)
                .FirstOrDefaultAsync(rt => rt.Id == id);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving refreshToken by id: " + ex.Message);
                return null;
            }
        }

        public async Task<List<RefreshTokenModel>> GetRefreshTokensByUserIdAsync(Guid userId)
        {

            try
            {
                return await _dbContext.RefreshTokens
                    .Include(rt => rt.User)
                    .ThenInclude(userObj => userObj.Roles)
                        .ThenInclude(userRoleObj => userRoleObj.Role)
                .Where(rt => rt.UserId == userId)
                .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving refreshToken by userId: " + ex.Message);
                return null;
            }
        }

        public async Task<bool> SaveRefreshTokenAsync(RefreshTokenModel refreshTokenModel)
        {
            try
            {
                _dbContext.RefreshTokens.Add(refreshTokenModel);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while saving refresh token: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> UpdateRefreshTokenAsync(RefreshTokenModel refreshTokenModel)
        {
            try
            {
                _dbContext.RefreshTokens.Update(refreshTokenModel);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while updating refresh token: " + ex.Message);
                return false;
            }
        }
    }
}
