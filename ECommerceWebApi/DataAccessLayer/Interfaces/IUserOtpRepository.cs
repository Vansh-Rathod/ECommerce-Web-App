using SharedReference;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IUserOtpRepository
    {
        Task<CommonResponse<UserOTPModel>> GetOtpByIdAsync(Guid id);
        Task<CommonResponse<UserOTPModel>> GetLatestValidOtpByUserIdAsync(Guid userId);
        Task<CommonResponse<UserOTPModel>> SaveOtpAsync(UserOTPModel userOtpModel);
        Task<CommonResponse<UserOTPModel>> IncrementAttemptAsync(Guid userId);
        Task<CommonResponse<UserOTPModel>> DeleteOtpByIdAsync(Guid id);
        Task<CommonResponse<List<UserOTPModel>>> DeleteAllOtpsByUserIdAsync(Guid userId);
    }
}
