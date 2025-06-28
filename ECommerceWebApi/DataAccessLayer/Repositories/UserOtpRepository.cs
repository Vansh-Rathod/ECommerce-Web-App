using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class UserOtpRepository : IUserOtpRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public UserOtpRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UserOTPModel?> GetOtpByIdAsync(Guid id)
        {
            try
            {
            return await _dbContext.UserOTPs.FirstOrDefaultAsync(x => x.Id == id);

            }
            catch(Exception ex)
            {
                Console.WriteLine($"Exception occurred while retrieving OTP by ID: {ex.Message}");
                return null;    
            }
        }

        public async Task<UserOTPModel?> GetLatestValidOtpByUserIdAsync(Guid userId)
        {
            try
            {
                return await _dbContext.UserOTPs
               .Where(o => o.UserId == userId && o.ExpiryTime > DateTime.UtcNow)
               .OrderByDescending(o => o.ExpiryTime)
               .FirstOrDefaultAsync();
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Exception occurred while retrieving latest valid OTP by User ID: {ex.Message}");
                return null;
            }
           
        }

        public async Task<bool> SaveOtpAsync(UserOTPModel userOtpModel)
        {
            try
            {
                _dbContext.UserOTPs.Add(userOtpModel);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Exception occurred while saving OTP: {ex.Message}");
                return false;
            }
            
        }

        public async Task<bool> IncrementAttemptAsync(Guid userId)
        {
            try
            {
                var otp = await _dbContext.UserOTPs
            .Where(o => o.UserId == userId && o.ExpiryTime > DateTime.UtcNow)
            .OrderByDescending(o => o.ExpiryTime)
            .FirstOrDefaultAsync();

                if (otp == null)
                {
                    return false;
                }

                otp.AttemptCount += 1;
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Exception occurred while updating OTP by User ID: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteOtpByIdAsync(Guid id)
        {
            try
            {
                var otp = await _dbContext.UserOTPs.FirstOrDefaultAsync(o => o.Id == id);
                if (otp == null)
                {
                    return false;
                }

                _dbContext.UserOTPs.Remove(otp);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception occurred while deleting OTP by ID: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteAllOtpsByUserIdAsync(Guid userId)
        {
            try
            {
                var otps = await _dbContext.UserOTPs
            .Where(o => o.UserId == userId)
            .ToListAsync();

                _dbContext.UserOTPs.RemoveRange(otps);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Exception occurred while deleting all OTPs by User ID: {ex.Message}");
                return false;
            }
        }
    }
}
