import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout, theme } from "antd";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const { Content } = Layout;

const AdminLayout = () => {
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
            path: "/admin/dashboard",
            icon: "LayoutDashboard",
          },
          { key: "users", label: "Users", path: "/admin/users", icon: "Users" },
          { key: "customers", label: "Customers", path: "/admin/customers", icon: "Users" },
          { key: "sellers", label: "Sellers", path: "/admin/sellers", icon: "Users" },
          // { key: "approvals", label: "Approvals", path: "/admin/approvals", icon: "Users" },
          // {
          //   key: "products",
          //   label: "Products",
          //   path: "/admin/products",
          //   icon: "Package",
          // },
          // {
          //   key: "orders",
          //   label: "Orders",
          //   path: "/admin/orders",
          //   icon: "ClipboardList",
          // },
          // {
          //   key: "settings",
          //   label: "Settings",
          //   path: "/admin/settings",
          //   icon: "Settings",
          // },
        ]}
      />
      <Layout>
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          title="Admin Dashboard"
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

export default AdminLayout;
