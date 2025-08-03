using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface ICustomerRepository
    {
        Task<CommonResponse<PagedResult<Customer>>> GetCustomersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus);

        Task<CommonResponse<Customer>> GetCustomerByIdAsync(Guid customerId);

        Task<CommonResponse<Customer>> GetCustomerByUserIdAsync(Guid userId);

        Task<CommonResponse<Customer>> CreateCustomerInDBAsync(Customer customer);

        Task<CommonResponse<Customer>> MakeCustomerInactiveByCustomerIdAsync(Guid customerId);

        Task<CommonResponse<Customer>> MakeCustomerActiveByCustomerIdAsync(Guid customerId);
    }
}
