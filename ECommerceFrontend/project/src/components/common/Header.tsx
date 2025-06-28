import {
  Tabs,
  Layout,
  Button,
  Dropdown,
  Badge,
  Avatar,
  Space,
  MenuProps,
  Select,
  message,
  Descriptions,
  Modal,
  Typography,
  Spin,
  Row,
  Card,
  Statistic,
  Col,
  Progress,
  Timeline,
  Tooltip,
  Divider,
  Empty,
  List,
  Tag,
  Switch,
  notification
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Bell, Menu, User, LogOut, Package, Store, CheckCircle, XCircle, Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  CreditCard,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";
import { useState } from "react";

const { Header: AntHeader } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Meta } = Card;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  title?: string;
}

// Define interfaces for different profile types
interface AdminProfile {
  userId: string;
  name: string;
  email: string;
  registeredAt: string;
  lastLogin: string;
  roles: string[];
  sellerId?: string;
  storeName?: string;
  city?: string;
  isApproved?: boolean;
  sellerProfileStatus?: boolean;
  sellerProfileCreatedDate?: string;
  customerId?: string;
  customerProfileStatus?: boolean;
  customerProfileCreatedDate?: string;
  is2FAEnabled?: boolean;
}

interface CustomerProfile {
  customerId: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerLastLogin: string;
  is2FAEnabled?: boolean;
  customerWallet: {
    walletId: string;
    balance: number;
    transactions: Array<{
      transactionId: string;
      transactionAmount: number;
      transactionType: string;
      transactionDescription: string;
      transactionDate: string;
    }>;
  };
  customerCart: {
    cartId: string;
    cartItems: Array<{
      cartItemId: string;
      productId: string;
      quantity: number;
    }>;
  };
  customerOrders: Array<{
    orderId: string;
    orderDate: string;
    estimatedDeliveryTime: string;
    totalAmount: number;
    orderStatus: string;
    orderItems: Array<{
      orderItemId: string;
      productId: string;
      productName: string;
      quantity: number;
      priceAtPurchase: number;
      orderItemStatus: string;
    }>;
  }>;
  isSeller: boolean;
}

interface SellerProfile {
  sellerId: string;
  userId: string;
  storeName: string;
  city: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  sellerName: string;
  sellerEmail: string;
  sellerLastLogin: string;
  is2FAEnabled?: boolean;
  sellerProducts: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    isActive: boolean;
  }>;
  sellerOrders: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    status: string;
  }>;
}

type ProfileData = AdminProfile | CustomerProfile | SellerProfile;

const Header = ({
  collapsed,
  setCollapsed,
  title = "Dashboard",
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout, activeRole, setActiveRole } = useAuth();
  const { totalItems } = useCart();

  // Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  // console.log(user)

  const roleOptions =
    user?.roles?.map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      value: role,
    })) || [];

  const handleRoleChange = (role: string) => {
    message.success(`Switched to ${role}`);
    setActiveRole(role);
    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "customer":
        navigate("/customer/dashboard");
        break;
    }
  };

  // Function to fetch profile data
  const fetchProfileData = async (role: string | null) => {
    setLoading(true);
    setCurrentRole(role);
    try {
      const response = await api.get(`/${role}/profile`);


      if (response.data.status === 200) {
        const userProfileData = response.data.data;
        setProfileData(userProfileData);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile button click
  const handleProfileClick = () => {
    const role = localStorage.getItem("role");
    if (role === null || role === undefined) {
      message.error("Cannot fetch profile data");
      localStorage.clear();
      navigate("/login");
      return;
    }
    fetchProfileData(role);
    setIsProfileModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsProfileModalOpen(false);
    setProfileData(null);
    setCurrentRole(null);
  };

  // Local toggle for 2FA (UI only, no backend call)
  const handle2FA = async (status: boolean) => {
    setLoading(true);
    try {
      const response = await api.put("/user/change2FAStatus", 
        status
      );

      // Check for success response
      if (response.data.status === 200) {
        message.success(!status ? "2FA Status Disabled Successfully" : "2FA Status Enabled Successfully");
        
        // Refresh profile data to update UI
        if (currentRole) {
          await fetchProfileData(currentRole);
        }
      }
      else {
        message.error(!status ? "Something went wrong while disabling 2FA Status" : "Something went wrong while enabling 2FA Status");
      }
    } catch (error) {
      console.error("Failed to change 2FA Status: ", error);
      message.error("Failed to change 2FA Status");
    }
    finally {
      setLoading(false);
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: <span onClick={handleProfileClick}>Profile</span>,
      icon: <User size={16} />,
    },
    {
      key: "logout",
      label: <span onClick={logout}>Logout</span>,
      icon: <LogOut size={16} />,
    },
  ];

  // Enhanced renderProfileContent function
  const renderProfileContent = () => {
    if (!profileData || !currentRole) return null;

    // Helper function to get status color
    const getStatusColor = (status: boolean) => status ? '#52c41a' : '#ff4d4f';
    const getStatusIcon = (status: boolean) => status ? <CheckCircle size={14} /> : <XCircle size={14} />;

    switch (currentRole) {
      case 'admin':
        const adminData = profileData as AdminProfile;
        return (
          <div className="enhanced-profile">
            {/* Hero Section */}
            <div className="profile-hero bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar size={80} className="bg-white text-blue-600 text-2xl font-bold">
                    {adminData.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <Title level={2} className="text-white mb-2">
                    {adminData.name}
                  </Title>
                  <p className="text-blue-100 mb-3 text-lg">{adminData.email}</p>
                  <div className="flex gap-2 flex-wrap">
                    {adminData.roles?.map((role: any) => (
                      <Tag key={role} color="gold" className="px-3 py-1">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1" type="card">
              <TabPane tab={<span><User size={16} className="mr-2" />Basic Info</span>} key="1">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 mb-0">User ID</p>
                          <p className="font-semibold mb-0">{adminData.userId}</p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 mb-0">Registered</p>
                          <p className="font-semibold mb-0">
                            {new Date(adminData.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Clock size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 mb-0">Last Login</p>
                          <p className="font-semibold mb-0">
                            {adminData.lastLogin ? new Date(adminData.lastLogin).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {(adminData.sellerId || adminData.customerId) && (
                <TabPane tab={<span><Store size={16} className="mr-2" />Additional Roles</span>} key="2">
                  {adminData.sellerId && (
                    <Card className="mb-4" title="Seller Profile">
                      <Row gutter={16}>
                        <Col span={8}>
                          <Statistic
                            title="Store Name"
                            value={adminData.storeName}
                            prefix={<Store size={16} />}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Location"
                            value={adminData.city}
                            prefix={<MapPin size={16} />}
                          />
                        </Col>
                        <Col span={8}>
                          <div className="text-center">
                            <Badge
                              status={adminData.isApproved ? "success" : "error"}
                              text={adminData.isApproved ? "Approved" : "Pending"}
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {adminData.customerId && (
                    <Card title="Customer Profile">
                      <Badge
                        status={adminData.customerProfileStatus ? "success" : "error"}
                        text={adminData.customerProfileStatus ? "Active Customer" : "Inactive Customer"}
                      />
                    </Card>
                  )}
                </TabPane>
              )}

              {/* 2FA Status */}
              <TabPane tab={<span><User size={16} className="mr-2" />2FA Status</span>} key="3">
                <div className="mt-2 flex items-center gap-2">
                  <Tag color={adminData.is2FAEnabled ? 'green' : 'red'}>
                    {adminData.is2FAEnabled ? (
                      <span><CheckCircle size={14} className="mr-1" /> 2FA Enabled</span>
                    ) : (
                      <span><XCircle size={14} className="mr-1" /> 2FA Disabled</span>
                    )}
                  </Tag>
                  <Switch
                    checked={adminData.is2FAEnabled}
                    onChange={handle2FA}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        );

      case 'customer':
        const customerData = profileData as CustomerProfile;
        return (
          <div className="enhanced-profile">
            {/* Hero Section */}
            <div className="profile-hero bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar size={80} className="bg-white text-green-600 text-2xl font-bold">
                    {customerData.customerName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                    {getStatusIcon(customerData.isActive)}
                  </div>
                </div>
                <div className="flex-1">
                  <Title level={2} className="text-white mb-2">
                    {customerData.customerName}
                  </Title>
                  <p className="text-green-100 mb-3 text-lg">{customerData.customerEmail}</p>
                  <div className="flex gap-2">
                    <Tag color="cyan">Customer</Tag>
                    {customerData.isSeller && <Tag color="orange">Also Seller</Tag>}
                  </div>
                </div>
                <div className="text-right">
                  <Title level={3} className="text-white mb-0">
                    ₹{customerData.customerWallet?.balance?.toFixed(2) || '0.00'}
                  </Title>
                  <p className="text-green-100 mb-0">Wallet Balance</p>
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1" type="card">
              <TabPane tab={<span><Activity size={16} className="mr-2" />Overview</span>} key="1">
                <Row gutter={[16, 16]} className="mb-6">
                  <Col span={8}>
                    <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart size={24} className="text-blue-600" />
                      </div>
                      <Statistic
                        value={customerData.customerCart?.cartItems?.length || 0}
                        title="Cart Items"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package size={24} className="text-green-600" />
                      </div>
                      <Statistic
                        value={customerData.customerOrders?.length || 0}
                        title="Total Orders"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp size={24} className="text-purple-600" />
                      </div>
                      <Statistic
                        value={customerData.customerWallet?.transactions?.length || 0}
                        title="Transactions"
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card title="Account Details" className="hover:shadow-lg transition-shadow">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar size={20} className="text-blue-600" />
                        <div>
                          <p className="text-gray-500 mb-0">Member Since</p>
                          <p className="font-semibold mb-0">
                            {new Date(customerData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock size={20} className="text-green-600" />
                        <div>
                          <p className="text-gray-500 mb-0">Last Active</p>
                          <p className="font-semibold mb-0">
                            {customerData.customerLastLogin ?
                              new Date(customerData.customerLastLogin).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </TabPane>

              <TabPane tab={<span><CreditCard size={16} className="mr-2" />Wallet</span>} key="2">
                <Card className="mb-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white">
                    <Title level={2} className="text-white mb-2">
                      ₹{customerData.customerWallet?.balance?.toFixed(2) || '0.00'}
                    </Title>
                    <p className="mb-0">Available Balance</p>
                    <Tag color="gold" className="mt-2">
                      Wallet ID: {customerData.customerWallet?.walletId}
                    </Tag>
                  </div>
                </Card>

                {customerData.customerWallet?.transactions?.length > 0 ? (
                  <Card title="Recent Transactions">
                    <List
                      itemLayout="horizontal"
                      dataSource={customerData.customerWallet.transactions.slice(0, 5)}
                      renderItem={(transaction: any) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.transactionType === 'credit' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                <TrendingUp size={16} className={
                                  transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                                } />
                              </div>
                            }
                            title={transaction.transactionDescription}
                            description={new Date(transaction.transactionDate).toLocaleDateString()}
                          />
                          <div className={`font-semibold ${transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {transaction.transactionType === 'credit' ? '+' : '-'}₹{Math.abs(transaction.transactionAmount)}
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                ) : (
                  <Empty description="No transactions yet" />
                )}
              </TabPane>

              <TabPane tab={<span><ShoppingBag size={16} className="mr-2" />Orders</span>} key="3">
                {customerData.customerOrders?.length > 0 ? (
                  <Timeline mode="left">
                    {customerData.customerOrders.slice(0, 5).map((order) => (
                      <Timeline.Item
                        key={order.orderId}
                        color={order.orderStatus === 'delivered' ? 'green' : 'blue'}
                        label={new Date(order.orderDate).toLocaleDateString()}
                      >
                        <Card size="small" className="hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold mb-1">Order #{order.orderId.slice(-8)}</p>
                              <p className="text-gray-600 mb-2">
                                {order.orderItems?.length || 0} items
                              </p>
                              <Tag color={order.orderStatus === 'delivered' ? 'green' : 'processing'}>
                                {order.orderStatus}
                              </Tag>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg mb-0">₹{order.totalAmount}</p>
                              <p className="text-gray-500 text-sm mb-0">
                                Est: {new Date(order.estimatedDeliveryTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="No orders yet" />
                )}
              </TabPane>

              {/* 2FA Status */}
              <TabPane tab={<span><User size={16} className="mr-2" />2FA Status</span>} key="4">
                <div className="mt-2 flex items-center gap-2">
                  <Tag color={customerData.is2FAEnabled ? 'green' : 'red'}>
                    {customerData.is2FAEnabled ? (
                      <span><CheckCircle size={14} className="mr-1" /> 2FA Enabled</span>
                    ) : (
                      <span><XCircle size={14} className="mr-1" /> 2FA Disabled</span>
                    )}
                  </Tag>
                  <Switch
                    checked={customerData.is2FAEnabled}
                    onChange={handle2FA}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        );

      case 'seller':
        const sellerData = profileData as SellerProfile;
        const approvalProgress = sellerData.isApproved ? 100 : 60;

        return (
          <div className="enhanced-profile">
            {/* Hero Section */}
            <div className="profile-hero bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar size={80} className="bg-white text-purple-600 text-2xl font-bold">
                    {sellerData.sellerName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-purple-500 w-6 h-6 rounded-full flex items-center justify-center">
                    {getStatusIcon(sellerData.isApproved)}
                  </div>
                </div>
                <div className="flex-1">
                  <Title level={2} className="text-white mb-2">
                    {sellerData.storeName}
                  </Title>
                  <p className="text-purple-100 mb-1 text-lg">{sellerData.sellerName}</p>
                  <p className="text-purple-100 mb-3">{sellerData.sellerEmail}</p>
                  <div className="flex items-center gap-3">
                    <Tag color="purple">Seller</Tag>
                    <div className="flex items-center gap-2 text-purple-100">
                      <MapPin size={16} />
                      <span>{sellerData.city}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Progress
                    type="circle"
                    percent={approvalProgress}
                    width={60}
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                    format={() => sellerData.isApproved ? '✓' : '⏳'}
                  />
                  <p className="text-purple-100 mt-2 mb-0">
                    {sellerData.isApproved ? 'Approved' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1" type="card">
              <TabPane tab={<span><Store size={16} className="mr-2" />Store Overview</span>} key="1">
                <Row gutter={[16, 16]} className="mb-6">
                  <Col span={8}>
                    <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package size={24} className="text-blue-600" />
                      </div>
                      <Statistic
                        value={sellerData.sellerProducts?.length || 0}
                        title="Total Products"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={24} className="text-green-600" />
                      </div>
                      <Statistic
                        value={sellerData.sellerProducts?.filter(p => p.isActive)?.length || 0}
                        title="Active Products"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingBag size={24} className="text-orange-600" />
                      </div>
                      <Statistic
                        value={sellerData.sellerOrders?.length || 0}
                        title="Order Items"
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="Store Status" className="hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Approval Status</span>
                          <Badge
                            status={sellerData.isApproved ? "success" : "warning"}
                            text={sellerData.isApproved ? "Approved" : "Pending Approval"}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Account Status</span>
                          <Badge
                            status={sellerData.isActive ? "success" : "error"}
                            text={sellerData.isActive ? "Active" : "Inactive"}
                          />
                        </div>
                        <Divider />
                        <div className="flex justify-between items-center">
                          <span>Store Created</span>
                          <span>{new Date(sellerData.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Store Information" className="hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Store size={16} className="text-purple-600" />
                          <div>
                            <p className="text-gray-500 mb-0">Store Name</p>
                            <p className="font-semibold mb-0">{sellerData.storeName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-blue-600" />
                          <div>
                            <p className="text-gray-500 mb-0">Location</p>
                            <p className="font-semibold mb-0">{sellerData.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-green-600" />
                          <div>
                            <p className="text-gray-500 mb-0">Last Login</p>
                            <p className="font-semibold mb-0">
                              {sellerData.sellerLastLogin ?
                                new Date(sellerData.sellerLastLogin).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab={<span><Package size={16} className="mr-2" />Products</span>} key="2">
                {sellerData.sellerProducts?.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {sellerData.sellerProducts.slice(0, 6).map((product) => (
                      <Col span={8} key={product.id}>
                        <Card
                          size="small"
                          className="hover:shadow-lg transition-all hover:scale-105"
                          actions={[
                            <Tooltip title={product.isActive ? 'Active' : 'Inactive'}>
                              {product.isActive ?
                                <CheckCircle size={16} className="text-green-600" /> :
                                <AlertCircle size={16} className="text-red-600" />}
                            </Tooltip>
                          ]}
                        >
                          <Meta
                            title={
                              <Tooltip title={product.name}>
                                <div className="truncate">{product.name}</div>
                              </Tooltip>
                            }
                            description={
                              <div>
                                <p className="text-lg font-bold text-green-600 mb-1">₹{product.price}</p>
                                <p className="text-gray-500 mb-0">Stock: {product.stockQuantity}</p>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="No products yet" />
                )}
              </TabPane>

              <TabPane tab={<span><ShoppingBag size={16} className="mr-2" />Orders</span>} key="3">
                {sellerData.sellerOrders?.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={sellerData.sellerOrders.slice(0, 10)}
                    renderItem={(order) => (
                      <List.Item className="hover:bg-gray-50 p-4 rounded-lg transition-colors">
                        <List.Item.Meta
                          avatar={
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <ShoppingBag size={16} className="text-purple-600" />
                            </div>
                          }
                          title={`Order #${order.orderId.slice(-8)}`}
                          description={
                            <div>
                              <p className="mb-1">Product: {order.productId.slice(-8)}</p>
                              <p className="mb-0">Quantity: {order.quantity}</p>
                            </div>
                          }
                        />
                        <div className="text-right">
                          <p className="font-bold text-lg mb-1">₹{order.priceAtPurchase}</p>
                          <Tag color={order.status === 'completed' ? 'green' : 'processing'}>
                            {order.status}
                          </Tag>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No orders yet" />
                )}
              </TabPane>

              {/* 2FA Status */}
              <TabPane tab={<span><User size={16} className="mr-2" />2FA Status</span>} key="4">
                <div className="mt-2 flex items-center gap-2">
                  <Tag color={sellerData.is2FAEnabled ? 'green' : 'red'}>
                    {sellerData.is2FAEnabled ? (
                      <span><CheckCircle size={14} className="mr-1" /> 2FA Enabled</span>
                    ) : (
                      <span><XCircle size={14} className="mr-1" /> 2FA Disabled</span>
                    )}
                  </Tag>
                  <Switch
                    checked={sellerData.is2FAEnabled}
                    onChange={handle2FA}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <Empty description={`Unknown role: ${currentRole}`} />
          </div>
        );
    }
  };

  return (
    <>
      <AntHeader className="bg-white p-0 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center">
          <Button
            type="text"
            icon={<Menu size={20} />}
            onClick={() => setCollapsed(!collapsed)}
            className="mr-4"
          />
          <h1 className="text-lg font-medium m-0">{title}</h1>
        </div>

        <Space size={16}>
          {user?.roles?.length > 1 && (
            <Select
              size="small"
              value={activeRole}
              onChange={handleRoleChange}
              style={{ width: 120 }}
              options={roleOptions}
            />
          )}

          {activeRole === "customer" && (
            <Link to="/cart">
              <Badge count={totalItems} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCart size={20} className="text-gray-600" />}
                />
              </Badge>
            </Link>
          )}

          {/* show here the reamining pending approvals */}
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<Bell size={20} className="text-gray-600" />}
            />
          </Badge>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer">
              <Avatar className="bg-primary-500" size="small">
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <span className="text-sm hidden md:inline-block">{user?.name}</span>
            </Space>
          </Dropdown>
        </Space>
      </AntHeader>

      {/* Profile Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <User size={20} />
            <Title level={4} style={{ margin: 0 }}>
              {currentRole ? `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Profile` : 'User Profile'}
            </Title>
          </div>
        }
        open={isProfileModalOpen}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
          // <Button key="edit" type="primary" disabled={!profileData}>
          //   Edit Profile
          // </Button>,
        ]}
      width={800}
      >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : profileData ? (
        renderProfileContent()
      ) : (
        <div className="text-center py-8 text-gray-500">
          No profile data available
        </div>
      )}
    </Modal >
    </>
  );
};

export default Header;
