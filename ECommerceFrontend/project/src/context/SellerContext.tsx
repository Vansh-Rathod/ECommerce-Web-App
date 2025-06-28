import {
    createContext,
    useContext,
    useState,
    ReactNode
  } from "react";
  import api from "../services/api";
  
  interface SellerContextType {
    seller: any;
    setSeller: (seller: any) => void;
    getSellerProfile: () => Promise<boolean>;
    sellers: any;
    setSellers: (sellers: any) => void;
    getSellers: (
      pageNumber: number,
      pageSize: number,
      searchText: string,
      sortField: string,
      sortOrder: string,
      filterByStatus: string,
      filterByApproval: string,
      filterByCity: string
    ) => void;
  }
  
  const SellerContext = createContext<SellerContextType | undefined>(
    undefined
  );
  
  export const SellerProvider = ({ children }: { children: ReactNode }) => {
    const [seller, setSeller] = useState<any>();
    const [sellers, setSellers] = useState<any>([]);
  
    const getSellerProfile = async () => {
      try {
        const response = await api.get("/seller/profile");
  
        if (response.data.status === 200) {
          const sellerData = response.data.data;
          // console.log("Response: " + response.data.data);
          setSeller(sellerData);
          // console.log("Custoemr asfksa: " + customer);
        } else {
          console.log("Seller not found");
          return false;
        }
  
        return true;
      } catch (error) {
        console.error("Failed to fetch seller:", error);
        return false;
      }
    }
  
    const getSellers = async (
      pageNumber = 1,
      pageSize = 10,
      searchText: string,
      sortField: string,
      sortOrder: string,
      filterByStatus: string,
      filterByApproval: string,
      filterByCity: string
    ) => {
      try {
        const response = await api.get("/seller/sellers", {
          params: {
            pageNumber,
            pageSize,
            searchText,
            sortField,
            sortOrder,
            filterByStatus,
            filterByApproval,
            filterByCity
          },
        });
  
        if (response.data.status === 200) {
          const sellersResponse = response.data.data;
          setSellers(sellersResponse);
        } else {
          console.log("Sellers not found");
        }
  
        return true;
      } catch (error) {
        console.error("Failed to fetch sellers:", error);
        return false;
      }
    };
  
  
    return (
      <SellerContext.Provider
        value={{
          seller,
          setSeller,
          getSellerProfile,
          sellers,
          setSellers,
          getSellers
        }}
      >
        {children}
      </SellerContext.Provider>
    );
  };
  
  export const useSeller = () => {
    const context = useContext(SellerContext);
    if (context === undefined) {
      throw new Error("useSeller must be used within an SellerProvider");
    }
    return context;
  };
  