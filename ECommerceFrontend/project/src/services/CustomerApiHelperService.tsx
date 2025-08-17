import { CommonResponse } from "../Types";
import api from "./api";

const customerController = import.meta.env.VITE_CUSTOMER_CONTROLLER;

// Get customer profile
export const GetCustomerProfile = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`/${customerController}/profile`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const customerProfileData = response.data.data;
    if (
      response.data.status != 200 ||
      !customerProfileData ||
      customerProfileData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      data: customerProfileData,
      message: response.data.message,
    };
  } catch (error) {
    console.error(
      "Something went wrong while fetching customer profile: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while fetching customer profile",
    };
  } finally {
    console.log("GetCustomerProfile API call completed");
  }
};

// Get all users
export const GetCustomers = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  sortField: string,
  sortOrder: string,
  filterByStatus: string
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`${customerController}/customers`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
        sortField,
        sortOrder,
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

    const customersResponse = response.data.data;
    if (
      response.data.status !== 200 ||
      !customersResponse ||
      customersResponse === null
    ) {
      return {
        success: false,
        error: response.data.message,
      };
    }

    const customersData = response.data.data.customers;
    const totalCustomersData = response.data.data.totalCustomers;

    return {
      success: true,
      message: response.data.message,
      data: { customers: customersData, totalCustomers: totalCustomersData },
    };
  } catch (error) {
    console.error("Something went wrong while fetching customers: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching customers",
    };
  } finally {
    console.log("GetCustomers API call completed");
  }
};

// Get customer by customerId
export const GetCustomerById = async (
  customerId: string
): Promise<CommonResponse<any>> => {
  // console.log("Customer ID: ", customerId);
  if (!customerId) {
    console.error("Customer Id not found");
    return { success: false, error: "Customer Id not found" };
  }
  try {
    const response = await api.get(`/${customerController}/${customerId}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const customerByIdData = response.data.data;
    if (
      response.data.status != 200 ||
      !customerByIdData ||
      customerByIdData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: customerByIdData,
    };
  } catch (error) {
    console.error(
      "Something went wrong while fetching customer details: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while fetching customer details",
    };
  } finally {
    console.log("GetCustomerById API call completed");
  }
};

// Make customer inactive
export const MakeCustomerInactive = async (
  customerId: string
): Promise<CommonResponse<any>> => {
  // console.log("Customer ID: ", customerId);
  if (!customerId) {
    console.error("Customer Id not found");
    return { success: false, error: "Customer Id not found" };
  }
  try {
    const response = await api.put(
      `/${customerController}/inactive/${customerId}`
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
    console.error("Something went wrong while deactivating customer: ", error);
    return {
      success: false,
      error: "Something went wrong while deactivating customer",
    };
  } finally {
    console.log("MakeCustomerInactive API call completed");
  }
};

// Make customer active
export const MakeCustomerActive = async (
  customerId: string
): Promise<CommonResponse<any>> => {
  // console.log("Customer ID: ", customerId);
  if (!customerId) {
    console.error("Customer Id not found");
    return { success: false, error: "Customer Id not found" };
  }
  try {
    const response = await api.put(
      `/${customerController}/active/${customerId}`
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
    console.error("Something went wrong while activating customer: ", error);
    return {
      success: false,
      error: "Something went wrong while activating customer",
    };
  } finally {
    console.log("MakeCustomerActive API call completed");
  }
};
