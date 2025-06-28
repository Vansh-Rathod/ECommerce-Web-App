using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class Wallet
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CustomerId { get; set; }
        public decimal Balance { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;


        // Navigation properties
        public Customer Customer { get; set; }
        public List<WalletTransaction> Transactions { get; set; }
    }
}
