using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using MailKit.Search;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class OrderRepository : IOrderRepository
    {

        private readonly ApplicationDbContext _dbContext;
        private readonly IWalletRepository _walletRepository;
        private readonly IEmailNotificationService _emailNotificationService;



        public OrderRepository(ApplicationDbContext dbContext, IWalletRepository walletRepository, IEmailNotificationService emailNotificationService)
        {
            _dbContext = dbContext;
            _walletRepository = walletRepository;
            _emailNotificationService = emailNotificationService;
        }


        // TODO: dont include email service, Instead make a orderService that will do all the processing and then send the email using email service
        // TODO: This method will just make a order and orderItems and also update the stock quantity for the product
        public async Task<Order> PlaceOrderAsync(Guid customerId)
        {
            var cart = await _dbContext.Carts.Include(cartObj => cartObj.CartItems).
                                                ThenInclude(cartItemObj => cartItemObj.Product)
                                                .FirstOrDefaultAsync(cart => cart.CustomerId == customerId);
            if (cart == null || !cart.CartItems.Any())
            {
                return null;
            }

            var validationErrors = new List<string>();

            // First pass: validate stock availability
            foreach (var cartItem in cart.CartItems)
            {
                var product = cartItem.Product;
                if (product.StockQuantity < cartItem.Quantity)
                {
                    validationErrors.Add($"Insufficient stock for {product.Name} (Available: {product.StockQuantity}, Requested: {cartItem.Quantity})");
                }
            }

            if (validationErrors.Any())
            {
                //throw new Exception("Order validation failed:\n" + string.Join("\n", validationErrors));
                return null;
            }

           
            
            // Check customer wallet balance before placing order
            var wallet = await _walletRepository.GetWalletByCustomerIdAsync(customerId);
            var totalOrderAmount = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity);
            if (wallet == null || wallet.Balance < totalOrderAmount)
            {
                // Insufficient balance or wallet not found
                return null;
            }

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                OrderDate = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                OrderItems = new List<OrderItem>(),
                EstimatedDeliveryTime = DateTime.UtcNow.AddMinutes(new Random().Next(30, 61)),
                TotalAmount = 0
            };

            foreach (var cartItem in cart.CartItems)
            {
                var product = cartItem.Product;

                product.StockQuantity -= cartItem.Quantity;

                var item = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = product.Id,
                    SellerId = product.SellerId,
                    Quantity = cartItem.Quantity,
                    PriceAtPurchase = product.Price,
                    Status = OrderItemStatus.Pending,
                };

                order.OrderItems.Add(item);
                order.TotalAmount += product.Price * cartItem.Quantity;
            }

            // Deduct the order amount from the wallet
            await _walletRepository.PayAsync(wallet.Id, order.TotalAmount, $"Order payment for OrderId: {order.Id}");


            // Save order and clear only cart items
            _dbContext.CartItems.RemoveRange(cart.CartItems);

            cart.UpdatedAt = DateTime.UtcNow;

            _dbContext.Orders.Add(order);

            await _dbContext.SaveChangesAsync();

            // Group order items by seller
            var sellerItemGroups = order.OrderItems.GroupBy(oi => oi.SellerId);
            foreach (var group in sellerItemGroups)
            {
                var sellerId = group.Key;
                var seller = await _dbContext.Sellers
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.Id == sellerId);

                if (seller?.User != null)
                {
                    await _emailNotificationService.SendSellerOrderApprovalRequestEmail(seller.User, group.ToList(), order.Id);
                }
            }

            return order;
        }


        public async Task<Order> GetOrderByIdAsync(Guid orderId)
        {
            try
            {
                return await _dbContext.Orders
                    .Include(orderObj => orderObj.Customer)
                        .ThenInclude(customerObj => customerObj.User)
                    .Include(orderObj => orderObj.OrderItems)
                        .ThenInclude(orderItemObj => orderItemObj.Product)
                        .ThenInclude(orderItemObj => orderItemObj.Seller)
                    .FirstOrDefaultAsync(order => order.Id == orderId);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving order by id: " + ex.Message);
                return null;
            }
        }


        public async Task<List<Order>> GetOrdersByCustomerIdAsync(Guid customerId)
        {
            try
            {
                return await _dbContext.Orders
                    .Include(orderObj => orderObj.Customer)
                        .ThenInclude(customerObj => customerObj.User)
                    .Include(orderObj => orderObj.OrderItems)
                        .ThenInclude(orderItemObj => orderItemObj.Product)
                            .ThenInclude(orderItemObj => orderItemObj.Seller)
                                .ThenInclude(sellerObj => sellerObj.User)
                            .Where(order => order.CustomerId == customerId)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving customer by user id: " + ex.Message);
                return null;
            }
        }


        public async Task<List<OrderItem>> GetPendingOrderItemsBySellerAsync(Guid sellerId)
        {
            try
            {
                return await _dbContext.OrderItems.Include(orderItemObj => orderItemObj.Product)
                    .Include(orderItemObj => orderItemObj.Order)
                        .ThenInclude(orderObj => orderObj.Customer)
                            .ThenInclude(customerObj => customerObj.User)
                    .Where(orderItem => orderItem.SellerId == sellerId && orderItem.Status == OrderItemStatus.Pending)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving pending orders by seller id: " + ex.Message);
                return null;
            }
        }

        public async Task<List<Order>> GetOrdersBySellerIdAsync(Guid sellerId)
        {
            try
            {
                return await _dbContext.Orders
            .Where(order => order.OrderItems.Any(item => item.SellerId == sellerId))
            .Select(order => new Order
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                OrderDate = order.OrderDate,
                EstimatedDeliveryTime = order.EstimatedDeliveryTime,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                Customer = new Customer
                {
                    Id = order.Customer.Id,
                    User = new User
                    {
                        Id = order.Customer.User.Id,
                        FullName = order.Customer.User.FullName,
                        Email = order.Customer.User.Email
                    }
                },
                OrderItems = order.OrderItems
                    .Where(item => item.SellerId == sellerId)
                    .Select(item => new OrderItem
                    {
                        Id = item.Id,
                        OrderId = item.OrderId,
                        ProductId = item.ProductId,
                        SellerId = item.SellerId,
                        Quantity = item.Quantity,
                        PriceAtPurchase = item.PriceAtPurchase,
                        Status = item.Status,
                        Product = new Product
                        {
                            Id = item.Product.Id,
                            Name = item.Product.Name,
                            StockQuantity = item.Product.StockQuantity,
                        }
                    })
                    .ToList()
            })
            .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while retrieving orders by seller id: " + ex.Message);
                return null;
            }
        }


        public async Task<OrderItem> ApproveOrderItemAsync(Guid orderItemId)
        {
            try
            {
                var item = await _dbContext.OrderItems.Include(orderItemObj => orderItemObj.Order).ThenInclude(o => o.OrderItems)
                                                .Include(orderItemObj => orderItemObj.Product)
                                               .Include(orderItemObj => orderItemObj.Order.Customer).ThenInclude(customerObj => customerObj.User)
                                               .FirstOrDefaultAsync(orderItem => orderItem.Id == orderItemId);

                if (item == null)
                {
                    return null;
                }
                item.Status = OrderItemStatus.Approved;

                await _dbContext.SaveChangesAsync();

                await FinalizeOrderIfAllItemsProcessed(item.Order);
                return item;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while approving order: " + ex.Message);
                return null;
            }
        }


        public async Task<OrderItem> RejectOrderItemAsync(Guid orderItemId)
        {
            try
            {
                var item = await _dbContext.OrderItems.Include(oi => oi.Product)
                                               .Include(oi => oi.Order).ThenInclude(o => o.OrderItems)
                                               .Include(oi => oi.Order.Customer).ThenInclude(c => c.Wallet)
                                               .Include(oi => oi.Order.Customer).ThenInclude(c => c.User)
                                               .FirstOrDefaultAsync(oi => oi.Id == orderItemId);

                if (item == null)
                {
                    return null;
                }

                item.Status = OrderItemStatus.Rejected;

                item.Product.StockQuantity += item.Quantity; // Restore stock
                //await _walletRepository.RefundAmountToWalletAsync(item.Order.Customer.Wallet.Id, item.PriceAtPurchase * item.Quantity, item.OrderId, item.Product.Name);

                await _dbContext.SaveChangesAsync();
                await FinalizeOrderIfAllItemsProcessed(item.Order);

                return item;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while rejecting order: " + ex.Message);
                return null;
            }
            
        }


        private async Task FinalizeOrderIfAllItemsProcessed(Order order)
        {
            try
            {
                var allItemsProcessed = order.OrderItems.All(orderItemObj => orderItemObj.Status != OrderItemStatus.Pending);
                if (!allItemsProcessed)
                {
                    return;
                }

                var rejectedItems = order.OrderItems.Where(item => item.Status == OrderItemStatus.Rejected).ToList();
                var approvedItems = order.OrderItems.Where(item => item.Status == OrderItemStatus.Approved).ToList();

                if (rejectedItems.Count == order.OrderItems.Count)
                {
                    // update order status
                    order.Status = OrderStatus.Rejected;
                    await _dbContext.SaveChangesAsync();

                    // All items rejected
                    decimal totalRefund = rejectedItems.Sum(item => item.Quantity * item.PriceAtPurchase);


                    // refund all the money paid for ordered items
                    foreach (var rejectedItem in rejectedItems)
                    {
                        await _walletRepository.RefundAmountToWalletAsync(rejectedItem.Order.Customer.Wallet.Id, rejectedItem.PriceAtPurchase * rejectedItem.Quantity, rejectedItem.OrderId, rejectedItem.Product.Name);
                    }

                    await _emailNotificationService.SendCustomerOrderRejectedEmail(order.Customer.User, rejectedItems, totalRefund);
                }
                else if (approvedItems.Count == order.OrderItems.Count)
                {
                    // update order status
                    order.Status = OrderStatus.Approved;
                    await _dbContext.SaveChangesAsync();

                    // All items approved

                    //order.EstimatedDeliveryTime = DateTime.UtcNow.AddMinutes(new Random().Next(30, 61));
                    //await _dbContext.SaveChangesAsync();

                    await _emailNotificationService.SendCustomerOrderApprovedEmail(order.Customer.User, approvedItems);
                }
                else
                {
                    // update order status
                    order.Status = OrderStatus.PartiallyApproved;
                    await _dbContext.SaveChangesAsync();

                    // Partial approval (some approved, some rejected)
                    decimal totalRefund = rejectedItems.Sum(item => item.Quantity * item.PriceAtPurchase);

                    // refund all the money paid for ordered items
                    foreach (var rejectedItem in rejectedItems)
                    {
                        await _walletRepository.RefundAmountToWalletAsync(rejectedItem.Order.Customer.Wallet.Id, rejectedItem.PriceAtPurchase * rejectedItem.Quantity, rejectedItem.OrderId, rejectedItem.Product.Name);
                    }

                    await _emailNotificationService.SendCustomerOrderItemsRejectionEmail(order.Customer.User, rejectedItems, totalRefund);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred while finalizing order: " + ex.Message);
                return;
            }
            
        }
    }
}
