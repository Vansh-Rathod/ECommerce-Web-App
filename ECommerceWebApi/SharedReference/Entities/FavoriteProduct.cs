using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class FavoriteProduct
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProductId { get; set; }


        // Navigation properties
        public Customer Customer { get; set; }
        public Product Product { get; set; }
    }
}
