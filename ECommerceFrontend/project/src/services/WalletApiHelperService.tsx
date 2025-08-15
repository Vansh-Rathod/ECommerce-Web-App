import { CommonResponse } from "../Types";
import api from "./api";

const walletController = import.meta.env.VITE_WALLET_CONTROLLER;

// Get Wallet
export const GetWallet = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`/${walletController}`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const walletData = response.data.data;
    if (response.data.status != 200 || !walletData || walletData === null) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: walletData,
    };
  } catch (error) {
    console.error("Something went wrong while fetching wallet: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching wallet",
    };
  } finally {
    console.log("GetWallet API call completed");
  }
};

// Get Transaction History
export const GetTransactionHistory = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`/${walletController}/transactions`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const transactionHistoryData = response.data.data;
    if (
      response.data.status != 200 ||
      !transactionHistoryData ||
      transactionHistoryData === null
    ) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: transactionHistoryData,
    };
  } catch (error) {
    console.error(
      "Something went wrong while fetching transaction history: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while fetching transaction history",
    };
  } finally {
    console.log("GetTransactionHistory API call completed");
  }
};

// Add funds
export const AddFunds = async (
  amount: number,
  description: string
): Promise<CommonResponse<any>> => {
  if (amount == null || amount < 100) {
    return {
      success: false,
      error: "Amount must be at least 100",
    };
  }
  try {
    const requestBody = {
      amount: amount,
      description: description || "",
    };
    const response = await api.post(
      `/${walletController}/add-funds`,
      requestBody
    );

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const addFundsData = response.data.data;
    if (response.data.status != 200 || !addFundsData || addFundsData === null) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: addFundsData,
    };
  } catch (error) {
    console.error("Something went wrong while adding funds to wallet: ", error);
    return {
      success: false,
      error: "Something went wrong while adding funds to wallet",
    };
  } finally {
    console.log("AddFunds API call completed");
  }
};

// Pay funds
export const PayFunds = async (
  amount: number,
  description: string
): Promise<CommonResponse<any>> => {
  if (amount == null || amount < 1) {
    return {
      success: false,
      error: "Amount must be at least 1",
    };
  }
  try {
    const requestBody = {
      amount: amount,
      description: description || "",
    };
    const response = await api.post(`/${walletController}/pay`, requestBody);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const payFundsData = response.data.data;
    if (response.data.status != 200 || !payFundsData || payFundsData === null) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      message: response.data.message,
      data: payFundsData,
    };
  } catch (error) {
    console.error(
      "Something went wrong while paying funds from wallet: ",
      error
    );
    return {
      success: false,
      error: "Something went wrong while paying funds from wallet",
    };
  } finally {
    console.log("PayFunds API call completed");
  }
};
