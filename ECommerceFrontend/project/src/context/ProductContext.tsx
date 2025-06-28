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

interface ProductContextType {
  allActiveProducts: any;
  setAllActiveProducts: (allActiveProducts: any) => void;
  allSellerProducts: any;
  setAllSellerProducts: (allSellerProducts: any) => void;

  fetchAllActiveProducts: (
    pageNumber: number,
    pageSize: number,
    searchText: string,
    sortField: string,
    sortOrder: string,
    filterByPrice: string
  ) => void;

  fetchAllSellerProducts: (
    pageNumber: number,
    pageSize: number,
    searchText: string,
    sortField: string,
    sortOrder: string,
    filterByPrice: string
  ) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [allActiveProducts, setAllActiveProducts] = useState<any>([]);
  const [allSellerProducts, setAllSellerProducts] = useState<any>([]);

  const fetchAllActiveProducts = async (
    pageNumber = 1,
    pageSize = 10,
    searchText: string,
    sortField: string,
    sortOrder: string,
    filterByPrice: string
  ) => {
    try {
      const response = await api.get("/product/products", {
        params: {
          pageNumber,
          pageSize,
          searchText,
          sortField,
          sortOrder,
          filterByPrice,
        },
      });

    //   console.log("response: " + JSON.stringify(response.data.data));

      if (response.data.status === 200) {
        const products = response.data.data;
        setAllActiveProducts(products);
      } else {
        console.log("Products not found");
      }

      return true;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return false;
    }
  };

  const fetchAllSellerProducts = async (
    pageNumber = 1,
    pageSize = 10,
    searchText: string,
    sortField: string,
    sortOrder: string,
    filterByPrice: string
  ) => {
    try {
      const response = await api.get("/product/seller-products", {
        params: {
          pageNumber,
          pageSize,
          searchText,
          sortField,
          sortOrder,
          filterByPrice,
        },
      });

      if (response.data.status === 200) {
        const products = response.data.data;
        setAllSellerProducts(products);
      } else {
        console.log("Seller products not found");
      }

      return true;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return false;
    }
  };

//   const creatProduct = async (values: any) => {
//     try {
//       const addProductPayload = {
//         name: values.name,
//         description: values.description,
//         price: values.price,
//         stockQuantity: values.stockQuantity,
//         isActive: tru,
//         image: values.iemage,
//       };

//       const response = await api.post("/product/products", addProductPayload);

//       return true;
//     } catch (error) {
//       console.error("Failed to add products:", error);
//       return false;
//     }
//   };

  return (
    <ProductContext.Provider
      value={{
        allActiveProducts,
        setAllActiveProducts,
        allSellerProducts,
        setAllSellerProducts,
        fetchAllActiveProducts,
        fetchAllSellerProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within an ProductProvider");
  }
  return context;
};
