import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout, theme } from "antd";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const { Content } = Layout;

const CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  // const { token } = theme.useToken();

  return (
    <Layout className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        items={[
          {
            key: "dashboard",
            label: "Dashboard",
            path: "/customer/dashboard",
            icon: "LayoutDashboard",
          },
          {
            key: "products",
            label: "Products",
            path: "/customer/products",
            icon: "ShoppingBag",
          },
          {
            key: "cart",
            label: "My Cart",
            path: "/cart",
            icon: "ShoppingCart",
          },
          {
            key: "orders",
            label: "My Orders",
            path: "/customer/orders",
            icon: "Package",
          },
          {
            key: "wallet",
            label: "My Wallet",
            path: "/wallet",
            icon: "Wallet",
          },
        ]}
      />
      <Layout>
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          title="Customer Dashboard"
        />
        {/* <Content className="page-container">
          <Outlet />
        </Content> */}

        <Content
          style={{
            padding: "16px 24px",
            minHeight: "calc(100vh - 64px - 48px)", // Adjust based on header/footer height
            overflow: "auto",
          }}
        >
          <div className="max-w-screen-2xl mx-auto w-full">
            <Outlet />
          </div>
        </Content>

        <Footer />
      </Layout>
    </Layout>
  );
};

export default CustomerLayout;
