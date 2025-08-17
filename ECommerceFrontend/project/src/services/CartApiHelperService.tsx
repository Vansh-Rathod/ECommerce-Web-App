import { CommonResponse } from "../Types";
import api from "./api";

const cartController = import.meta.env.VITE_CART_CONTROLLER;

// Get cart with cart items
export const GetCart = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`${cartController}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const cartData = response.data.data;
    if (response.data.status !== 200 || !cartData || cartData === null) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: cartData,
    };
  } catch (error) {
    console.error("Something went wrong while fetching cart: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching cart",
    };
  } finally {
    console.log("GetCart API call completed");
  }
};

// Add product to cart
export const AddProductToCart = async (
  productId: string,
  quantity: number
): Promise<CommonResponse<any>> => {
  if (!productId || quantity <= 0) {
    return {
      success: false,
      error: "Invalid product or quantity",
    };
  }

  try {
    const requestBody = {
      productId: productId,
      quantity: quantity,
    };
    const response = await api.post(`${cartController}/add`, requestBody);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const addToCartData = response.data.data
    if (response.data.status !== 200 && !addToCartData && addToCartData === null) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Something went wrong while adding product to cart: ", error);
    return {
      success: false,
      error: "Something went wrong while adding product to cart",
    };
  } finally {
    console.log("AddProductToCart API call completed");
  }
};

// Remove product from cart
export const RemoveProductFromCart = async (
  productId: string,
  quantity: number
): Promise<CommonResponse<any>> => {
  if (!productId || quantity <= 0) {
    return {
      success: false,
      error: "Invalid product or quantity",
    };
  }

  try {
    const requestBody = {
      productId: productId,
      quantity: quantity,
    };

    const response = await api.put(`${cartController}/remove`, requestBody);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    if (response.data.status !== 200) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error(
      "Something went wrong while removing product from cart: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while removing product from cart",
    };
  } finally {
    console.log("RemoveProductFromCart API call completed");
  }
};

// CLear cart
export const ClearCart = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.delete(`${cartController}/clear`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    if (response.data.status !== 200) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Something went wrong while clearing cart: ", error);
    return {
      success: false,
      error: "Something went wrong while clearing cart",
    };
  } finally {
    console.log("ClearCart API call completed");
  }
};
