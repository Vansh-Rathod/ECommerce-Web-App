import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';
import { Product } from '../Types';

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;

  fetchCartItems: () => void;
  addItemToCart: (productId: string) => void;
  removeItemFromCart: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: () => any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<any>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCartItems = async () => {
    try {
      const response = await api.get("/cart");

      // console.log("response: " + JSON.stringify(response.data.data));

      if (response.data.status === 200) {
        // const cartItems = response.data.data.cartItems;
        const cartItems = response.data.data.cartItems.map((item: any) => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productImageUrl: item.productImageUrl,
          quantity: item.cartItemQuantity
        }));
        setItems(cartItems);

        // Calculate totals
        const newTotal = cartItems.reduce((acc: number, item: CartItem) => 
          acc + (item.productPrice * item.quantity), 0);
        const newCount = cartItems.reduce((acc: number, item: CartItem) => 
          acc + item.quantity, 0);
        
        setTotalPrice(newTotal);
        setTotalItems(newCount);
      } else {
        console.log("Cart items not found");
      }

      return true;
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      return false;
    }
  }

  const addItemToCart = async (productId: any) => {
    try {
      const response = await api.post("/cart/add", { productId, quantity: 1 });
      await fetchCartItems();
      console.log("response: " + JSON.stringify(response.data.data));

      if (response.data.status === 200) {
        console.log("Item dded to cart successfully");
      } else {
        console.log("Failed to add cart item");
      }

      return true;
    } catch (error) {
      console.error("Failed to add item from cart: ", error);
      return false;
    }
  }

  const removeItemFromCart = async (productId: any, quantity: number) => {
    try {
      const response = await api.put("/cart/remove", { productId, quantity });
      await fetchCartItems();
      console.log("response: " + JSON.stringify(response.data.data));

      if (response.data.status === 200) {
        console.log("Item removed from cart successfully");
      } else {
        console.log("Failed to remove cart item");
      }

      return true;
    } catch (error) {
      console.error("Failed to remove item from cart: ", error);
      return false;
    }
  }

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear");
      console.log("Cart Cleared Successfully");
      await fetchCartItems();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const createOrder = async () => {
    try {
      const response = await api.post("/order");
      if(response.data.status === 200){
        console.log("Order Created Successfully")
        return response.data.data;
      }
      console.log("Failed to create order. please try again later");
      return null;
    } catch (error) {
      console.error("Failed to create order:", error);
      return null;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        fetchCartItems,
        addItemToCart,
        removeItemFromCart,
        clearCart,
        createOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};