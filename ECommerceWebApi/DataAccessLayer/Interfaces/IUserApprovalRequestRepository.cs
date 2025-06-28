using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IUserApprovalRequestRepository
    {
        Task<bool> CreateUserApprovalRequestAsync(UserApprovalRequest userApprovalRequest);

        //Task<bool> UpdateUserApprovalRequestAsync(UserApprovalRequest userApprovalRequest);
    }
}
