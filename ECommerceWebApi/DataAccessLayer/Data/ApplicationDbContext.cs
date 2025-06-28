using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Add missing DbSets

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<UserApprovalRequest> UserApprovalRequests { get; set; }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Seller> Sellers { get; set; }

        public DbSet<Product> Products { get; set; }

        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<WalletTransaction> WalletTransactions { get; set; }

        //public DbSet<FavoriteProduct> FavoriteProducts { get; set; }

        public DbSet<Invoice> Invoices { get; set; }

        public DbSet<RefreshTokenModel> RefreshTokens { get; set; }

        public DbSet<UserOTPModel> UserOTPs { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // === Role GUIDs ===
            var adminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var sellerRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var customerRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");

            // === Admin User ===
            var adminUserId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            var adminEmail = "vansh@satvasolutions.com";
            var adminPassword = "vansh123";
            //var adminHashedPassword = BCrypt.Net.BCrypt.HashPassword(adminPassword);
            var adminHashedPassword = "$2a$12$V618JunCmS6bEY5LrV9QLOCE00XmCGlCoykmM2I55hH.KRQPaErkC";


            // === Seed Roles ===
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = adminRoleId, Name = "Admin" },
                new Role { Id = sellerRoleId, Name = "Seller" },
                new Role { Id = customerRoleId, Name = "Customer" });


            // === Seed Admin User ===
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminUserId,
                    Email = adminEmail,
                    PasswordHash = adminHashedPassword,
                    FullName = "Vansh Admin",
                    CreatedAt = new DateTime(2025, 5, 13, 0, 0, 0, DateTimeKind.Utc),
                    LastLogin = new DateTime(2025, 5, 13, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // === Seed Admin UserRole ===
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole
                {
                    UserId = adminUserId,
                    RoleId = adminRoleId,
                    CreatedAt = new DateTime(2025, 5, 13, 0, 0, 0, DateTimeKind.Utc)
                }
            );



            // ----------- User -----------

            // One-to-one: User ↔ Customer
            modelBuilder.Entity<User>()
                .HasOne(u => u.CustomerProfile)
                .WithOne(c => c.User)
                .HasForeignKey<Customer>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-one: User ↔ Seller
            modelBuilder.Entity<User>()
                .HasOne(u => u.SellerProfile)
                .WithOne(s => s.User)
                .HasForeignKey<Seller>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ----------- UserRole (Junction Table) -----------

            // Composite key for UserRole
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            // ----------- Role -----------
            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();

            // ----------- Customer -----------

            // One-to-one: Customer ↔ Wallet
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Wallet)
                .WithOne(w => w.Customer)
                .HasForeignKey<Wallet>(w => w.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-one: Customer ↔ Cart
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Cart)
                .WithOne(cart => cart.Customer)
                .HasForeignKey<Cart>(cart => cart.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // ----------- Seller -----------
            modelBuilder.Entity<Seller>()
                .HasMany(s => s.Products)
                .WithOne(p => p.Seller)
                .HasForeignKey(p => p.SellerId)
                .OnDelete(DeleteBehavior.Cascade);


            // Unique constraint for Seller's StoreName and City
            modelBuilder.Entity<Seller>()
                .HasIndex(s => new { s.City, s.StoreName })
                .IsUnique();

            // ----------- Order Item -----------
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Seller)
                .WithMany(s => s.OrderItems)
                .HasForeignKey(oi => oi.SellerId)
                .OnDelete(DeleteBehavior.Restrict);


            // ----------- CartItem -----------
            modelBuilder.Entity<CartItem>()
                .HasIndex(ci => new { ci.CartId, ci.ProductId })
                .IsUnique();

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Product)
                .WithMany()
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Restrict);


            // ----------- Wallet -----------
            modelBuilder.Entity<Wallet>()
                .HasIndex(w => w.CustomerId)
                .IsUnique();

            // ----------- Invoice -----------
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Order)
                .WithMany()
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Seller)
                .WithMany()
                .HasForeignKey(i => i.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            // ----------- UserApprovalRequest -----------
            modelBuilder.Entity<UserApprovalRequest>()
                .HasIndex(ar => ar.UserId)
                .IsUnique();


            // ----------- Refresh Token -----------
            // One-to-many: User ↔ RefreshTokens
            modelBuilder.Entity<RefreshTokenModel>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ----------- User -----------
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserOTP)
                .WithOne(o => o.User)
                .HasForeignKey<UserOTPModel>(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Optional: Deletes OTP when user is deleted

        }
    }



}
