using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference
{
    public class RefreshTokenModel
    {
        public Guid Id { get; set; }
        public string RefreshToken { get; set; }
        public Guid UserId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRevoked { get; set; } = false;


        // Navigation properties
        public User User { get; set; }
    }
}
