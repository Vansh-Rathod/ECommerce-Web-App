using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class Seller
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string StoreName { get; set; }
        public string City { get; set; }
        public bool IsApproved { get; set; } = false;
        public bool IsActive { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        // Navigation properties
        public User User { get; set; }
        public List<Product> Products { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; }
    }
    //public enum SellerStatus
    //{
    //    Pending,
    //    Approved,
    //    Rejected
    //}
}
