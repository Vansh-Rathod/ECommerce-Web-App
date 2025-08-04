using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace DataAccessLayer.Repositories
{
    public class UserOtpRepository : IUserOtpRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public UserOtpRepository( ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }

        public async Task<CommonResponse<UserOTPModel>> GetOtpByIdAsync( Guid id )
        {
            try
            {
                var otp = await _dbContext.UserOTPs.FirstOrDefaultAsync(x => x.Id == id);

                if(otp != null)
                {
                    return CommonResponse<UserOTPModel>.SuccessResponse(
                        otp,
                        "OTP fetched successfully");
                }
                return CommonResponse<UserOTPModel>.FailureResponse(
                    new List<string> { $"OTP not found by Id: {id}." },
                    "OTP not found");

            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving otp by id: {id}.", SharedReference.Enums.Enum.LogLevel.Error, "UserOtpRepository.GetOtpByIdAsync()", ex, null, null, new Dictionary<string, object> { { "OtpId", id } });
                return CommonResponse<UserOTPModel>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving otp by id: {id}." },
                       "Failed to fetch OTP");
            }
        }

        public async Task<CommonResponse<UserOTPModel>> GetLatestValidOtpByUserIdAsync( Guid userId )
        {
            try
            {
                var otp = await _dbContext.UserOTPs
               .Where(o => o.UserId == userId && o.ExpiryTime > DateTime.UtcNow)
               .OrderByDescending(o => o.ExpiryTime)
               .FirstOrDefaultAsync();

                if(otp != null)
                {
                    return CommonResponse<UserOTPModel>.SuccessResponse(
                        otp,
                        "OTP fetched successfully");
                }
                return CommonResponse<UserOTPModel>.FailureResponse(
                    new List<string> { $"OTP not found by user id: {userId}." },
                    "OTP not found");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving otp by user id: {userId}.", SharedReference.Enums.Enum.LogLevel.Error, "UserOtpRepository.GetLatestValidOtpByUserIdAsync()", ex, null, null, new Dictionary<string, object> { { "User1Id", userId } });
                return CommonResponse<UserOTPModel>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving otp by user id: {userId}." },
                       "Failed to fetch OTP");
            }

        }

        public async Task<CommonResponse<UserOTPModel>> SaveOtpAsync( UserOTPModel userOtpModel )
        {
            try
            {
                _dbContext.UserOTPs.Add(userOtpModel);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<UserOTPModel>.SuccessResponse(
                        userOtpModel,
                        "OTP saved successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while saving otp", SharedReference.Enums.Enum.LogLevel.Error, "UserOtpRepository.SaveOtpAsync()", ex, null, null, new Dictionary<string, object> { { "OTP", userOtpModel } });
                return CommonResponse<UserOTPModel>.FailureResponse(
                       new List<string> { $"Exception occurred while saving otp" },
                       "Failed to save OTP");
            }

        }

        public async Task<CommonResponse<UserOTPModel>> IncrementAttemptAsync( Guid userId )
        {
            try
            {
                var otp = await _dbContext.UserOTPs
            .Where(o => o.UserId == userId && o.ExpiryTime > DateTime.UtcNow)
            .OrderByDescending(o => o.ExpiryTime)
            .FirstOrDefaultAsync();

                if(otp == null)
                {
                    return CommonResponse<UserOTPModel>.FailureResponse(
                    new List<string> { $"OTP not found by user id: {userId}." },
                    "OTP not found");
                }

                otp.AttemptCount += 1;
                await _dbContext.SaveChangesAsync();

                return CommonResponse<UserOTPModel>.SuccessResponse(
                        otp,
                        "OTP attempt incremented successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while incrementing otp attempt", SharedReference.Enums.Enum.LogLevel.Error, "UserOtpRepository.IncrementAttemptAsync()", ex, null, null, new Dictionary<string, object> { { "UserId", userId } });
                return CommonResponse<UserOTPModel>.FailureResponse(
                       new List<string> { $"Exception occurred while incrementing otp attempt" },
                       "Failed to increment OTP attempt");
            }
        }

        public async Task<CommonResponse<UserOTPModel>> DeleteOtpByIdAsync( Guid id )
        {
            try
            {
                var otp = await _dbContext.UserOTPs.FirstOrDefaultAsync(o => o.Id == id);

                if(otp == null)
                {
                    return CommonResponse<UserOTPModel>.FailureResponse(
                    new List<string> { $"OTP not found by id: {id}." },
                    "OTP not found");
                }

                _dbContext.UserOTPs.Remove(otp);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<UserOTPModel>.SuccessResponse(
                        otp,
                        "OTP deleted successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while deleting otp", SharedReference.Enums.Enum.LogLevel.Error, "UserOtpRepository.DeleteOtpByIdAsync()", ex, null, null, new Dictionary<string, object> { { "OtpId", id } });
                return CommonResponse<UserOTPModel>.FailureResponse(
                       new List<string> { $"Exception occurred while deleting otp" },
                       "Failed to delete OTP");
            }
        }

        public async Task<CommonResponse<List<UserOTPModel>>> DeleteAllOtpsByUserIdAsync( Guid userId )
        {
            try
            {
                var otps = await _dbContext.UserOTPs
            .Where(o => o.UserId == userId)
            .ToListAsync();

                if(otps == null || !otps.Any())
                {
                    return CommonResponse<List<UserOTPModel>>.FailureResponse(
                    new List<string> { $"OTPs not found by user id: {userId}." },
                    "OTPs not found");
                }

                _dbContext.UserOTPs.RemoveRange(otps);
                await _dbContext.SaveChangesAsync();

                return CommonResponse<List<UserOTPModel>>.SuccessResponse(
                        otps,
                        "OTPs deleted successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while deleting otps", SharedReference.Enums.Enum.LogLevel.Error, "UserOtpRepository.DeleteAllOtpsByUserIdAsync()", ex, null, null, new Dictionary<string, object> { { "UserId", userId } });
                return CommonResponse<List<UserOTPModel>>.FailureResponse(
                       new List<string> { $"Exception occurred while deleting otps" },
                       "Failed to delete OTPs");
            }
        }
    }
}
