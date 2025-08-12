import { CommonResponse } from "../Types";
import api from "./api";

const userController = import.meta.env.VITE_USER_CONTROLLER;

// Get all users
export const GetUsers = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  sortField: string,
  sortOrder: string,
  fromDate?: string | null,
  toDate?: string | null
): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`${userController}/users`, {
      params: {
        pageNumber,
        pageSize,
        searchText,
        sortField,
        sortOrder,
        fromDate,
        toDate,
      },
    });

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    if (response.data.status === 404) {
        return { success: true, data: { users: [], totalUsers: 0 } , error: response.data.message };
      }

    if (response.data.status !== 200) {
      return { success: false, error: "No users found" };
    }

    const usersResponse = response.data.data;
    if (!usersResponse) {
      return { success: false, error: response.data.message };
    }

    const usersData = response.data.data.users;
    const totalUsersData = response.data.data.totalUsers;

    return {
      success: true,
      data: { users: usersData, totalUsers: totalUsersData },
    };
  } catch (error) {
    console.error("Something went wrong while fetching users: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching users",
    };
  } finally {
    console.log("getUsers API call completed");
  }
};

// Get user by userId
export const GetUserById = async (
  userId: string
): Promise<CommonResponse<any>> => {
  if (userId) {
    // console.log("User ID: ", userId);
    try {
      const response = await api.get(`/${userController}/${userId}`);

      if (!response.data) {
        return {
          success: false,
          error:
            "Network Error. Something went wrong while establishing connection with server",
        };
      }

      if (response.data.status != 200) {
        return { success: false, error: "User not found" };
      }

      const userByIdData = response.data.data;
      if (!userByIdData) {
        return { success: false, error: response.data.message };
      }

      return {
        success: true,
        data: userByIdData,
        message: response.data.message,
      };
    } catch (error) {
      console.error(
        "Something went wrong while fetching user details: ",
        error
      );
      return {
        success: false,
        error: "Something went wrong while fetching user details",
      };
    } finally {
      console.log("getUserById API call completed");
    }
  } else {
    console.error("User Id not found");
    return { success: false, error: "User Id not found" };
  }
};

// Delete user by userId
export const DeleteUser = async (
  userId: string
): Promise<CommonResponse<any>> => {
  if (userId) {
    // console.log("User ID: ", userId);
    try {
      const response = await api.delete(`/${userController}/${userId}`);

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
      console.error("Something went wrong while deleting user: ", error);
      return {
        success: false,
        error: "Something went wrong while deleting user",
      };
    } finally {
      console.log("deleteUser API call completed");
    }
  } else {
    console.error("User Id not found");
    return { success: false, error: "User Id not found" };
  }
};

// Make user inactive
export const MakeUserInactive = async (
  userId: string
): Promise<CommonResponse<any>> => {
  if (userId) {
    // console.log("User ID: ", userId);
    try {
      const response = await api.put(`/${userController}/inactive/${userId}`);

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
      console.error("Something went wrong while deactivating user: ", error);
      return {
        success: false,
        error: "Something went wrong while deactivating user",
      };
    } finally {
      console.log("makeUserInactive API call completed");
    }
  } else {
    console.error("User Id not found");
    return { success: false, error: "User Id not found" };
  }
};

// Make user active
export const MakeUserActive = async (
  userId: string
): Promise<CommonResponse<any>> => {
  if (userId) {
    // console.log("User ID: ", userId);
    try {
      const response = await api.put(`/${userController}/active/${userId}`);

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
      console.error("Something went wrong while activating user: ", error);
      return {
        success: false,
        error: "Something went wrong while activating user",
      };
    } finally {
      console.log("makeUserActive API call completed");
    }
  } else {
    console.error("User Id not found");
    return { success: false, error: "User Id not found" };
  }
};

// Change user 2FA Status
export const ChangeUser2FAStatus = async (
    status: boolean
  ): Promise<CommonResponse<any>> => {
    if (status !== null) {
      // console.log("Status: ", status);
      try {
        const response = await api.put(`/${userController}/change2FAStatus`);
  
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
        console.error("Something went wrong while changing 2FA Status: ", error);
        return {
          success: false,
          error: "Something went wrong while changing 2FA Status",
        };
      } finally {
        console.log("changeUser2FAStatus API call completed");
      }
    } else {
      console.error("Status not found");
      return { success: false, error: "Status not found" };
    }
  };
