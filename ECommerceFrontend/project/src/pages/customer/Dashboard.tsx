import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Button,
  Divider,
  Typography,
  message,
  Tag,
  Modal,
} from "antd";
import {
  ShoppingBag,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Heart,
  Eye,
  TrendingUp,
  CheckCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useCustomer } from "../../context/CustomerContext";

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const { customer, getCustomerProfile } = useCustomer();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const isCustomerFetched = await getCustomerProfile();
        if (!isCustomerFetched) {
          message.error("Something went wrong while fetching customer profile");
        }
      } catch (error) {
        console.error("Error while fethcing customer profile: ", error);
      }
    };

    fetchCustomerProfile();
  }, []);

  // console.log("Customer: " + customer);

  const totalOrders = customer?.customerOrders?.length || 0;

  const totalApprovedOrder =
    customer?.customerOrders?.filter((order: any) => order.orderStatus === 2)
      .length || 0;

  const pendingDeliveries = useMemo(() => {
    return (
      customer?.customerOrders?.filter((order: any) =>
        [0, 1, 2].includes(order.orderStatus)
      ).length || 0
    );
  }, [customer]);

  const totalSpent = useMemo(() => {
    return (
      customer?.customerWallet?.transactions
        ?.filter((tx: any) => tx.transactionType === "Debit")
        .reduce((acc: any, tx: any) => acc + tx.transactionAmount, 0) || 0
    );
  }, [customer]);

  const recentOrders = useMemo(() => {
    return (
      customer?.customerOrders
        ?.sort(
          (a: any, b: any) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )
        .slice(0, 3)
        .map((order: any) => ({
          id: order.orderId,
          date: new Date(order.orderDate).toLocaleDateString(),
          status: order.orderStatus,
          total: order.totalAmount,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          orderDate: order.orderDate,
          orderItems: order.orderItems,
        })) || []
    );
  }, [customer]);

  const orderStatusMap = {
    0: { label: "Pending", color: "text-warning-500" },
    1: { label: "Partially Approved", color: "text-orange-500" },
    2: { label: "Approved", color: "text-primary-500" },
    3: { label: "Rejected", color: "text-red-500" },
    4: { label: "Cancelled", color: "text-gray-500" },
    5: { label: "Delivered", color: "text-success-500" },
  };

  // Map for order status
  const orderItemStatusMap = {
    0: <Tag color="orange">Pending</Tag>,
    1: <Tag color="green">Approved</Tag>,
    2: <Tag color="red">Rejected</Tag>,
  };

  // Format date string to a more readable format
  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const onClose = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  // Mock recent activity data
  const recentActivity = [
    {
      action: "Viewed Product",
      item: "Wireless Headphones",
      time: "2 hours ago",
    },
    { action: "Added to Wishlist", item: "Smart Watch", time: "1 day ago" },
    { action: "Reviewed", item: "Laptop Backpack", time: "3 days ago" },
  ];

  return (
    <>
      <div>
        <div className="mb-6">
          <Title level={3}>Welcome back, {user?.name}!</Title>
          <Text type="secondary">
            Here's what's happening with your account today.
          </Text>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={totalOrders}
                prefix={
                  <ShoppingBag className="mr-2 text-primary-500" size={18} />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Delivery"
                value={pendingDeliveries}
                prefix={<Clock className="mr-2 text-warning-500" size={18} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Spent"
                value={totalSpent}
                precision={2}
                prefix={
                  <CreditCard className="mr-2 text-success-500" size={18} />
                }
                suffix="$"
              />
            </Card>
          </Col>
          {/* <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Saved Addresses" 
              value={3}
              prefix={<MapPin className="mr-2 text-error-500" size={18} />} 
            />
          </Card>
        </Col> */}
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Approved Orders"
                value={totalApprovedOrder}
                prefix={
                  <CheckCircle className="mr-2 text-error-500" size={18} />
                }
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title="Recent Orders"
              extra={<Link to="/orders">View All</Link>}
            >
              <List
                dataSource={recentOrders}
                renderItem={(item: any) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      // <Link to={`/orders/${item.id}`} key="view">
                      //   <Button type="link" size="small">View Details</Button>
                      // </Link>

                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleViewDetails(item)}
                      >
                        View Details
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Package size={24} className="text-gray-600" />}
                      title={<Link to={`/orders/${item.id}`}>{item.id}</Link>}
                      description={`Order Date: ${item.date}`}
                    />
                    <div>
                      <Text strong>${item.total.toFixed(2)}</Text>
                      <br />
                      <Text
                        className={`text-xs ${
                          orderStatusMap[item.status]?.color || "text-gray-400"
                        }`}
                      >
                        {orderStatusMap[item.status]?.label || "Unknown"}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Recent Activity"
              extra={
                <Button type="text" size="small">
                  Clear
                </Button>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={recentActivity}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        item.action === "Viewed Product" ? (
                          <Eye size={18} className="text-blue-500" />
                        ) : item.action === "Added to Wishlist" ? (
                          <Heart size={18} className="text-red-500" />
                        ) : (
                          <TrendingUp size={18} className="text-green-500" />
                        )
                      }
                      title={item.action}
                      description={
                        <>
                          <Text>{item.item}</Text>
                          <div className="text-xs text-gray-400">
                            {item.time}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {selectedOrder && (
        <Modal
          title={`Order Details - ${selectedOrder.id}`}
          visible={modalVisible}
          onCancel={onClose}
          footer={null}
          width={800}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Order Date:</Text>
                <Text className="block">
                  {formatDate(selectedOrder.orderDate)}
                </Text>
              </div>
              <div>
                <Text strong>Estimated Delivery:</Text>
                <Text className="block">
                  {formatDate(selectedOrder.estimatedDeliveryTime)}
                </Text>
              </div>
            </div>

            <div>
              <Text strong>Status:</Text>
              <Tag
                color={orderStatusMap[selectedOrder.status]?.tagColor || "default"}
                className="ml-2"
              >
                {orderStatusMap[selectedOrder.status]?.label || "Unknown"}
              </Tag>
            </div>

            <Divider orientation="left">Order Items</Divider>

{selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
            <List
              dataSource={selectedOrder.orderItems}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Tag
                       color={
                          item.orderItemStatus === 0
                            ? "orange"
                            : item.orderItemStatus === 1
                            ? "green"
                            : "red"
                        }
                    >
                      {item.orderItemStatus === 0
                          ? "Pending"
                          : item.orderItemStatus === 1
                          ? "Approved"
                          : "Rejected"}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    title={`Product ID: ${item.productId}`}
                    description={
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Text strong>Name:</Text>
                          <Text className="block">{item.productName}</Text>
                        </div>
                        <div>
                          <Text strong>Quantity:</Text>
                          <Text className="block">{item.quantity}</Text>
                        </div>
                        <div>
                          <Text strong>Price:</Text>
                          <Text className="block">
                            ${item.priceAtPurchase.toFixed(2)}
                          </Text>
                        </div>
                        <div>
                          <Text strong>Total:</Text>
                          <Text className="block">
                            ${(item.quantity * item.priceAtPurchase).toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
             ) : (
              <Text>No items found for this order.</Text>
            )}

            <Divider />

            <div className="text-right">
              <Text strong className="text-lg">
                Order Total: ${selectedOrder.total.toFixed(2)}
              </Text>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Dashboard;
