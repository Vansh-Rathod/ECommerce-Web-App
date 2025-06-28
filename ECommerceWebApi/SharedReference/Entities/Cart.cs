using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class Cart
    {
        public Guid Id { get; set; }

        public Guid CustomerId { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Customer Customer { get; set; }
        public ICollection<CartItem> CartItems { get; set; }
    }
}
