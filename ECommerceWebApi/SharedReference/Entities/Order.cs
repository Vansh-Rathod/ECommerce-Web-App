namespace SharedReference.Entities
{
    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CustomerId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? EstimatedDeliveryTime { get; set; } // Random 0.5h–1h after order approval
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;


        // Navigation properties
        public Customer Customer { get; set; }
        public List<OrderItem> OrderItems { get; set; }
    }

    public enum OrderStatus
    {
        Pending, // 0
        PartiallyApproved, // 1
        Approved, // 2
        Rejected, // 3
        Cancelled, // 4
        Delivered // 5
    };
}
