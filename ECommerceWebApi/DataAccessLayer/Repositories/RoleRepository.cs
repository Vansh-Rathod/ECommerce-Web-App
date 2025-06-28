using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public RoleRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Role>> GetAllRoles()
        {
            try
            {
                return await _dbContext.Roles.ToListAsync();
            }
            catch(Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving roles from db: " + ex.Message);
                return null;
            }
        }

        public async Task<Role> GetRoleByName(string roleName)
        {
            try
            {
                return await _dbContext.Roles
                    .FirstOrDefaultAsync(roleObj => roleObj.Name == roleName);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving role by name from db: " + ex.Message);
                return null;
            }
        }

        public async Task<List<Role>> GetRolesByNamesAsync(List<string> roleNames)
        {
            try
            {
                return await _dbContext.Roles
                    .Where(roleObj => roleNames.Contains(roleObj.Name))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving roles by names from DB: " + ex.Message);
                return new List<Role>();
            }
        }

        public async Task<Role> GetRoleById(Guid roleId)
        {
            try
            {
                return await _dbContext.Roles
                    .FirstOrDefaultAsync(roleObj => roleObj.Id == roleId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving role by roleId from db: " + ex.Message);
                return null;
            }
        }
    }
}
