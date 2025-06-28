-- =============================================
-- Author:		Vansh Rathod
-- Create date:	2025-06-07
-- Last modified: 2025-06-07 06:50 PM
-- Purpose:		Get all customers with their profiles
-- =============================================

CREATE PROCEDURE GetAllCustomers
AS
BEGIN
SELECT u.Id as UserId,
u.Email,
u.FullName,
u.CreatedAt,
u.LastLogin,

STRING_AGG(r.Name, ', ') AS AppliedRoles,

cp.isActive as IsCustomerProfileActive,
cp.CreatedAt as CustomerProfileCreatedAt,

sp.StoreName as StoreName,
sp.City as City,
sp.IsActive as IsSellerProfileActive,
sp.IsApproved as IsSellerProfileApproved,
sp.CreatedAt as SellerProfileCreatedAt

FROM Users u
LEFT JOIN UserRoles ur ON u.Id = ur.UserId
LEFT JOIN Roles r ON r.Id = ur.RoleId
LEFT JOIN Customers cp ON cp.UserId = u.Id
LEFT JOIN Sellers sp ON sp.UserId = u.Id

WHERE cp.IsActive = 1 OR cp.IsActive = 0

 GROUP BY 
        u.Id, u.Email, u.FullName, u.CreatedAt, u.LastLogin,
        cp.IsActive, cp.CreatedAt,
        sp.StoreName, sp.City, sp.IsActive, sp.IsApproved, sp.CreatedAt
END;