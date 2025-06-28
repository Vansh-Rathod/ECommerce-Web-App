import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import { CustomerProvider } from "./context/CustomerContext";
import { ProductProvider } from "./context/ProductContext";
import { WalletProvider } from "./context/WalletContext";
import { OrderProvider } from "./context/OrderContext";
import { UserProvider } from "./context/UserContext";
import { SellerProvider } from "./context/SellerContext";
import { AdminProvider } from "./context/AdminContext";

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
      <AdminProvider>
        <UserProvider>
          <CustomerProvider>
          <SellerProvider>
            <ProductProvider>
              <CartProvider>
                <WalletProvider>
                  <OrderProvider>
                    <AppRoutes />
                  </OrderProvider>
                </WalletProvider>
              </CartProvider>
            </ProductProvider>
          </SellerProvider>
          </CustomerProvider>
        </UserProvider>
      </AdminProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
