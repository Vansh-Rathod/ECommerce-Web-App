using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
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

        public UserApprovalRequestRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        public async Task<bool> CreateUserApprovalRequestAsync(UserApprovalRequest userApprovalRequest)
        {
            try
            {
                await _dbContext.UserApprovalRequests.AddAsync(userApprovalRequest);

                var result = await _dbContext.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while creating user approval request in database: " + ex.Message);
                return false;
            }
        }

        //public Task<bool> UpdateUserApprovalRequestAsync(UserApprovalRequest userApprovalRequest)
        //{
        //    throw new NotImplementedException();
        //}
    }
}
