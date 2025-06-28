import {
    createContext,
    useContext,
    useState,
    ReactNode
  } from "react";
  import api from "../services/api";
  
  interface AdminContextType {
    admin: any;
    setAdmin: (admin: any) => void;
    getAdminProfile: () => Promise<boolean>;
    pendingApprovals: any;
    setPendingApprovals: (pendingApprovals: any) => void;
    getPendingApprovals: (
      pageNumber: number,
      pageSize: number,
      searchText: string,
      sortField: string,
      sortOrder: string,
    ) => void;
  }
  
  const AdminContext = createContext<AdminContextType | undefined>(
    undefined
  );
  
  export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<any>();
    const [pendingApprovals, setPendingApprovals] = useState<any>([]);
  
    const getAdminProfile = async () => {
      try {
        const response = await api.get("/admin/profile");
  
        if (response.data.status === 200) {
          const adminData = response.data.data;
          // console.log("Response: " + response.data.data);
          setAdmin(adminData);
          // console.log("Custoemr asfksa: " + customer);
        } else {
          console.log("Admin not found");
          return false;
        }
  
        return true;
      } catch (error) {
        console.error("Failed to fetch admin:", error);
        return false;
      }
    }
  
    const getPendingApprovals = async (
      pageNumber = 1,
      pageSize = 10,
      searchText: string,
      sortField: string,
      sortOrder: string
    ) => {
      try {
        const response = await api.get("/admin/pending-approvals", {
          params: {
            pageNumber,
            pageSize,
            searchText,
            sortField,
            sortOrder
          },
        });
  
        if (response.data.status === 200) {
          const pendingApprovalsResponse = response.data.data;
          setPendingApprovals(pendingApprovalsResponse);
        } else {
          console.log("No Pending Approvals Found");
        }
  
        return true;
      } catch (error) {
        console.error("Failed to fetch pending approvals:", error);
        return false;
      }
    };

  
    return (
      <AdminContext.Provider
        value={{
          admin,
          setAdmin,
          getAdminProfile,
          pendingApprovals,
          setPendingApprovals,
          getPendingApprovals,
        }}
      >
        {children}
      </AdminContext.Provider>
    );
  };
  
  export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
      throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
  };
  