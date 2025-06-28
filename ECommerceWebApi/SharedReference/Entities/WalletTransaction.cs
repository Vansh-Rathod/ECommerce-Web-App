using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class WalletTransaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid WalletId { get; set; }
        public decimal Amount { get; set; }
        public string TransactionType { get; set; } // credit, debit
        public string Description { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Wallet Wallet { get; set; }
    }
}
