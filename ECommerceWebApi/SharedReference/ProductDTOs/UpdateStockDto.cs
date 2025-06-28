using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference.ProductDTOs
{
    public class UpdateStockDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative and should be grater than 1.")]
        public int StockQuantity { get; set; }

        public string Pattern { get; set; }
    }
}
