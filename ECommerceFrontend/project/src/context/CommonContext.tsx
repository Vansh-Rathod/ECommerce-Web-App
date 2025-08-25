import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';
import { GetCart } from '../services/CartApiHelperService';

interface CommonContextType {
    totalCartItems: number;
  GetTotalCartItems: () => void;
}

const CommonContext = createContext<CommonContextType | undefined>(undefined);

export const CommonProvider = ({ children }: { children: ReactNode }) => {
  const [totalCartItems, setTotalCartItems] = useState<number>(0);

  // useEffect(() => {
  //   GetTotalCartItems(); // Load initial cart count
  // }, []);

  const GetTotalCartItems = async () => {
    try {
      const result = await GetCart();

      if (result.success) {
        setTotalCartItems(result.data.cartItems.length);
      } else {
        setTotalCartItems(0);
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  }

  return (
    <CommonContext.Provider
      value={{
        totalCartItems,
        GetTotalCartItems
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};

export const useCommon = () => {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error('useCommon must be used within a CommonProvider');
  }
  return context;
};