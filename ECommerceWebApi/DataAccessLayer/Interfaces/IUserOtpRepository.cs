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
        Task<UserOTPModel?> GetOtpByIdAsync(Guid id);
        Task<UserOTPModel?> GetLatestValidOtpByUserIdAsync(Guid userId);
        Task<bool> SaveOtpAsync(UserOTPModel userOtpModel);
        Task<bool> IncrementAttemptAsync(Guid userId);
        Task<bool> DeleteOtpByIdAsync(Guid id);
        Task<bool> DeleteAllOtpsByUserIdAsync(Guid userId);
    }
}
