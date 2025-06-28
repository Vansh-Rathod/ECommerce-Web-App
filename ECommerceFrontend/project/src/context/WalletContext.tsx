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
  
  interface WalletContextType {
   wallet: any,
   getWallet: () => void
  }
  
  const WalletContext = createContext<WalletContextType | undefined>(
    undefined
  );
  
  export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [wallet, setWallet] = useState<any>([]);
  
    const getWallet = async (
     
    ) => {
      try {
        const response = await api.get("/wallet");
  
        if (response.data.status === 200) {
          const walletData = response.data.data;
          setWallet(walletData);
        } else {
          console.log("Wallet not found");
        }
  
        return true;
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
        return false;
      }
    };
  
    
    return (
      <WalletContext.Provider
        value={{
          wallet,
          getWallet
        }}
      >
        {children}
      </WalletContext.Provider>
    );
  };
  
  export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
      throw new Error("useWallet must be used within an WalletProvider");
    }
    return context;
  };
  