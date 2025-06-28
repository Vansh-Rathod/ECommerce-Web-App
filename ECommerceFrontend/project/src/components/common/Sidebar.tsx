import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const { Sider } = Layout;

interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon: keyof typeof LucideIcons;
}

interface SidebarProps {
  collapsed: boolean;
  items: MenuItem[];
}

const Sidebar = ({ collapsed, items }: SidebarProps) => {
  const location = useLocation();
  const { user, activeRole } = useAuth();
  
  // Find selected key based on current path
  const selectedKey = items.find(item => 
    location.pathname.startsWith(item.path)
  )?.key || '';
  
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="min-h-screen"
      theme="light"
      width={220}
    >
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <LucideIcons.ShoppingBag className="text-primary-500" />
          {!collapsed && (
            <span className="text-lg font-semibold text-primary-500">Shop Hub</span>
          )}
        </Link>
      </div>
      
      <div className="p-4 border-b border-gray-100">
        {!collapsed ? (
          <div className="text-xs text-gray-500">
            Logged in as:{" "}
      <span className="font-medium">
        {activeRole
          ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1)
          : "Unknown"}
      </span>
          </div>
        ) : (
          <div className="flex justify-center">
            {/* <span className="text-xs text-gray-500 uppercase">{user?.role}</span> */}
            <span className="text-xs text-gray-500 uppercase">{activeRole?.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        className="border-0"
        items={items.map(item => {
          const Icon = LucideIcons[item.icon];
          return {
            key: item.key,
            icon: <Icon size={16} />,
            label: <Link to={item.path}>{item.label}</Link>,
          };
        })}
      />
    </Sider>
  );
};

export default Sidebar;