USE ECommerceWebApp;

select * from RefreshTokens;

select * from UserOtps;

select * from Users;
select * from Roles;
select * from UserRoles;

select * from Customers;
select * from Sellers;

select * from UserApprovalRequests;

select * from Products;

select * from Orders;
select * from OrderItems;

select * from Wallets;
select * from WalletTransactions;

select * from Carts;
select * from CartItems;

select * from Invoices;

select OrderId, count(OrderId) from OrderItems where SellerId = 'D3E4548D-F7AD-4140-A5F4-D184F381BF1C' group by OrderId;
9A169365-890E-4ACB-A4E7-1C01CDFEE414
5C7F0713-B2C5-4576-8470-7F36BC379DC9
C9DD9455-CA61-42AE-8C31-BFAA234B3F80
3906C5BB-CC52-457B-A5B8-E08E22076E06
