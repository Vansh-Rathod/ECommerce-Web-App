import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import api from "../services/api";

interface OrderContextType {
    orders: any;
    getOrders: () => Promise<boolean>;
    sellerOrders: any;
    getSellerOrders: () => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<any>([]);
  const [sellerOrders, setSellerOrders] = useState<any>([]);

  const getOrders = async () => {
    try {
      const response = await api.get("/order");

      if(response.data.status === 200){
          const ordersData = response.data.data;
          setOrders(ordersData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to fetch orders: ", error);
      return false;
    }
  };

  const getSellerOrders = async () => {
    try {
      const response = await api.get("order/seller/orders");

      if(response.data.status === 200){
          const sellerOrdersData = response.data.data;
        setSellerOrders(sellerOrdersData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to fetch seller orders: ", error);
      return false;
    }
  };

  
  return (
    <OrderContext.Provider
      value={{
        orders,
        getOrders,
        sellerOrders,
        getSellerOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
