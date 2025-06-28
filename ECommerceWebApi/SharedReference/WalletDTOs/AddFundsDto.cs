using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.WalletDTOs
{
    public class AddFundsDto
    {

        [Range(100, int.MaxValue, ErrorMessage = "Amount must be greater than 100.")]
        public int Amount { get; set; }

        public string? Description { get; set; }
    }
}
