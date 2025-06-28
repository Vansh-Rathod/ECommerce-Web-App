using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SharedReference;
using SharedReference.Entities;

namespace ECommerceWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly ISellerRepository _sellerRepository;


        public OrderController(IOrderRepository orderRepository, ICustomerRepository customerRepository, ISellerRepository sellerRepository)
        {
            _orderRepository = orderRepository;
            _customerRepository = customerRepository;
            _sellerRepository = sellerRepository;
        }


        // PLACE ORDER
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> PlaceOrder()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customer = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }


            var order = await _orderRepository.PlaceOrderAsync(customer.Id);
            if (order == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to place order" });
            }

            var response = new
            {
                OrderId = order.Id,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer.User.FullName,
                CustomerEmail = order.Customer.User.Email,

                OrderDate = order.OrderDate,
                EstimatedDeliveryTime = order.EstimatedDeliveryTime,
                TotalAmount = order.TotalAmount,

                OrderedItems = order?.OrderItems.Select(orderItemObj => new
                {
                    OrderItemId = orderItemObj?.Id,
                    ProductId = orderItemObj?.ProductId,
                    ProductName = orderItemObj?.Product?.Name,
                    SellerId = orderItemObj?.SellerId,
                    SellerName = orderItemObj?.Seller.User?.FullName,
                    SellerEmail = orderItemObj?.Seller.User?.Email,
                    OrderedQuantity = orderItemObj?.Quantity,
                    PriceAtPurchase = orderItemObj?.PriceAtPurchase,
                    OrderItemStatus = orderItemObj?.Status
                })

            };

            return Ok(new APIResponse { Status = 200, Message = "Order placed successfully", Data = response });
        }


        // TODO: handle backend side pagination and also apply filter
        // GET CUSTOMER ORDERS
        [Authorize(Roles = "Customer")]
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customer = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (customer == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }


            var orders = await _orderRepository.GetOrdersByCustomerIdAsync(customer.Id);
            if (orders == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Failed to fetch orders" });
            }

            var response = orders.Select(orderObj => new
            {
                OrderId = orderObj.Id,
                CustomerId = orderObj.CustomerId,
                CustomerName = orderObj.Customer.User.FullName,
                CustomerEmail = orderObj.Customer.User.Email,

                OrderDate = orderObj.OrderDate,
                EstimatedDeliveryTime = orderObj.EstimatedDeliveryTime,
                OrderStatus = orderObj.Status,
                TotalAmount = orderObj.TotalAmount,

                OrderedItems = orderObj?.OrderItems.Select(orderItemObj => new
                {
                    OrderItemId = orderItemObj?.Id,
                    ProductId = orderItemObj?.ProductId,
                    ProductName = orderItemObj?.Product?.Name,
                    SellerId = orderItemObj?.SellerId,
                    SellerName = orderItemObj?.Seller.User?.FullName,
                    SellerEmail = orderItemObj?.Seller.User?.Email,
                    SellerStoreName = orderItemObj?.Seller?.StoreName,
                    OrderedQuantity = orderItemObj?.Quantity,
                    PriceAtPurchase = orderItemObj?.PriceAtPurchase,
                    OrderItemStatus = orderItemObj?.Status
                })

            });

            return Ok(new APIResponse { Status = 200, Message = "Orders fetched successfully", Data = response });
        }

        [Authorize(Roles = "Seller")]
        [HttpGet("seller/orders")]
        public async Task<IActionResult> GetSellerOrders()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var seller = await _sellerRepository.GetSellerByUserIdAsync(userGuid);
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Seller Not found" });
            }

            var orders = await _orderRepository.GetOrdersBySellerIdAsync(seller.Id);
            if (orders == null || !orders.Any())
            {
                return Ok(new APIResponse { Status = 404, Message = "No Orders Found" });
            }
            var response = orders.Select(orderObj => new
            {
                OrderId = orderObj?.Id,
                CustomerId = orderObj?.CustomerId,
                CustomerName = orderObj?.Customer?.User?.FullName,
                OrderDate = orderObj?.OrderDate,
                EstimatedDeliveryTime = orderObj?.EstimatedDeliveryTime,
                OrderAmount = orderObj?.TotalAmount,
                OrderStatus = orderObj?.Status,

                OrderItems = orderObj?.OrderItems.Select(orderItemObj => new
                {
                    OrderItemId = orderItemObj?.Id,
                    ProductId = orderItemObj?.ProductId,
                    ProductName = orderItemObj?.Product.Name,
                    ProductStockQuantity = orderItemObj?.Product.StockQuantity,
                    SellerId = orderItemObj?.SellerId,
                    OrderItemQuantity = orderItemObj?.Quantity,
                    PriceAtPurchase = orderItemObj?.PriceAtPurchase,
                    OrderItemStatus = orderItemObj?.Status,

                }),

            });

            return Ok(new APIResponse { Status = 200, Message = "Seller orders fetched successfully", Data = response });
        }


        [Authorize]
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrder(Guid orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Order Not found" });
            }

            var response = new
            {
                OrderId = order.Id,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer.User.FullName,
                CustomerEmail = order.Customer.User.Email,

                OrderDate = order.OrderDate,
                EstimatedDeliveryTime = order.EstimatedDeliveryTime,
                TotalAmount = order.TotalAmount,

                OrderedItems = order?.OrderItems.Select(orderItemObj => new
                {
                    OrderItemId = orderItemObj?.Id,
                    ProductId = orderItemObj?.ProductId,
                    ProductName = orderItemObj?.Product?.Name,
                    SellerId = orderItemObj?.SellerId,
                    SellerName = orderItemObj?.Seller.User?.FullName,
                    SellerEmail = orderItemObj?.Seller.User?.Email,
                    SellerStoreName = orderItemObj?.Seller?.StoreName,
                    OrderedQuantity = orderItemObj?.Quantity,
                    PriceAtPurchase = orderItemObj?.PriceAtPurchase,
                    OrderItemStatus = orderItemObj?.Status
                })

            };

            return Ok(new APIResponse { Status = 200, Message = "Order fetched successfully", Data = response });
        }


        [Authorize(Roles = "Seller")]
        [HttpGet("pending-items")]
        public async Task<IActionResult> GetPendingOrderItems()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var seller = await _sellerRepository.GetSellerByUserIdAsync(userGuid);
            if (seller == null)
            {
                return Ok(new APIResponse { Status = 404, Message = "Seller Not found" });
            }

            var items = await _orderRepository.GetPendingOrderItemsBySellerAsync(seller.Id);
            if(items == null || !items.Any())
            {
                return Ok(new APIResponse { Status = 404, Message = "No Pending Order Items Found" });
            }
            var response = items.Select(itemObj => new
            {
                OrderItemId = itemObj.Id,
                OrderId = itemObj.OrderId,
                
                ProductId = itemObj.ProductId,
                ProductName = itemObj.Product.Name,

                CustomerId = itemObj.Order.CustomerId,
                CustomerName = itemObj.Order.Customer.User.FullName,

                ProductPrice = itemObj.Product.Price,
                ProductStockQuantity = itemObj.Product.StockQuantity,

                QuantityIssued = itemObj.Quantity,
                PriceAtPurchase = itemObj.PriceAtPurchase,
                OrderStatus = itemObj.Status,

            });

            return Ok(new APIResponse { Status = 200, Message = "Pending order items for fetched successfully", Data = response });
        }




        [Authorize(Roles = "Seller")]
        [HttpPut("approve/{orderItemId}")]
        public async Task<IActionResult> ApproveOrderItem(Guid orderItemId)
        {
            // using orderItemId check that orderItem is already approved or not

            var item = await _orderRepository.ApproveOrderItemAsync(orderItemId);
            if (item == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to approve order" });
            }

            var response = new
            {
                OrderItemId = item.Id,
                OrderId = item.OrderId,

                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductPrice = item.Product.Price,
                ProductStockQuantity = item.Product.StockQuantity,

                QuantityIssued = item.Quantity,
                PriceAtPurchase = item.PriceAtPurchase,
                OrderStatus = item.Status,

            };

            return Ok(new APIResponse { Status = 200, Message = "Order item approved successfully", Data = response });
        }


        [Authorize(Roles = "Seller")]
        [HttpPut("reject/{orderItemId}")]
        public async Task<IActionResult> RejectOrderItem(Guid orderItemId)
        {
            // using orderItemId check that orderItem is already rejected or not

            var item = await _orderRepository.RejectOrderItemAsync(orderItemId);
            if (item == null)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to reject order item" });
            }

            var response = new
            {
                OrderItemId = item.Id,
                OrderId = item.OrderId,

                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductPrice = item.Product.Price,
                ProductStockQuantity = item.Product.StockQuantity,

                QuantityIssued = item.Quantity,
                PriceAtPurchase = item.PriceAtPurchase,
                OrderStatus = item.Status,

            };

            return Ok(new APIResponse { Status = 200, Message = "Order item rejected successfully", Data = response });
        }


    }
}
