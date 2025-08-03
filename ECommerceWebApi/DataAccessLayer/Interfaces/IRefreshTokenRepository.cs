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
        Task<CommonResponse<RefreshTokenModel>> GetRefreshTokenByTokenAsync(string refreshToken);

        Task<CommonResponse<RefreshTokenModel>> GetRefreshTokenByIdAsync(Guid id);

        Task<CommonResponse<PagedResult<RefreshTokenModel>>> GetRefreshTokensByUserIdAsync(Guid userId);

        Task<CommonResponse<RefreshTokenModel>> SaveRefreshTokenAsync(RefreshTokenModel refreshTokenModel);

        Task<CommonResponse<RefreshTokenModel>> UpdateRefreshTokenAsync(RefreshTokenModel refreshTokenModel);
    }
}
