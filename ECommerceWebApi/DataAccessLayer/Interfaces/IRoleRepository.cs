using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Interfaces
{
    public interface IRoleRepository
    {
        Task<List<Role>> GetAllRoles();

        Task<Role> GetRoleByName(string roleName);

        Task<List<Role>> GetRolesByNamesAsync(List<string> roleNames);

        Task<Role> GetRoleById(Guid roleId);
    }
}
