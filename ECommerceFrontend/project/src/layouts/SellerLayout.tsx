import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout, theme } from "antd";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const { Content } = Layout;

const SellerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  return (
    <Layout className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        items={[
          {
            key: "dashboard",
            label: "Dashboard",
            path: "/seller/dashboard",
            icon: "LayoutDashboard",
          },
          {
            key: "products",
            label: "My Products",
            path: "/seller/products",
            icon: "Package",
          },
          {
            key: "orders",
            label: "Orders",
            path: "/seller/orders",
            icon: "ShoppingBag",
          },
          {
            key: "analytics",
            label: "Analytics",
            path: "/seller/analytics",
            icon: "BarChart",
          },
          {
            key: "settings",
            label: "Settings",
            path: "/seller/settings",
            icon: "Settings",
          },
        ]}
      />
      <Layout>
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          title="Seller Dashboard"
        />
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

export default SellerLayout;
