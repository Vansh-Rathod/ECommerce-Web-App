using SharedReference;
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
        Task<CommonResponse<PagedResult<Role>>> GetAllRoles();

        Task<CommonResponse<Role>> GetRoleByName(string roleName);

        Task<CommonResponse<PagedResult<Role>>> GetRolesByNamesAsync(List<string> roleNames);

        Task<CommonResponse<Role>> GetRoleById(Guid roleId);
    }
}
