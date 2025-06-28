using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace SharedReference
{
    public class RegisterRequestModel
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? City { get; set; }
        public string? StoreName { get; set; }
        public List<string> Roles { get; set; } // e.g. ["Customer", "Seller"]
    }
}
