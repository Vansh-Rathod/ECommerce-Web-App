using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.Entities
{
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; } // Admin, Seller, Customer


        // Navigation property
        public ICollection<UserRole> UserRoles { get; set; }
    }
}
