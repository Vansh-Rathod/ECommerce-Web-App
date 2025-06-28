using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference
{
    public class UserOTPModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string OtpCode { get; set; }
        public DateTime ExpiryTime { get; set; }
        public int AttemptCount { get; set; }

        // Navigation properties
        public User User { get; set; }
    }
}
