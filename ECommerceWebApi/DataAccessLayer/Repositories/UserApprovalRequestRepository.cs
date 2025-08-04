using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
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
    public class UserApprovalRequestRepository : IUserApprovalRequestRepository
    {

        private readonly ApplicationDbContext _dbContext;
        private readonly ILoggerRepository _loggerRepository;

        public UserApprovalRequestRepository(ApplicationDbContext dbContext, ILoggerRepository loggerRepository )
        {
            _dbContext = dbContext;
            _loggerRepository = loggerRepository;
        }


        public async Task<CommonResponse<UserApprovalRequest>> CreateUserApprovalRequestAsync(UserApprovalRequest userApprovalRequest)
        {
            try
            {
                await _dbContext.UserApprovalRequests.AddAsync(userApprovalRequest);

                await _dbContext.SaveChangesAsync();

                return CommonResponse<UserApprovalRequest>.SuccessResponse(
                    userApprovalRequest,
                    "User approval request created successfully");
            }
            catch (Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while creating user approval request.", SharedReference.Enums.Enum.LogLevel.Error, "UserApprovalRequestRepository.CreateUserApprovalRequestAsync()", ex, null, null, new Dictionary<string, object> { { "UserApprovalRequest", userApprovalRequest } });
                return CommonResponse<UserApprovalRequest>.FailureResponse(
                       new List<string> { $"Exception occurred while creating user approval request." },
                       "Failed to create user approval request");
            }
        }

        //public Task<bool> UpdateUserApprovalRequestAsync(UserApprovalRequest userApprovalRequest)
        //{
        //    throw new NotImplementedException();
        //}
    }
}
