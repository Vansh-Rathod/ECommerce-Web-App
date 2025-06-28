using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.WalletDTOs
{
    public class PayDto
    {
       
        [Range(1, int.MaxValue, ErrorMessage = "Amount must be greater than 1.")]
        public int Amount { get; set; }


        public string? Description { get; set; }
    }
}
