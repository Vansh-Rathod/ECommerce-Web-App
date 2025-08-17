using DataAccessLayer.Data;
using DataAccessLayer.Interfaces;
using GenericServices.Interfaces;
using MailKit.Search;
using Microsoft.EntityFrameworkCore;
using SharedReference;
using SharedReference.Entities;
using System;
using System.Buffers;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories
{
    public class OrderRepository : IOrderRepository
    {

        private readonly ApplicationDbContext _dbContext;
        private readonly IWalletRepository _walletRepository;
        private readonly ILoggerRepository _loggerRepository;
        private readonly IEmailTemplates _emailTemplateService;
        private readonly IEmailService _emailService;

        public OrderRepository( ApplicationDbContext dbContext, IWalletRepository walletRepository, ILoggerRepository loggerRepository, IEmailTemplates emailTemplateService, IEmailService emailService )
        {
            _dbContext = dbContext;
            _walletRepository = walletRepository;
            _loggerRepository = loggerRepository;
            _emailTemplateService = emailTemplateService;
            _emailService = emailService;
        }

        public async Task<CommonResponse<Order>> PlaceOrderAsync( Guid customerId )
        {
            try
            {
                var cart = await _dbContext.Carts.Include(cartObj => cartObj.CartItems).
                                                    ThenInclude(cartItemObj => cartItemObj.Product)
                                                    .FirstOrDefaultAsync(cart => cart.CustomerId == customerId);
                if(cart == null)
                {
                    return CommonResponse<Order>.FailureResponse(
                       new List<string> { $"Cart not found for customer id: {customerId}" },
                       "Cart not found.");
                }

                if(!cart.CartItems.Any())
                {
                    return CommonResponse<Order>.FailureResponse(
                       new List<string> { "Cart does not have cart items." },
                       "Please add products in cart to checkout.");
                }

                var validationErrors = new List<string>();

                // First pass: validate stock availability
                foreach(var cartItem in cart.CartItems)
                {
                    var product = cartItem.Product;
                    if(product.StockQuantity < cartItem.Quantity)
                    {
                        validationErrors.Add($"Insufficient stock for {product.Name} (Available: {product.StockQuantity}, Requested: {cartItem.Quantity})");
                    }
                }

                if(validationErrors.Any())
                {
                    return CommonResponse<Order>.FailureResponse(
                       validationErrors,
                       "Cart contains products that are out of stock quantity.");
                }

                // Check customer wallet balance before placing order
                var wallet = await _walletRepository.GetWalletByCustomerIdAsync(customerId);

                if(!wallet.Success)
                {
                    return CommonResponse<Order>.FailureResponse(
                       new List<string> { $"Wallet not found for customer id: {customerId}" },
                       "Wallet not found");
                }

                var totalOrderAmount = cart.CartItems.Sum(cartItemObj => cartItemObj.Product.Price * cartItemObj.Quantity);
                if(wallet.Data.Balance < totalOrderAmount)
                {
                    return CommonResponse<Order>.FailureResponse(
                       new List<string> { $"Customer does not have sufficient balance. CustomerId: {customerId}. Current Balance: {wallet.Data.Balance}" },
                       "Insufficient wallet balance.");
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

                foreach(var cartItem in cart.CartItems)
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
                await _walletRepository.PayAsync(wallet.Data.Id, order.TotalAmount, $"Order payment for OrderId: {order.Id}");


                // Save order and clear only cart items
                _dbContext.CartItems.RemoveRange(cart.CartItems);

                cart.UpdatedAt = DateTime.UtcNow;

                _dbContext.Orders.Add(order);

                await _dbContext.SaveChangesAsync();

                // Group order items by seller
                var sellerItemGroups = order.OrderItems.GroupBy(orderItemObj => orderItemObj.SellerId);
                foreach(var group in sellerItemGroups)
                {
                    var sellerId = group.Key;
                    var seller = await _dbContext.Sellers
                        .Include(s => s.User)
                        .FirstOrDefaultAsync(s => s.Id == sellerId);

                    if(seller?.User != null)
                    {
                        //await _emailNotificationService.SendSellerOrderApprovalRequestEmail(seller.User, group.ToList(), order.Id);

                        var htmlBodyResult = _emailTemplateService.GenerateOrderApprovalRequestEmailTemplate(seller.User, group.ToList(), order.Id);
                        await _emailService.SendEmailAsync(seller.User.Email, "Order Alert: A Customer Purchased Your Product", htmlBodyResult.Data, null);
                    }
                }

                return CommonResponse<Order>.SuccessResponse(
                        order,
                        "Order placed successfully");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while placing order for customer id.", SharedReference.Enums.Enum.LogLevel.Error, "OrderRepository.PlaceOrderAsync()", ex, null, null, new Dictionary<string, object> { { "CustomerId", customerId } });
                return CommonResponse<Order>.FailureResponse(
                       new List<string> { $"Exception occurred while placing order for customer id." },
                       "Failed to place order");
            }
        }


        public async Task<CommonResponse<Order>> GetOrderByIdAsync( Guid orderId )
        {
            try
            {
                var order = await _dbContext.Orders
                    .Include(orderObj => orderObj.Customer)
                        .ThenInclude(customerObj => customerObj.User)
                    .Include(orderObj => orderObj.OrderItems)
                        .ThenInclude(orderItemObj => orderItemObj.Product)
                        .ThenInclude(orderItemObj => orderItemObj.Seller)
                    .FirstOrDefaultAsync(order => order.Id == orderId);

                if(order != null)
                {
                    return CommonResponse<Order>.SuccessResponse(
                        order,
                        "Order fetched successfully");
                }

                return CommonResponse<Order>.FailureResponse(
                       new List<string> { $"Order not found by order id: {orderId}." },
                       "Order not found");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving order by order id: {orderId}.", SharedReference.Enums.Enum.LogLevel.Error, "OrderRepository.GetOrderByIdAsync()", ex, null, null, new Dictionary<string, object> { { "OrderId", orderId } });
                return CommonResponse<Order>.FailureResponse(
                       new List<string> { $"Exception occurred while retrieving order by order id: {orderId}." },
                       "Failed to fetch order");
            }
        }


        public async Task<CommonResponse<PagedResult<Order>>> GetOrdersByCustomerIdAsync( Guid customerId, int pageNumber, int pageSize, string searchText, int filterByYear )
        {
            try
            {
                var query = _dbContext.Orders
            .Include(order => order.Customer)
                .ThenInclude(customer => customer.User)
            .Include(order => order.OrderItems)
                .ThenInclude(orderItem => orderItem.Product)
                    .ThenInclude(product => product.Seller)
                        .ThenInclude(seller => seller.User)
            .Where(order => order.CustomerId == customerId);

                // Apply year filter if specified
                if(filterByYear > 0)
                {
                    query = query.Where(order => order.OrderDate.Year == filterByYear);
                }

                // Apply search filter
                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(order =>
                        order.OrderItems.Any(item =>
                            item.Product.Name.Contains(searchText)
                        //item.Product.Seller.User.FullName.Contains(searchText)
                        )
                    );
                }

                var totalRecords = await query.CountAsync();

                var pagedOrders = await query
                    .OrderByDescending(order => order.OrderDate)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var result = new PagedResult<Order>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = pagedOrders,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<Order>>.SuccessResponse(result, "Orders fetched successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving orders for customer id: {customerId}.", SharedReference.Enums.Enum.LogLevel.Error, "OrderRepository.GetOrdersByCustomerIdAsync()", ex, null, null, new Dictionary<string, object> { { "CustomerId", customerId } });
                return CommonResponse<PagedResult<Order>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving orders for customer id: {customerId}." },
                  "Failed to fetch orders"
                  );
            }
        }


        public async Task<CommonResponse<PagedResult<Order>>> GetOrdersBySellerIdAsync( Guid sellerId, int pageNumber, int pageSize, string searchText, string filterByOrderStatus )
        {
            try
            {
                var query = _dbContext.Orders
                                .Include(order => order.Customer)
                                    .ThenInclude(customer => customer.User)
                                .Include(order => order.OrderItems)
                                    .ThenInclude(orderItem => orderItem.Product)
                                .Where(order => order.OrderItems.Any(item => item.SellerId == sellerId));

                // Filter by status if provided
                if(!string.IsNullOrWhiteSpace(filterByOrderStatus) && !filterByOrderStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
                {
                    Enum.TryParse<OrderStatus>(filterByOrderStatus, true, out var parsedStatus);
                    {
                        int statusValue = (int)parsedStatus;
                        query = query.Where(order => (int)order.Status == statusValue);

                    }
                }

                // Filter by search text on customer name or product name or order price
                //if(!string.IsNullOrWhiteSpace(searchText))
                //{
                //    searchText = searchText.ToLower();
                //    query = query.Where(order =>
                //        order.TotalAmount.ToString().Contains(searchText) ||
                //        order.Customer.User.FullName.ToLower().Contains(searchText) ||
                //        order.OrderItems.Any(orderItemObj => orderItemObj.Product.Name.ToLower().Contains(searchText)));
                //}

                decimal searchValue;
                if(decimal.TryParse(searchText, out searchValue))
                {
                    query = query.Where(order =>
                        order.TotalAmount == searchValue ||
                        order.TotalAmount.ToString().Contains(searchText) ||
                        order.Customer.User.FullName.ToLower().Contains(searchText) ||
                        order.OrderItems.Any(o => o.Product.Name.ToLower().Contains(searchText))
                    );
                }
                else
                {
                    query = query.Where(order =>
                        order.Customer.User.FullName.ToLower().Contains(searchText) ||
                        order.OrderItems.Any(o => o.Product.Name.ToLower().Contains(searchText))
                    );
                }


                var totalRecords = await query.CountAsync();

                var orders = await query
                    .OrderByDescending(order => order.OrderDate)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
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
                                    Price = item.Product.Price,
                                    ImageUrl = item.Product.ImageUrl,
                                }
                            }).ToList()
                    })
                    .ToListAsync();

                var pagedResult = new PagedResult<Order>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = orders,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<Order>>.SuccessResponse(
                    pagedResult,
                    "Orders fetched successfully"
                );
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync(
            $"Exception occurred while retrieving orders by seller id: {sellerId}.",
            SharedReference.Enums.Enum.LogLevel.Error,
            "OrderRepository.GetOrdersBySellerIdAsync()",
            ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } }
        );

                return CommonResponse<PagedResult<Order>>.FailureResponse(
                    new List<string> { $"Exception occurred while retrieving orders by seller id: {sellerId}." },
                    "Failed to fetch orders"
                );
            }
        }

        public async Task<CommonResponse<PagedResult<OrderItem>>> GetPendingOrderItemsBySellerAsync( Guid sellerId, int pageNumber, int pageSize, string searchText )
        {
            try
            {
                var query = _dbContext.OrderItems
                        .Include(orderItem => orderItem.Product)
                        .Include(orderItem => orderItem.Order)
                            .ThenInclude(order => order.Customer)
                                .ThenInclude(customer => customer.User)
                        .Where(orderItem => orderItem.SellerId == sellerId && orderItem.Status == OrderItemStatus.Pending);

                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(orderItem =>
                        orderItem.Product.Name.Contains(searchText));
                    //orderItem.Order.Customer.User.FullName.Contains(searchText) ||
                    //orderItem.Order.Customer.User.Email.Contains(searchText));
                }

                var totalRecords = await query.CountAsync();

                var pagedItems = await query
                    .OrderByDescending(x => x.Order.OrderDate)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var result = new PagedResult<OrderItem>
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Items = pagedItems,
                    TotalRecords = totalRecords
                };

                return CommonResponse<PagedResult<OrderItem>>.SuccessResponse(result, "Pending order items fetched successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while retrieving pending orders for seller id: {sellerId}.", SharedReference.Enums.Enum.LogLevel.Error, "OrderRepository.GetPendingOrderItemsBySellerAsync()", ex, null, null, new Dictionary<string, object> { { "SellerId", sellerId } });
                return CommonResponse<PagedResult<OrderItem>>.FailureResponse(
                  new List<string> { $"Exception occurred while retrieving pending orders items for seller id: {sellerId}." },
                  "Failed to fetch pending orders items."
              );
            }
        }

        public async Task<CommonResponse<OrderItem>> ApproveOrderItemAsync( Guid orderItemId )
        {
            try
            {
                var item = await _dbContext.OrderItems
            .Include(orderItem => orderItem.Order)
                .ThenInclude(order => order.OrderItems)
            .Include(orderItem => orderItem.Product)
            .Include(orderItem => orderItem.Order.Customer)
                .ThenInclude(customer => customer.User)
            .FirstOrDefaultAsync(orderItem => orderItem.Id == orderItemId);

                if(item == null)
                {
                    return CommonResponse<OrderItem>.FailureResponse(
                        new List<string> { $"Order item with ID {orderItemId} not found." },
                        "Order Item not found");
                }

                if(item.Status != OrderItemStatus.Pending)
                {
                    return CommonResponse<OrderItem>.FailureResponse(
                        new List<string> { "This item has already been processed." },
                        $"Item is already {item.Status}");
                }

                item.Status = OrderItemStatus.Approved;
                await _dbContext.SaveChangesAsync();

                // Finalize order if all items are either approved or rejected
                await FinalizeOrderIfAllItemsProcessed(item.Order);

                return CommonResponse<OrderItem>.SuccessResponse(item, "Order item approved successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while approving order item, orderItem id: {orderItemId}.", SharedReference.Enums.Enum.LogLevel.Error, "OrderRepository.ApproveOrderItemAsync()", ex, null, null, new Dictionary<string, object> { { "OrderItemId", orderItemId } });
                return CommonResponse<OrderItem>.FailureResponse(
                  new List<string> { $"Exception occurred while approving order item, orderItem id: {orderItemId}." },
                  "Failed to approve order item."
                  );
            }
        }


        public async Task<CommonResponse<OrderItem>> RejectOrderItemAsync( Guid orderItemId )
        {
            try
            {
                var item = await _dbContext.OrderItems
            .Include(oi => oi.Product)
            .Include(oi => oi.Order)
                .ThenInclude(o => o.OrderItems)
            .Include(oi => oi.Order.Customer)
                .ThenInclude(c => c.Wallet)
            .Include(oi => oi.Order.Customer)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(oi => oi.Id == orderItemId);

                if(item == null)
                {
                    return CommonResponse<OrderItem>.FailureResponse(
                        new List<string> { $"Order item with ID {orderItemId} not found." },
                        "Item not found");
                }

                if(item.Status != OrderItemStatus.Pending)
                {
                    return CommonResponse<OrderItem>.FailureResponse(
                        new List<string> { "This item has already been processed." },
                        $"Item is already {item.Status}");
                }

                // Reject item
                item.Status = OrderItemStatus.Rejected;

                // Restore stock quantity
                item.Product.StockQuantity += item.Quantity;

                // Save changes to item and product
                await _dbContext.SaveChangesAsync();

                //await _walletRepository.RefundAmountToWalletAsync(item.Order.Customer.Wallet.Id, item.PriceAtPurchase * item.Quantity, item.OrderId, item.Product.Name);

                // Check if order needs to be finalized
                await FinalizeOrderIfAllItemsProcessed(item.Order);

                return CommonResponse<OrderItem>.SuccessResponse(item, "Order item rejected successfully.");
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while rejecting order item, orderItem id: {orderItemId}.", SharedReference.Enums.Enum.LogLevel.Error, "OrderRepository.RejectOrderItemAsync()", ex, null, null, new Dictionary<string, object> { { "OrderItemId", orderItemId } });
                return CommonResponse<OrderItem>.FailureResponse(
                  new List<string> { $"Exception occurred while rejecting order item, orderItem id: {orderItemId}." },
                  "Failed to reject order item."
                  );
            }

        }


        private async Task FinalizeOrderIfAllItemsProcessed( Order order )
        {
            try
            {
                var allItemsProcessed = order.OrderItems.All(orderItemObj => orderItemObj.Status != OrderItemStatus.Pending);
                if(!allItemsProcessed)
                {
                    return;
                }

                var rejectedItems = order.OrderItems.Where(item => item.Status == OrderItemStatus.Rejected).ToList();
                var approvedItems = order.OrderItems.Where(item => item.Status == OrderItemStatus.Approved).ToList();

                if(rejectedItems.Count == order.OrderItems.Count)
                {
                    // update order status
                    order.Status = OrderStatus.Rejected;
                    await _dbContext.SaveChangesAsync();

                    // All items rejected
                    decimal totalRefund = rejectedItems.Sum(item => item.Quantity * item.PriceAtPurchase);


                    // refund all the money paid for ordered items
                    foreach(var rejectedItem in rejectedItems)
                    {
                        await _walletRepository.RefundAmountToWalletAsync(rejectedItem.Order.Customer.Wallet.Id, rejectedItem.PriceAtPurchase * rejectedItem.Quantity, rejectedItem.OrderId, rejectedItem.Product.Name);
                    }

                    //await _emailNotificationService.SendCustomerOrderRejectedEmail(order.Customer.User, rejectedItems, totalRefund);

                    var htmlBodyResult = _emailTemplateService.GenerateOrderRejectedEmailTemplate(order.Customer.User.FullName, rejectedItems, totalRefund, order.Id);
                    await _emailService.SendEmailAsync(order.Customer.User.Email, "Your Order has been Rejected", htmlBodyResult.Data, null);
                }
                else if(approvedItems.Count == order.OrderItems.Count)
                {
                    // update order status
                    order.Status = OrderStatus.Approved;
                    await _dbContext.SaveChangesAsync();

                    // All items approved

                    //order.EstimatedDeliveryTime = DateTime.UtcNow.AddMinutes(new Random().Next(30, 61));
                    //await _dbContext.SaveChangesAsync();

                    //await _emailNotificationService.SendCustomerOrderApprovedEmail(order.Customer.User, approvedItems);

                    // TODO: Make INVOCIE PDF Here and send it in attachments
                    var htmlBodyResult = _emailTemplateService.GenerateOrderApprovedEmailTemplate(order.Customer.User.FullName, approvedItems, order.Id);
                    await _emailService.SendEmailAsync(order.Customer.User.Email, "Your Order has been Approved", htmlBodyResult.Data, null);
                }
                else
                {
                    // update order status
                    order.Status = OrderStatus.PartiallyApproved;
                    await _dbContext.SaveChangesAsync();

                    // Partial approval (some approved, some rejected)
                    decimal totalRefund = rejectedItems.Sum(item => item.Quantity * item.PriceAtPurchase);

                    // refund all the money paid for ordered items
                    foreach(var rejectedItem in rejectedItems)
                    {
                        await _walletRepository.RefundAmountToWalletAsync(rejectedItem.Order.Customer.Wallet.Id, rejectedItem.PriceAtPurchase * rejectedItem.Quantity, rejectedItem.OrderId, rejectedItem.Product.Name);
                    }

                    //await _emailNotificationService.SendCustomerOrderItemsRejectionEmail(order.Customer.User, rejectedItems, totalRefund);

                    // TODO: Make INVOCIE PDF Here and send it in attachments
                    var htmlBodyResult = _emailTemplateService.GeneratePartialOrderApprovedEmailTemplate(order.Customer.User.FullName, approvedItems, rejectedItems, totalRefund, order.Id);
                    await _emailService.SendEmailAsync(order.Customer.User.Email, "Your Order has been Partially Approved", htmlBodyResult.Data, null);
                }
            }
            catch(Exception ex)
            {
                await _loggerRepository.LogAsync($"Exception occurred while finalizing order.", SharedReference.Enums.Enum.LogLevel.Error, "OrderRepository.FinalizeOrderIfAllItemsProcessed()", ex, null, null, new Dictionary<string, object> { { "Order", order } });
                //return CommonResponse<object>.FailureResponse(
                //  new List<string> { $"Exception occurred while finalizing order." },
                //  "Failed to finalize order."
                //  );
            }

        }
    }
}
