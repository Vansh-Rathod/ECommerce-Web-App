import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Typography,
  Popconfirm,
  Tabs,
  message,
} from "antd";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useOrder } from "../../context/OrderContext";
import api from "../../services/api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;



// Status mapping functions
const mapOrderStatus = (status: number): string => {
  switch (status) {
    case 0: return "pending";
    case 1: return "partial";
    case 2: return "approved";
    case 3: return "rejected";
    case 4: return "cancelled";
    case 5: return "delivered";
    default: return "pending";
  }
};

const mapItemStatus = (status: number): string => {
  switch (status) {
    case 0: return "pending";
    case 1: return "approved";
    case 2: return "rejected";
    default: return "pending";
  }
};

const statusTagConfig = {
  pending: { color: "orange", text: "Pending", icon: <Clock size={14} /> },
  partial: {
    color: "blue",
    text: "Partial Approval",
    icon: <Clock size={14} />,
  },
  approved: { color: "green", text: "Approved", icon: <ThumbsUp size={14} /> },
  rejected: { color: "red", text: "Rejected", icon: <ThumbsDown size={14} /> },
  cancelled: { color: "red", text: "Cancelled", icon: <ThumbsDown size={14} /> },
  delivered: { color: "green", text: "Delivered", icon: <ThumbsUp size={14} /> },
};

const itemStatusConfig:any = {
  pending: { color: "gold", text: "Pending" },
  approved: { color: "green", text: "Approved" },
  rejected: { color: "red", text: "Rejected" },
};

const SellerOrdersPage = () => {
  const { sellerOrders, getSellerOrders } = useOrder();
  const [activeTab, setActiveTab] = useState("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  //   const [orders, setOrders] = useState(mockOrders);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const isSellerOrdersFetched = await getSellerOrders();
        if (!isSellerOrdersFetched) {
          message.error("Something went wrong while fetching seller orders");
        }
      } catch (error) {
        console.error("Error while fethcing seller orders: ", error);
      }
    };

    fetchSellerOrders();
  }, []);

  console.log("Orders: " + JSON.stringify(sellerOrders));

  // approve order item
  const handleApproveItem = async (orderItemId: string) => {
    setProcessing(orderItemId);
    try {
      const response = await api.put(`/order/approve/${orderItemId}`);
      if (response.data.status !== 200) {
        message.error("Something went wrong while approving order item");
      }
      message.success(response.data.message || "Order item approved successfully");
      await getSellerOrders();
    } catch (error) {
      message.error("Failed to approve item: " + error);
    } finally {
      setProcessing(null);
    }
  };

  // reject order item
  const handleRejectItem = async (orderItemId: string) => {
    setProcessing(orderItemId);
    try {
      const response = await api.put(`/order/reject/${orderItemId}`);
      if (response.data.status !== 200) {
        message.error("Something went wrong while rejecting order item");
      }
      message.success(response.data.message || "Order item rejected successfully");
      await getSellerOrders();
    } catch (error) {
      message.error("Failed to reject item: " + error);
    } finally {
      setProcessing(null);
    }
  };

  const getOrderStatus = (order: any) => {
    const mappedItems = order.orderItems.map((item: any) => ({
      ...item,
      status: mapItemStatus(item.orderItemStatus)
    }));
    
    if (mappedItems.some((i: any) => i.status === "rejected"))
      return "rejected";
    if (mappedItems.every((i: any) => i.status === "approved"))
      return "approved";
    if (mappedItems.some((i: any) => i.status === "approved"))
      return "partial";
    return "pending";
  };

  const filteredOrders = sellerOrders.filter((order: any) => {
    const status = getOrderStatus(order);
    if (activeTab === "all") {
      return true;
    }
    if (activeTab === "approved") {
      return status === "approved";
    }
    return status === "pending" || status === "partial";
  });

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id: string) => (
        <Text strong>{id.slice(0, 8).toUpperCase()}</Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Total Amount",
      dataIndex: "orderAmount",
      key: "orderAmount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Status",
      key: "status",
      render: (record: any) => {
        const status = getOrderStatus(record);
        return (
          <Tag
            color={statusTagConfig[status].color}
            className="flex items-center gap-1"
          >
            {statusTagConfig[status].icon}
            {statusTagConfig[status].text}
          </Tag>
        );
      },
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'orderStatus',
    //   key: 'status',
    //   render: statusTag
    // }
  ];

  const expandedRowRender = (order: any) => (
    <div className="px-4 py-2 bg-gray-50">
      <Title level={5} className="mb-4">
        Order Items
      </Title>
      <Table
        dataSource={order.orderItems}
        rowKey="orderItemId"
        pagination={false}
        columns={[
          {
            title: "Product",
            dataIndex: "productName",
            key: "productName",
          },
          {
            title: "Quantity",
            dataIndex: "orderItemQuantity",
            key: "orderItemQuantity",
          },
          {
            title: "Price",
            dataIndex: "priceAtPurchase",
            key: "priceAtPurchase",
            render: (price: number) => `$${price.toFixed(2)}`,
          },
          {
            title: "Stock Available",
            dataIndex: "productStockQuantity",
            key: "productStockQuantity",
            render: (stock: number, record: any) => (
              <Text className={stock < record.orderItemQuantity  ? "text-red-500" : ""}>
                {stock || "N/A"}
              </Text>
            ),
          },
          {
            title: "Item Status",
            dataIndex: "orderItemStatus",
            key: "orderItemStatus",
            render: (status: number) => {
              const mappedStatus = mapItemStatus(status);
              return (
                <Tag color={itemStatusConfig[mappedStatus].color}>
                  {itemStatusConfig[mappedStatus].text}
                </Tag>
              );
            },
          },
         {
            title: "Actions",
            key: "actions",
            render: (_: any, item: any) => {
              const itemStatus = mapItemStatus(item.orderItemStatus);
              return (
                <Space>
                  <Popconfirm
                    title="Approve this item?"
                    onConfirm={() => handleApproveItem(item.orderItemId)}
                    disabled={itemStatus !== "pending"}
                  >
                    <Button
                      type="primary"
                      ghost
                      icon={<CheckCircle size={16} />}
                      loading={processing === item.orderItemId}
                      disabled={itemStatus !== "pending"}
                      className="hover:scale-105 transition-transform"
                    >
                      Approve
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Reject this item?"
                    onConfirm={() => handleRejectItem(item.orderItemId)}
                    disabled={itemStatus !== "pending"}
                  >
                    <Button
                      danger
                      ghost
                      icon={<XCircle size={16} />}
                      loading={processing === item.orderItemId}
                      disabled={itemStatus !== "pending"}
                      className="hover:scale-105 transition-transform"
                    >
                      Reject
                    </Button>
                  </Popconfirm>
                </Space>
              );
            },
          },
        ]}
      />
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-6">
        <Title level={3} className="flex items-center gap-2">
          <Package size={24} /> Order Management
        </Title>
        <Text type="secondary">Manage and approve customer orders</Text>
      </div>

      <Card bordered={false} className="shadow-sm">
        {/* <Table
          columns={columns}
          dataSource={orders.filter(order => order.orderStatus !== 'approved')}
          rowKey="orderId"
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 5 }}
        /> */}

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <Clock /> Pending Orders
              </span>
            }
            key="pending"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ThumbsUp /> Approved Orders
              </span>
            }
            key="approved"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <Package /> All Orders
              </span>
            }
            key="all"
          />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="orderId"
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 5 }}
          rowClassName="hover:bg-gray-50 cursor-pointer"
        />
      </Card>
    </div>
  );
};

export default SellerOrdersPage;
