using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class UserApprovalRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string RequestedRole { get; set; } 
        public string City { get; set; }
        public UserApprovalStatus Status { get; set; }
        public string? RejectionReason { get; set; }


        // Navigation properties
        public User User { get; set; }
    }

    public enum UserApprovalStatus
    {
        Pending,
        Approved,
        Rejected
    }
}


