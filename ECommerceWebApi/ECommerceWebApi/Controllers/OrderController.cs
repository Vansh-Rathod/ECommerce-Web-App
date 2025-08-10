using DataAccessLayer.Interfaces;
using DataAccessLayer.Repositories;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
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

            var customerResult = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (!customerResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }


            var orderResult = await _orderRepository.PlaceOrderAsync(customerResult.Data.Id);
            if (!orderResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to place order" });
            }

            var response = new
            {
                OrderId = orderResult.Data.Id,
                CustomerId = orderResult.Data.CustomerId,
                CustomerName = orderResult.Data.Customer.User.FullName,
                CustomerEmail = orderResult.Data.Customer.User.Email,

                OrderDate = orderResult.Data.OrderDate,
                EstimatedDeliveryTime = orderResult.Data.EstimatedDeliveryTime,
                TotalAmount = orderResult.Data.TotalAmount,

                OrderedItems = orderResult.Data?.OrderItems.Select(orderItemObj => new
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
        public async Task<IActionResult> GetOrders( [FromQuery] int? filterByYear, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "" )
        {
            int year = filterByYear ?? DateTime.Now.Year;

            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var customerResult = await _customerRepository.GetCustomerByUserIdAsync(userGuid);
            if (!customerResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Customer Not found" });
            }


            var ordersResult = await _orderRepository.GetOrdersByCustomerIdAsync(customerResult.Data.Id, pageNumber, pageSize, searchText, year);
            if (!ordersResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Failed to fetch orders" });
            }

            var orders = ordersResult.Data.Items.Select(orderObj => new
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

            var response = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalOrders = ordersResult.Data.TotalRecords,
                Orders = orders
            };

            return Ok(new APIResponse { Status = 200, Message = "Orders fetched successfully", Data = response });
        }


        [Authorize(Roles = "Seller")]
        [HttpGet("seller/orders")]
        public async Task<IActionResult> GetSellerOrders( [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "", [FromQuery] string filterByOrderStatus = "all" )
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var sellerResult = await _sellerRepository.GetSellerByUserIdAsync(userGuid);
            if (!sellerResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Seller Not found" });
            }

            var ordersResult = await _orderRepository.GetOrdersBySellerIdAsync(sellerResult.Data.Id, pageNumber, pageSize, searchText, filterByOrderStatus);
            if (!ordersResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "No Orders Found" });
            }

            var orders = ordersResult.Data.Items.Select(orderObj => new
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

            var response = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalOrders = ordersResult.Data.TotalRecords,
                Orders = orders
            };

            return Ok(new APIResponse { Status = 200, Message = "Seller orders fetched successfully", Data = response });
        }


        [Authorize(Roles = "Admin,Seller,Customer")]
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrder(Guid orderId)
        {
            var orderResult = await _orderRepository.GetOrderByIdAsync(orderId);
            if (!orderResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Order Not found" });
            }

            var response = new
            {
                OrderId = orderResult.Data.Id,
                CustomerId = orderResult.Data.CustomerId,
                CustomerName = orderResult.Data.Customer.User.FullName,
                CustomerEmail = orderResult.Data.Customer.User.Email,

                OrderDate = orderResult.Data.OrderDate,
                EstimatedDeliveryTime = orderResult.Data.EstimatedDeliveryTime,
                TotalAmount = orderResult.Data.TotalAmount,

                OrderedItems = orderResult.Data?.OrderItems.Select(orderItemObj => new
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
        public async Task<IActionResult> GetPendingOrderItems( [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchText = "" )
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return Ok(new APIResponse { Status = 401, Message = "Token is Invalid or Forbidden. Cannot find User Id" });
            }

            var sellerResult = await _sellerRepository.GetSellerByUserIdAsync(userGuid);
            if (!sellerResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "Seller Not found" });
            }

            var orderItemsResult = await _orderRepository.GetPendingOrderItemsBySellerAsync(sellerResult.Data.Id, pageNumber, pageSize, searchText);
            
            if(!orderItemsResult.Success)
            {
                return Ok(new APIResponse { Status = 404, Message = "No Pending Order Items Found" });
            }

            var orderItems = orderItemsResult.Data.Items.Select(itemObj => new
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

            var response = new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalOrderItems = orderItemsResult.Data.TotalRecords,
                OrderItems = orderItems
            };

            return Ok(new APIResponse { Status = 200, Message = "Pending order items for fetched successfully", Data = response });
        }




        [Authorize(Roles = "Seller")]
        [HttpPut("approve/{orderItemId}")]
        public async Task<IActionResult> ApproveOrderItem(Guid orderItemId)
        {
            var orderItemResult = await _orderRepository.ApproveOrderItemAsync(orderItemId);
            if (!orderItemResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to approve order" });
            }

            var response = new
            {
                OrderItemId = orderItemResult.Data.Id,
                OrderId = orderItemResult.Data.OrderId,

                ProductId = orderItemResult.Data.ProductId,
                ProductName = orderItemResult.Data.Product.Name,
                ProductPrice = orderItemResult.Data.Product.Price,
                ProductStockQuantity = orderItemResult.Data.Product.StockQuantity,

                QuantityIssued = orderItemResult.Data.Quantity,
                PriceAtPurchase = orderItemResult.Data.PriceAtPurchase,
                OrderStatus = orderItemResult.Data.Status,

            };

            return Ok(new APIResponse { Status = 200, Message = "Order item approved successfully", Data = response });
        }


        [Authorize(Roles = "Seller")]
        [HttpPut("reject/{orderItemId}")]
        public async Task<IActionResult> RejectOrderItem(Guid orderItemId)
        {
            var orderItemResult = await _orderRepository.RejectOrderItemAsync(orderItemId);
            if (!orderItemResult.Success)
            {
                return Ok(new APIResponse { Status = 400, Message = "Failed to reject order item" });
            }

            var response = new
            {
                OrderItemId = orderItemResult.Data.Id,
                OrderId = orderItemResult.Data.OrderId,

                ProductId = orderItemResult.Data.ProductId,
                ProductName = orderItemResult.Data.Product.Name,
                ProductPrice = orderItemResult.Data.Product.Price,
                ProductStockQuantity = orderItemResult.Data.Product.StockQuantity,

                QuantityIssued = orderItemResult.Data.Quantity,
                PriceAtPurchase = orderItemResult.Data.PriceAtPurchase,
                OrderStatus = orderItemResult.Data.Status,

            };

            return Ok(new APIResponse { Status = 200, Message = "Order item rejected successfully", Data = response });
        }


    }
}
