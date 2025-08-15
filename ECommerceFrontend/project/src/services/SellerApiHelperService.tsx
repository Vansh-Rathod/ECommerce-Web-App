import { CommonResponse } from "../Types";
import api from "./api";

const sellerController = import.meta.env.VITE_SELLER_CONTROLLER;

// Get Seller profile
export const GetSellerProfile = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`/${sellerController}/profile`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const sellerProfileData = response.data.data;
    if (
      response.data.status != 200 ||
      !sellerProfileData ||
      sellerProfileData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: sellerProfileData,
    };
  } catch (error) {
    console.error(
      "Something went wrong while fetching seller profile: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while fetching seller profile",
    };
  } finally {
    console.log("GetSellerProfile API call completed");
  }
};

// Get all sellers
export const GetSellers = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  sortField: string,
  sortOrder: string,
  filterByStatus: string,
  filterByApproval: string,
  filterByCity: string
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`${sellerController}/sellers`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
        sortField,
        sortOrder,
        filterByStatus,
        filterByApproval,
        filterByCity,
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const sellersResponse = response.data.data;
    if (
      response.data.status !== 200 ||
      !sellersResponse ||
      sellersResponse === null
    ) {
      return {
        success: false,
        error: response.data.message,
      };
    }

    const sellersData = response.data.data.sellers;
    const totalSellersData = response.data.data.totalSellers;

    return {
      success: true,
      message: response.data.message,
      data: { sellers: sellersData, totalSellers: totalSellersData },
    };
  } catch (error) {
    console.error("Something went wrong while fetching sellers: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching sellers",
    };
  } finally {
    console.log("GetSellers API call completed");
  }
};

// Get seller by sellerId
export const GetSellerById = async (
  sellerId: string
): Promise<CommonResponse<any>> => {
  // console.log("Seller ID: ", sellerId);
  if (!sellerId) {
    console.error("Seller Id not found");
    return { success: false, error: "Seller Id not found" };
  }
  try {
    const response = await api.get(`/${sellerController}/${sellerId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const sellerByIdData = response.data.data;
    if (
      response.data.status != 200 ||
      !sellerByIdData ||
      sellerByIdData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: sellerByIdData,
    };
  } catch (error) {
    console.error(
      "Something went wrong while fetching seller details: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while fetching seller details",
    };
  } finally {
    console.log("GetSellerById API call completed");
  }
};

// Approve Seller
export const ApproveSeller = async (
    sellerId: string
  ): Promise<CommonResponse<any>> => {
    // console.log("Seller ID: ", sellerId);
    if (!sellerId) {
      console.error("Seller Id not found");
      return { success: false, error: "Seller Id not found" };
    }
    try {
      const response = await api.post(
        `/${sellerController}/approve-seller/${sellerId}`
      );
  
      if (!response.data) {
        return {
          success: false,
          error:
            "Network Error. Something went wrong while establishing connection with server",
        };
      }
  
      if (response.data.status != 200) {
        return { success: false, error: response.data.message };
      }
  
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Something went wrong while approving seller: ", error);
      return {
        success: false,
        error: "Something went wrong while approving seller",
      };
    } finally {
      console.log("ApproveSeller API call completed");
    }
  };

  // Reject Seller
export const RejectSeller = async (
    sellerId: string
  ): Promise<CommonResponse<any>> => {
    // console.log("Seller ID: ", sellerId);
    if (!sellerId) {
      console.error("Seller Id not found");
      return { success: false, error: "Seller Id not found" };
    }
    try {
      const response = await api.post(
        `/${sellerController}/reject-seller/${sellerId}`
      );
  
      if (!response.data) {
        return {
          success: false,
          error:
            "Network Error. Something went wrong while establishing connection with server",
        };
      }
  
      if (response.data.status != 200) {
        return { success: false, error: response.data.message };
      }
  
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Something went wrong while rejecting seller: ", error);
      return {
        success: false,
        error: "Something went wrong while rejecting seller",
      };
    } finally {
      console.log("RejectSeller API call completed");
    }
  };

// Make seller inactive
export const MakeSellerInactive = async (
    sellerId: string
  ): Promise<CommonResponse<any>> => {
    // console.log("Seller ID: ", sellerId);
    if (!sellerId) {
      console.error("Seller Id not found");
      return { success: false, error: "Seller Id not found" };
    }
    try {
      const response = await api.put(
        `/${sellerController}/inactive/${sellerId}`
      );
  
      if (!response.data) {
        return {
          success: false,
          error:
            "Network Error. Something went wrong while establishing connection with server",
        };
      }
  
      if (response.data.status != 200) {
        return { success: false, error: response.data.message };
      }
  
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Something went wrong while deactivating seller: ", error);
      return {
        success: false,
        error: "Something went wrong while deactivating seller",
      };
    } finally {
      console.log("MakeSellerInactive API call completed");
    }
  };
  
  // Make seller active
  export const MakeSellerActive = async (
    sellerId: string
  ): Promise<CommonResponse<any>> => {
    // console.log("Seller ID: ", sellerId);
    if (!sellerId) {
      console.error("Seller Id not found");
      return { success: false, error: "Seller Id not found" };
    }
    try {
      const response = await api.put(
        `/${sellerController}/active/${sellerId}`
      );
  
      if (!response.data) {
        return {
          success: false,
          error:
            "Network Error. Something went wrong while establishing connection with server",
        };
      }
  
      if (response.data.status != 200) {
        return { success: false, error: response.data.message };
      }
  
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Something went wrong while activating seller: ", error);
      return {
        success: false,
        error: "Something went wrong while activating seller",
      };
    } finally {
      console.log("MakeSellerActive API call completed");
    }
  };
