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
        Task<List<Customer>> GetCustomersAsync(int pageNumber, int pageSize, string searchText, string sortField, string sortOrder, string filterByStatus);

        Task<Customer> GetCustomerByIdAsync(Guid customerId);

        Task<Customer> GetCustomerByUserIdAsync(Guid userId);

        Task<bool> CreateCustomerInDBAsync(Customer customer);

        Task<bool> MakeCustomerInactiveByCustomerIdAsync(Guid customerId);

        Task<bool> MakeCustomerActiveByCustomerIdAsync(Guid customerId);
    }
}
