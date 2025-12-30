import { Card, Table, Tag, Typography, Tooltip, Space, Badge, message } from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../context/CustomerContext';
import { ClockCircleOutlined, CheckCircleOutlined, TruckOutlined } from '@ant-design/icons';
import { GetOrders } from '../../services/OrderApiHelperService';
import { orderItemStatusMap, orderStatusMap } from '../../Constants';
import { ThumbsDown } from 'lucide-react';

const { Title, Text } = Typography;

// Define proper interfaces that match the API response
interface OrderItem {
  orderItemId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  orderItemStatus: number;
}

interface Order {
  orderId: string;
  orderDate: string;
  estimatedDeliveryTime: string;
  totalAmount: number;
  orderStatus: number;
  orderItems: OrderItem[];
}

// Maps numeric status codes to readable text and colors
const ORDER_STATUS_MAP = {
  0: { text: 'Pending', color: 'orange', icon: <ClockCircleOutlined /> },
  1: { text: 'Processing', color: 'blue', icon: <ClockCircleOutlined /> },
  2: { text: 'Shipped', color: 'cyan', icon: <TruckOutlined /> },
  3: { text: 'Delivered', color: 'green', icon: <CheckCircleOutlined /> },
  4: { text: 'Cancelled', color: 'red', icon: null },
};

const ORDER_ITEM_STATUS_MAP = {
  0: { text: 'Pending', color: 'orange' },
  1: { text: 'Shipped', color: 'blue' },
  2: { text: 'Delivered', color: 'green' },
  3: { text: 'Cancelled', color: 'red' },
};

const OrdersPage = () => {

  const [orders, setOrders] = useState<any>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    filterByYear: "2025",
  });

  // Initial fetch of sellers
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const result = await GetOrders(
          pagination.current,
          pagination.pageSize,
          searchText,
          parseInt(filters.filterByYear)
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
  }, [pagination, searchText, filters]);

  const renderOrderStatus = (status: number) => {
    const statusInfo = orderStatusMap[status] || { text: "Unknown", color: "default", icon: null };
  
    return (
      <Space>
        {statusInfo.icon}
        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      </Space>
    );
  };
  
  const renderOrderItemStatus = (status: number) => {
    const statusInfo = orderItemStatusMap[status] || { text: "Unknown", color: "default", icon: null };
  
    return (
      <Space>
        {statusInfo.icon}
        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      </Space>
    );
  };
  

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId: string) => (
        <Tooltip title={orderId}>
          <Text strong>{orderId.slice(0, 8)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (orderDate: string) => {
        const formattedDate = new Date(orderDate).toLocaleDateString();
        const formattedTime = new Date(orderDate).toLocaleTimeString();
        return (
          <Tooltip title={`${formattedDate} ${formattedTime}`}>
            {formattedDate}
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      // render: renderOrderStatus,
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
    {
      title: 'Items',
      dataIndex: 'orderedItems',
      key: 'orderedItems',
      render: (orderedItems: any) => {
        return (
          <Badge count={orderedItems.length} showZero color="#108ee9" />
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (totalAmount: number) => `$${totalAmount.toFixed(2)}`,
    },
    {
      title: 'Delivery',
      dataIndex: 'estimatedDeliveryTime',
      key: 'estimatedDeliveryTime',
      render: (_: string, record: any) => {
        const { isDelivered, estimatedDeliveryTime, orderStatus } = record;
    
        if (isDelivered) {
          return <Tag color="green">Delivered</Tag>;
        }

        if (!estimatedDeliveryTime && !isDelivered && orderStatus === 3) {
          return (
            <Tag color="red" className="inline-flex items-center gap-1">
              <ThumbsDown size={14} />
              Order Rejected
            </Tag>
          );
        }
    
        if (!estimatedDeliveryTime) {
          return <Tag color="default"> Waiting For Approval</Tag>;
        }
    
        const date = new Date(estimatedDeliveryTime);
    
        return (
          <Tooltip title={`Estimated: ${date.toLocaleString()}`}>
            <Space>
              <ClockCircleOutlined />
              {date.toLocaleDateString()}
            </Space>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <Title level={3} className="mb-4">My Orders</Title>
      <Card bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          loading={loading}
          expandable={{
            expandedRowRender: (record: any) => (
              <div className="px-4 py-2">
                <Text strong className="block mb-2">Order Details:</Text>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={record.orderedItems}
                  rowKey="orderItemId"
                  columns={[
                    {
                      title: 'Product Name',
                      dataIndex: 'productName',
                      key: 'productName',
                      render: (productName: string) => (
                        <Tooltip title={productName}>
                          <Text>{productName.slice(0, 20)}...</Text>
                        </Tooltip>
                      ),
                    },
                    {
                      title: 'Quantity',
                      dataIndex: 'orderedQuantity',
                      key: 'orderedQuantity',
                    },
                    {
                      title: 'Price',
                      dataIndex: 'priceAtPurchase',
                      key: 'priceAtPurchase',
                      render: (priceAtPurchase: number) => `$${priceAtPurchase.toFixed(2)}`,
                    },
                    {
                      title: 'Total',
                      key: 'total',
                      render: (_, item: any) => 
                        `$${(item.orderedQuantity * item.priceAtPurchase).toFixed(2)}`,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'orderItemStatus',
                      key: 'orderItemStatus',
                      // render: renderOrderItemStatus,
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
                  ]}
                />
              </div>
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalOrders,
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      </Card>
    </div>
  );
};

export default OrdersPage;