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
  Input,
  Spin,
  Tooltip,
  Select,
} from "antd";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsDown,
  ThumbsUp,
  Search,
} from "lucide-react";
import { useOrder } from "../../context/OrderContext";
import api from "../../services/api";
import {
  ApproveOrderItem,
  GetSellerOrders,
  RejectOrderItem,
} from "../../services/OrderApiHelperService";
import { orderStatusMap, orderItemStatusMap } from "../../Constants";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;



// Status mapping functions
const mapOrderStatus = (status: number): string => {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "partial";
    case 2:
      return "approved";
    case 3:
      return "rejected";
    case 4:
      return "cancelled";
    case 5:
      return "delivered";
    default:
      return "pending";
  }
};

const mapItemStatus = (status: number): string => {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "approved";
    case 2:
      return "rejected";
    default:
      return "pending";
  }
};

const statusTagConfig = {
  pending: { color: "orange", text: "Pending", icon: <Clock size={14} /> },
  partiallyApproved: {
    color: "blue",
    text: "Partial Approval",
    icon: <Clock size={14} />,
  },
  approved: { color: "green", text: "Approved", icon: <ThumbsUp size={14} /> },
  rejected: { color: "red", text: "Rejected", icon: <ThumbsDown size={14} /> },
  cancelled: {
    color: "red",
    text: "Cancelled",
    icon: <ThumbsDown size={14} />,
  },
  delivered: {
    color: "green",
    text: "Delivered",
    icon: <ThumbsUp size={14} />,
  },
};

const itemStatusConfig: any = {
  pending: { color: "gold", text: "Pending" },
  approved: { color: "green", text: "Approved" },
  rejected: { color: "red", text: "Rejected" },
};

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState<any>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    filterByPrice: "all",
  });

  const [activeTab, setActiveTab] = useState("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  // Initial fetch of orders
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const result = await GetSellerOrders(
          pagination.current,
          pagination.pageSize,
          searchText,
          activeTab
        );

        if (result.success) {
          setOrders(result.data.orders);
          setTotalOrders(result.data.totalOrders);
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
      } catch (error) {
        message.error("Something went wrong while fetching orders");
        console.error("Something went wrong while fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [pagination, searchText, activeTab]);

  // approve order item
  const handleApproveItem = async (orderItemId: string) => {
    setProcessing(orderItemId);
    try {
      const result = await ApproveOrderItem(orderItemId);
      if (!result.success) {
        message.error(result.error);
        return;
      }
      message.success(result.message);

      // Refresh the orders list
      const refreshedOrders = await GetSellerOrders(
        pagination.current,
        pagination.pageSize,
        searchText,
        activeTab
      );

      if (!refreshedOrders.success) {
        message.error(refreshedOrders.error);
        setOrders([]);
        setTotalOrders(0);
        return;
      }

      setOrders(refreshedOrders.data.orders);
      setTotalOrders(refreshedOrders.data.totalOrders);
    } catch (error) {
      message.error("Failed to approve item");
      console.error("Failed to approve item: ", error);
    } finally {
      setProcessing(null);
    }
  };

  // reject order item
  const handleRejectItem = async (orderItemId: string) => {
    setProcessing(orderItemId);
    try {
      const result = await RejectOrderItem(orderItemId);
      if (!result.success) {
        message.error(result.error);
        return;
      }
      message.success(result.message);

      // Refresh the orders list
      const refreshedOrders = await GetSellerOrders(
        pagination.current,
        pagination.pageSize,
        searchText,
        activeTab
      );

      if (!refreshedOrders.success) {
        message.error(refreshedOrders.error);
        setOrders([]);
        setTotalOrders(0);
        return;
      }

      setOrders(refreshedOrders.data.orders);
      setTotalOrders(refreshedOrders.data.totalOrders);
    } catch (error) {
      message.error("Failed to reject item");
      console.error("Failed to reject item: ", error);
    } finally {
      setProcessing(null);
    }
  };

  const getOrderStatus = (order: any) => {
    const mappedItems = order.orderItems.map((item: any) => ({
      ...item,
      status: mapItemStatus(item.orderItemStatus),
    }));

    if (mappedItems.some((i: any) => i.status === "rejected"))
      return "rejected";
    if (mappedItems.every((i: any) => i.status === "approved"))
      return "approved";
    if (mappedItems.some((i: any) => i.status === "approved")) return "partial";
    return "pending";
  };

  const filteredOrders = orders.filter((order: any) => {
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
        <Tooltip title={id}>
          <Text strong>{id.slice(0, 8).toUpperCase()}</Text>
        </Tooltip>
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
    // {
    //   title: "Status",
    //   key: "status",
    //   render: (record: any) => {
    //     const status = getOrderStatus(record);
    //     return (
    //       <Tag
    //         color={statusTagConfig[status].color}
    //         className="flex items-center gap-1"
    //       >
    //         {statusTagConfig[status].icon}
    //         {statusTagConfig[status].text}
    //       </Tag>
    //     );
    //   },
    // },
    {
      title: "Status",
      dataIndex: "orderStatus",
      render: (orderStatus: number) => {
        const cfg = orderStatusMap[orderStatus] || orderStatusMap[0];
        return (
          <Tag color={cfg.color} className="flex items-center gap-1">
            {cfg.icon}
            {cfg.text}
          </Tag>
        );
      },
    },
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
              <Text
                className={
                  stock < record.orderItemQuantity ? "text-red-500" : ""
                }
              >
                {stock || "N/A"}
              </Text>
            ),
          },
          // {
          //   title: "Item Status",
          //   dataIndex: "orderItemStatus",
          //   key: "orderItemStatus",
          //   render: (status: number) => {
          //     const mappedStatus = mapItemStatus(status);
          //     return (
          //       <Tag color={itemStatusConfig[mappedStatus].color}>
          //         {itemStatusConfig[mappedStatus].text}
          //       </Tag>
          //     );
          //   },
          // },
          {
            title: "Item Status",
            dataIndex: "orderItemStatus",
            render: (orderItemStatus: number) => {
              const cfg =
                orderItemStatusMap[orderItemStatus] || orderItemStatusMap[0];
              return (
                <Tag color={cfg.color} className="flex items-center gap-1">
                  {cfg.icon}
                  {cfg.text}
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
          // {
          //   title: "Actions",
          //   render: (_: any, item: any) => (
          //     <Space>
          //       <Button
          //         type="primary"
          //         ghost
          //         icon={<CheckCircle size={16} />}
          //         onClick={() => handleApproveItem(item.orderItemId)}
          //         loading={processing === item.orderItemId}
          //       >
          //         Approve
          //       </Button>
          //       <Button
          //         danger
          //         ghost
          //         icon={<XCircle size={16} />}
          //         onClick={() => handleRejectItem(item.orderItemId)}
          //         loading={processing === item.orderItemId}
          //       >
          //         Reject
          //       </Button>
          //     </Space>
          //   ),
          // },
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

      <Card className="mb-6 shadow-sm border-0">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex-1 max-w-md">
            <Input
              size="large"
              placeholder="Search by customer name, product name or order price..."
              value={searchText}
              onChange={(e) => {
                setPagination({ ...pagination, current: 1, pageSize: 10 });
                setSearchText(e.target.value);
              }}
              prefix={<Search size={18} className="text-gray-400" />}
              allowClear
              className="shadow-lg"
              style={{ maxWidth: 500, marginBottom: 16 }}
            />
          </div>

          <Select
            placeholder="Price Range"
            value={filters.filterByPrice}
            onChange={async (value) => {
              const newPriceFilter = value || "all";
              setFilters((prev) => ({
                ...prev,
                filterByPrice: newPriceFilter,
              }));
            }}
            style={{ width: 140 }}
            size="large"
            // allowClear
            className="shadow-lg"
          >
            <Option value="all">All Prices</Option>
            <Option value="below100">Under $100</Option>
            <Option value="100to500">$100 - $500</Option>
            <Option value="above500">Above $500</Option>
          </Select>
        </div>
      </Card>

      <Card bordered={false} className="shadow-lg">
        {/* <Table
          columns={columns}
          dataSource={orders.filter(order => order.orderStatus !== 'approved')}
          rowKey="orderId"
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 5 }}
        /> */}

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination({ ...pagination, current: 1, pageSize: 10 });
          }}
        >
          {/* {Object.keys(statusTagConfig).map((status) => (
            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  {statusTagConfig[status].icon}
                  {statusTagConfig[status].text}
                </span>
              }
              key={status}
            />
          ))}
          <TabPane
            tab={
              <span>
                <Package /> All
              </span>
            }
            key="all"
          /> */}

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <Clock /> Pending
              </span>
            }
            key="pending"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <Clock /> Partially Approved
              </span>
            }
            key="partiallyApproved"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ThumbsUp /> Approved
              </span>
            }
            key="approved"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ThumbsDown /> Rejected
              </span>
            }
            key="rejected"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ThumbsDown /> Cancelled
              </span>
            }
            key="cancelled"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <ThumbsUp /> Delivered
              </span>
            }
            key="delivered"
          />
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <Package /> All
              </span>
            }
            key="all"
          />
        </Tabs>

        <Spin spinning={loading} size="large">
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="orderId"
            expandable={{ expandedRowRender }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalOrders,
              showSizeChanger: true,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
            }}
            rowClassName="hover:bg-gray-50 cursor-pointer"
          />
        </Spin>
      </Card>
    </div>
  );
};

export default SellerOrdersPage;
