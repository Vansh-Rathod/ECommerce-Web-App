import { CommonResponse } from "../Types";
import api from "./api";

const orderController = import.meta.env.VITE_ORDER_CONTROLLER;

export const PlaceOrder = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.post(`/${orderController}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const placeOrderData = response.data.data;
    if (
      response.data.status != 200 ||
      !placeOrderData ||
      placeOrderData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: placeOrderData,
    };
  } catch (error) {
    console.error("Something went wrong while fetching placing order: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching placing order",
    };
  } finally {
    console.log("PlaceOrder API call completed");
  }
};

// Get all orders
export const GetOrders = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  filterByYear: number
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`${orderController}`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
        filterByYear,
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const ordersResponse = response.data.data;
    if (
      response.data.status !== 200 ||
      !ordersResponse ||
      ordersResponse === null
    ) {
      return {
        success: false,
        error: response.data.message,
      };
    }

    const ordersData = response.data.data.orders;
    const totalOrdersData = response.data.data.totalOrders;

    return {
      success: true,
      message: response.data.message,
      data: { orders: ordersData, totalOrders: totalOrdersData },
    };
  } catch (error) {
    console.error("Something went wrong while fetching orders: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching orders",
    };
  } finally {
    console.log("GetOrders API call completed");
  }
};

// Get all seller orders
export const GetSellerOrders = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  filterByOrderStatus: string
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`${orderController}/seller/orders`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
        filterByOrderStatus,
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const ordersResponse = response.data.data;
    if (
      response.data.status !== 200 ||
      !ordersResponse ||
      ordersResponse === null
    ) {
      return {
        success: false,
        error: response.data.message,
      };
    }

    const ordersData = response.data.data.orders;
    const totalOrdersData = response.data.data.totalOrders;

    return {
      success: true,
      message: response.data.message,
      data: { orders: ordersData, totalOrders: totalOrdersData },
    };
  } catch (error) {
    console.error("Something went wrong while fetching orders: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching orders",
    };
  } finally {
    console.log("GetSellerOrders API call completed");
  }
};

// Get order by orderId
export const GetOrderById = async (
  orderId: string
): Promise<CommonResponse<any>> => {
  // console.log("Order ID: ", orderId);
  if (!orderId) {
    console.error("Order Id not found");
    return { success: false, error: "Order Id not found" };
  }
  try {
    const response = await api.get(`/${orderController}/${orderId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const orderByIdData = response.data.data;
    if (
      response.data.status != 200 ||
      !orderByIdData ||
      orderByIdData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      data: orderByIdData,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Something went wrong while fetching order details: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching order details",
    };
  } finally {
    console.log("GetOrderById API call completed");
  }
};

// Get all pending order items
export const GetPendingOrderItems = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`${orderController}/pending-items`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const orderItemsResponse = response.data.data;
    if (
      response.data.status !== 200 ||
      !orderItemsResponse ||
      orderItemsResponse === null
    ) {
      return {
        success: false,
        error: response.data.message,
      };
    }

    const orderItemsData = response.data.data.orderItems;
    const totalOrderItemsData = response.data.data.totalOrderItems;

    return {
      success: true,
      message: response.data.message,
      data: {
        orderItems: orderItemsData,
        totalOrderItems: totalOrderItemsData,
      },
    };
  } catch (error) {
    console.error(
      "Something went wrong while fetching pending order items: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while fetching pending order items",
    };
  } finally {
    console.log("GetPendingOrderItems API call completed");
  }
};

// Approve order item
export const ApproveOrderItem = async (
  orderItemId: string
): Promise<CommonResponse<any>> => {
  // console.log("OrderItem ID: ", orderItemId);
  if (!orderItemId) {
    console.error("OrderItem Id not found");
    return { success: false, error: "OrderItem Id not found" };
  }
  try {
    const response = await api.put(`${orderController}/approve/${orderItemId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const approvedOrderItemData = response.data.data;
    if (
      response.data.status !== 200 ||
      !approvedOrderItemData ||
      approvedOrderItemData === null
    ) {
      return {
        success: false,
        error: response.data.message,
      };
    }

    return {
      success: true,
      message: response.data.message,
      data: approvedOrderItemData,
    };
  } catch (error) {
    console.error("Something went wrong while approving order item: ", error);
    return {
      success: false,
      error: "Something went wrong while approving order item",
    };
  } finally {
    console.log("ApproveOrderItem API call completed");
  }
};

// Reject order item
export const RejectOrderItem = async (
  orderItemId: string
): Promise<CommonResponse<any>> => {
  // console.log("OrderItem ID: ", orderItemId);
  if (!orderItemId) {
    console.error("OrderItem Id not found");
    return { success: false, error: "OrderItem Id not found" };
  }
  try {
    const response = await api.put(`${orderController}/reject/${orderItemId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const rejectedOrderItemData = response.data.data;
    if (
      response.data.status !== 200 ||
      !rejectedOrderItemData ||
      rejectedOrderItemData === null
    ) {
      return {
        success: false,
        error: response.data.message,
      };
    }

    return {
      success: true,
      message: response.data.message,
      data: rejectedOrderItemData,
    };
  } catch (error) {
    console.error("Something went wrong while rejecting order item: ", error);
    return {
      success: false,
      error: "Something went wrong while rejecting order item",
    };
  } finally {
    console.log("RejectOrderItem API call completed");
  }
};
