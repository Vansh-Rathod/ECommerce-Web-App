import { CommonResponse } from "../Types";
import api from "./api";

const productController = import.meta.env.VITE_PRODUCT_CONTROLLER;

// Get all products
export const GetProducts = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  sortField: string,
  sortOrder: string,
  filterByPrice: string,
  filterByStatus: string
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`/${productController}/products`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
        sortField,
        sortOrder,
        filterByPrice,
        filterByStatus,
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const productsResponse = response.data.data;
    if (
      response.data.status !== 200 ||
      !productsResponse ||
      productsResponse === null
    ) {
      return { success: false, error: response.data.message };
    }

    const productsData = response.data.data.products;
    const totalProductsData = response.data.data.totalProducts;

    return {
      success: true,
      data: { products: productsData, totalProducts: totalProductsData },
    };
  } catch (error) {
    console.error("Something went wrong while fetching products: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching products",
    };
  } finally {
    console.log("GetProducts API call completed");
  }
};

// Get all seller products
export const GetSellerProducts = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  sortField: string,
  sortOrder: string,
  filterByPrice: string,
  filterByStatus: string
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`/${productController}/seller-products`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
        sortField,
        sortOrder,
        filterByPrice,
        filterByStatus,
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const productsResponse = response.data.data;
    if (
      response.data.status !== 200 ||
      !productsResponse ||
      productsResponse === null
    ) {
      return { success: false, error: response.data.message };
    }

    const productsData = response.data.data.products;
    const totalProductsData = response.data.data.totalProducts;

    return {
      success: true,
      data: { products: productsData, totalProducts: totalProductsData },
    };
  } catch (error) {
    console.error("Something went wrong while fetching products: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching products",
    };
  } finally {
    console.log("GetSellerProducts API call completed");
  }
};

// Get product by productId
export const GetProductById = async (
  productId: string
): Promise<CommonResponse<any>> => {
  // console.log("Product ID: ", productId);
  if (!productId) {
    console.error("Product Id not found");
    return { success: false, error: "Product Id not found" };
  }
  try {
    const response = await api.get(`/${productController}/${productId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const productByIdData = response.data.data;
    if (
      response.data.status != 200 ||
      !productByIdData ||
      productByIdData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      data: productByIdData,
      message: response.data.message,
    };
  } catch (error) {
    console.error(
      "Something went wrong while fetching product details: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while fetching product details",
    };
  } finally {
    console.log("GetProductById API call completed");
  }
};

// Create product
export const AddProduct = async (
  name: string,
  description: string,
  price: number,
  stockQuantity: number,
  imageFile: File
): Promise<CommonResponse<any>> => {
  if (!name || price === null || stockQuantity === null || !imageFile) {
    console.log("Name, Price, StockQuantity & Image are required fields");
    return {
      success: false,
      error: "Name, Price, StockQuantity & Image are required fields",
    };
  }

  if (price <= 0 || stockQuantity <= 0) {
    console.log("Price & StockQuantity must be positive & greater than 0");
    return {
      success: false,
      error: "Price & StockQuantity must be positive & greater than 0",
    };
  }
  try {
    // Build multipart form data
    const formData = new FormData();
    formData.append("Name", name);
    formData.append("Description", description || "");
    formData.append("Price", price.toString());
    formData.append("StockQuantity", stockQuantity.toString());
    formData.append("Image", imageFile);

    // Send as multipart/form-data
    const response = await api.post(`/${productController}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const addProductData = response.data.data;
    if (
      response.data.status != 200 ||
      !addProductData ||
      addProductData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: addProductData,
    };
  } catch (error) {
    console.error("Something went wrong while adding new product: ", error);
    return {
      success: false,
      error: "Something went wrong while adding new product",
    };
  } finally {
    console.log("AddProduct API call completed");
  }
};

// Update product
export const UpdateProduct = async (
  productId: string,
  name: string,
  description: string,
  price: number,
  stockQuantity: number,
  imageFile?: File
): Promise<CommonResponse<any>> => {
  // console.log("ProductId ID: ", productId);
  if (!productId) {
    console.error("Product Id not found");
    return { success: false, error: "Product Id not found" };
  }
  if (!name || price === null || stockQuantity === null) {
    console.log("Name, Price, StockQuantity & Image are required fields");
    return {
      success: false,
      error: "Name, Price, & StockQuantity are required fields",
    };
  }

  if (price <= 0 || stockQuantity <= 0) {
    console.log("Price & StockQuantity must be positive & greater than 0");
    return {
      success: false,
      error: "Price & StockQuantity must be positive & greater than 0",
    };
  }
  try {
    // Build multipart form data
    const formData = new FormData();
    formData.append("Name", name);
    formData.append("Description", description || "");
    formData.append("Price", price.toString());
    formData.append("StockQuantity", stockQuantity.toString());
    // Append image only if it's a real File object
    if (imageFile instanceof File) {
      formData.append("Image", imageFile);
    }

    // Send as multipart/form-data
    const response = await api.put(
      `/${productController}/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const updateProductData = response.data.data;
    if (
      response.data.status != 200 ||
      !updateProductData ||
      updateProductData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: updateProductData,
    };
  } catch (error) {
    console.error("Something went wrong while updating product: ", error);
    return {
      success: false,
      error: "Something went wrong while updating product",
    };
  } finally {
    console.log("UpdateProduct API call completed");
  }
};

// Update Stock
export const UpdateStock = async (
  productId: string,
  stockQuantity: number,
  pattern: string
): Promise<CommonResponse<any>> => {
  // console.log("ProductId ID: ", productId);
  if (!productId) {
    console.error("Product Id not found");
    return { success: false, error: "Product Id not found" };
  }
  if (stockQuantity === null || !pattern) {
    console.log("StockQuantity & Pattern are required");
    return {
      success: false,
      error: "StockQuantity & Pattern are required",
    };
  }
  try {
    // Build multipart form data
    const formData = new FormData();
    formData.append("StockQuantity", stockQuantity.toString());
    formData.append("Pattern", pattern);

    // Send as multipart/form-data
    const response = await api.put(
      `/${productController}/update-stock/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // important
        },
      }
    );

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const updateStockData = response.data.data;
    if (
      response.data.status != 200 ||
      !updateStockData ||
      updateStockData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: updateStockData,
    };
  } catch (error) {
    console.error("Something went wrong while updating stock: ", error);
    return {
      success: false,
      error: "Something went wrong while updating stock",
    };
  } finally {
    console.log("UpdateStock API call completed");
  }
};

// Delete product
export const DeleteProduct = async (
  productId: string
): Promise<CommonResponse<any>> => {
  // console.log("ProductId ID: ", productId);
  if (!productId) {
    console.error("Product Id not found");
    return { success: false, error: "Product Id not found" };
  }
  try {
    const response = await api.delete(`/${productController}/${productId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const deleteProductData = response.data.data;
    if (response.data.status != 200) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: deleteProductData,
    };
  } catch (error) {
    console.error("Something went wrong while deleting product: ", error);
    return {
      success: false,
      error: "Something went wrong while deleting product",
    };
  } finally {
    console.log("DeleteProduct API call completed");
  }
};

// Make Product Inactive
export const MakeProductInactive = async (
  productId: string
): Promise<CommonResponse<any>> => {
  // console.log("ProductId ID: ", productId);
  if (!productId) {
    console.error("Product Id not found");
    return { success: false, error: "Product Id not found" };
  }
  try {
    const response = await api.put(
      `/${productController}/inactive/${productId}`
    );

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const inactiveProductData = response.data.data;
    if (response.data.status != 200) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: inactiveProductData,
    };
  } catch (error) {
    console.error("Something went wrong while deactivating product: ", error);
    return {
      success: false,
      error: "Something went wrong while deactivating product",
    };
  } finally {
    console.log("MakeProductInactive API call completed");
  }
};

// Make Product Active
export const MakeProductActive = async (
  productId: string
): Promise<CommonResponse<any>> => {
  // console.log("ProductId ID: ", productId);
  if (!productId) {
    console.error("Product Id not found");
    return { success: false, error: "Product Id not found" };
  }
  try {
    const response = await api.put(`/${productController}/active/${productId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const activeProductData = response.data.data;
    if (response.data.status != 200) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: activeProductData,
    };
  } catch (error) {
    console.error("Something went wrong while activating product: ", error);
    return {
      success: false,
      error: "Something went wrong while activating product",
    };
  } finally {
    console.log("MakeProductActive API call completed");
  }
};
