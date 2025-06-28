using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid ProductId { get; set; }
        public Guid SellerId { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; } // Important for historical data
        public OrderItemStatus Status { get; set; } = OrderItemStatus.Pending;

        // Navigation properties
        public Order Order { get; set; }
        public Product Product { get; set; }
        public Seller Seller { get; set; }
    }
    public enum OrderItemStatus
    {
        Pending,
        Approved,
        Rejected
    }
}
