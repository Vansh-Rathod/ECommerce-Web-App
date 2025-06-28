using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference
{
    public class RefreshTokenRequestModel
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
