import { CommonResponse } from "../Types";
import api from "./api";

const adminController = import.meta.env.VITE_ADMIN_CONTROLLER;

// Get admin profile
export const GetAdminProfile = async (): Promise<CommonResponse<any>> => {
  try {
    const response = await api.get(`/${adminController}/profile`);

    if (!response.data) {
      return {
        success: false,
        error:
          "Network Error. Something went wrong while establishing connection with server",
      };
    }

    const adminProfileData = response.data.data;
    if (response.data.status != 200 || !adminProfileData || adminProfileData === null) {
      return { success: false, error: response.data.message };
    }

    return {
      success: true,
      data: adminProfileData,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Something went wrong while fetching admin profile: ", error);
    return {
      success: false,
      error: "Something went wrong while fetching admin profile",
    };
  } finally {
    console.log("GetAdminProfile API call completed");
  }
};

// Get pending approvals list
export const GetPendingApprovals = async (
  pageNumber = 1,
  pageSize = 10,
  searchText: string,
  sortField: string,
  sortOrder: string,
  fromDate?: string | null,
  toDate?: string | null
): Promise<CommonResponse<any>> => {
    try {
        const response = await api.get(`${adminController}/pending-approvals`, {
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
          return { success: false, error: response.data.message };
        }
    
        const pendingUsersResponse = response.data.data;
        if (!pendingUsersResponse) {
          return { success: false, error: response.data.message };
        }
    
        const pendingUsersData = response.data.data.users;
        const totalPendingUsersData = response.data.data.totalUsers;
    
        return {
          success: true,
          data: { pendingUsers: pendingUsersData, totalPendingUsers: totalPendingUsersData },
        };
      } catch (error) {
        console.error("Something went wrong while fetching pending users: ", error);
        return {
          success: false,
          error: "Something went wrong while fetching pending users",
        };
      } finally {
        console.log("GetPendingApprovals API call completed");
      }
};
