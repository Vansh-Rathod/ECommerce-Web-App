using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class Invoice
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid SellerId { get; set; }
        public string FilePath { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Order Order { get; set; }
        public Seller Seller { get; set; }

    }
}
