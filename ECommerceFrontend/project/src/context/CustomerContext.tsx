import {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";
import api from "../services/api";

interface CustomerContextType {
  customer: any;
  setCustomer: (customer: any) => void;
  getCustomerProfile: () => Promise<boolean>;
  customers: any;
  setCustomers: (customers: any) => void;
  getCustomers: (
    pageNumber: number,
    pageSize: number,
    searchText: string,
    sortField: string,
    sortOrder: string,
    filterByStatus: string
  ) => void;
  makeCustomerInactive: (customerId: any) => void;
  makeCustomerActive: (customerId: any) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<any>();
  const [customers, setCustomers] = useState<any>([]);

  const getCustomerProfile = async () => {
    try {
      const response = await api.get("/customer/profile");

      if (response.data.status === 200) {
        const customerData = response.data.data;
        // console.log("Response: " + response.data.data);
        setCustomer(customerData);
        // console.log("Custoemr asfksa: " + customer);
      } else {
        console.log("Customer not found");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      return false;
    }
  }

  const getCustomers = async (
    pageNumber = 1,
    pageSize = 10,
    searchText: string,
    sortField: string,
    sortOrder: string,
    filterByStatus: string
  ) => {
    try {
      const response = await api.get("/customer/customers", {
        params: {
          pageNumber,
          pageSize,
          searchText,
          sortField,
          sortOrder,
          filterByStatus,
        },
      });

      if (response.data.status === 200) {
        const customersResponse = response.data.data;
        setCustomers(customersResponse);
      } else {
        console.log("Customers not found");
      }

      return true;
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      return false;
    }
  };

  const makeCustomerInactive = async (customerId: any) => {
    try {
      const response = await api.put(`/inactive/${customerId}`);

      return true;
    } catch (error) {
      console.error("Failed to inactivate customer:", error);
      return false;
    }
  };

  const makeCustomerActive = async (customerId: any) => {
    try {
      const response = await api.put(`/active/${customerId}`);

      return true;
    } catch (error) {
      console.error("Failed to activate customer:", error);
      return false;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        setCustomer,
        getCustomerProfile,
        customers,
        setCustomers,
        getCustomers,
        makeCustomerInactive,
        makeCustomerActive,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCusomer must be used within an CustomerProvider");
  }
  return context;
};
