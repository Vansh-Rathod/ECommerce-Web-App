using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastLogin { get; set; } = DateTime.UtcNow;
        public bool Is2FAEnabled { get; set; } = false;


        // Navigation properties
        public List<UserRole> Roles { get; set; }
        public Seller SellerProfile { get; set; }
        public Customer CustomerProfile { get; set; }
        public ICollection<RefreshTokenModel> RefreshTokens { get; set; }
        public UserOTPModel UserOTP { get; set; }
    }
}
