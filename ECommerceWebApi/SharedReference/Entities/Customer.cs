using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class Customer
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public bool IsActive { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation porperties
        public User User { get; set; }
        public Wallet Wallet { get; set; }
        public Cart Cart { get; set; }
        public ICollection<Order> Orders { get; set; }
    }
}
