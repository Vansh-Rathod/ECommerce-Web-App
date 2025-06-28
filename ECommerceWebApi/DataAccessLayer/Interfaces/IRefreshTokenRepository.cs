using SharedReference;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshTokenModel> GetRefreshTokenByTokenAsync(string refreshToken);

        Task<RefreshTokenModel> GetRefreshTokenByIdAsync(Guid id);

        Task<List<RefreshTokenModel>> GetRefreshTokensByUserIdAsync(Guid userId);

        Task<bool> SaveRefreshTokenAsync(RefreshTokenModel refreshTokenModel);

        Task<bool> UpdateRefreshTokenAsync(RefreshTokenModel refreshTokenModel);
    }
}
