// import { Card, Table, Tag, Typography } from 'antd';
// import { useEffect, useState } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import { useCustomer } from '../../context/CustomerContext';

// const { Title, Text } = Typography;


// interface OrderItem {
//   id: string;
//   productId: string;
//   quantity: number;
//   priceAtPurchase: number;
//   status: string;
// }

// interface Order {
//   id: string;
//   orderDate: string;
//   estimatedDeliveryTime: string;
//   totalAmount: number;
//   status: string;
//   orderItems: OrderItem[];
// }

// // const mockOrders: Order[] = [
// //   {
// //     id: 'order1',
// //     orderDate: '2025-05-17T10:30:00Z',
// //     status: 'delivered',
// //     totalAmount: 149.99,
// //     items: [
// //       { productName: 'Wireless Mouse', quantity: 1, price: 49.99 },
// //       { productName: 'Keyboard', quantity: 1, price: 100.00 },
// //     ],
// //   },
// //   {
// //     id: 'order2',
// //     orderDate: '2025-05-15T14:20:00Z',
// //     status: 'processing',
// //     totalAmount: 299.5,
// //     items: [
// //       { productName: 'Bluetooth Headphones', quantity: 2, price: 149.75 },
// //     ],
// //   },
// //   {
// //     id: 'order3',
// //     orderDate: '2025-05-12T09:45:00Z',
// //     status: 'shipped',
// //     totalAmount: 89.00,
// //     items: [
// //       { productName: 'USB-C Hub', quantity: 1, price: 89.00 },
// //     ],
// //   },
// // ];

// const statusTag = (status: string) => {
//   const map: Record<string, { color: string; label: string }> = {
//     Pending: { color: 'orange', label: 'Pending' },
//     PartiallyApproved: { color: 'cyan', label: 'Partially Approved' },
//     Approved: { color: 'blue', label: 'Approved' },
//     Rejected: { color: 'red', label: 'Rejected' },
//     Cancelled: { color: 'volcano', label: 'Cancelled' },
//     Delivered: { color: 'green', label: 'Delivered' },
//   };
//   const { color, label } = map[status] || { color: 'default', label: status };
//   return <Tag color={color}>{label}</Tag>;
// };

// const itemStatusTag = (status: string) => {
//   const map: Record<string, { color: string; label: string }> = {
//     Pending: { color: 'orange', label: 'Pending' },
//     Approved: { color: 'blue', label: 'Approved' },
//     Rejected: { color: 'red', label: 'Rejected' },
//   };
//   const { color, label } = map[status] || { color: 'default', label: status };
//   return <Tag color={color}>{label}</Tag>;
// };

// const OrdersPage = () => {
//   const { user } = useAuth();
//   const { customer } = useCustomer();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);


// useEffect(() => {
//     // Simulate API delay
//     const timeout = setTimeout(() => {
//       setOrders(customer?.customerOrders || []);
//       setLoading(false);
//     }, 1000);

//     return () => clearTimeout(timeout);
//   }, [customer]);

//   const columns = [
//     {
//       title: 'Order ID',
//       dataIndex: 'id',
//       key: 'id',
//       render: (id: string | undefined) =>
//         id ? <Text strong>{id.slice(0, 8).toUpperCase()}</Text> : '-',
//     },
//     {
//       title: 'Date',
//       dataIndex: 'orderDate',
//       key: 'orderDate',
//       render: (date: string | undefined) =>
//         date ? new Date(date).toLocaleDateString() : '-',
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//     //   render: (status: string) => (
//     //     <Tag color={
//     //       status === 'delivered' ? 'green' : 
//     //       status === 'shipped' ? 'blue' : 
//     //       status === 'processing' ? 'orange' : 'red'
//     //     }>
//     //       {status.toUpperCase()}
//     //     </Tag>
//     //   ),
//     render: (status: string) => statusTag(status),
//     },
//     {
//       title: 'Items',
//       dataIndex: 'orderItems',
//       key: 'orderItems',
//       render: (items: OrderItem[] | undefined) => items?.length ?? 0,
//     },
//     {
//       title: 'Total',
//       dataIndex: 'totalAmount',
//       key: 'totalAmount',
//       render: (amount: number | undefined) =>
//         typeof amount === 'number' ? `$${amount.toFixed(2)}` : '-',
//     },
//   ];

//   return (
//     <div className="p-4">
//       <Title level={3} className="mb-4">My Orders</Title>
//       <Card bordered={false} className="shadow-sm">
//         <Table
//           columns={columns}
//           dataSource={orders}
//           rowKey="id"
//           loading={loading}
//           expandable={{
//             expandedRowRender: (record: Order) => (
//             //   <div className="px-4 py-2">
//             //     <div className="mb-2">
//             //       <Text strong>Order Details:</Text>
//             //     </div>
//             //     {record.items.map((item, index) => (
//             //       <div key={index} className="flex justify-between mb-2">
//             //         <Text>{item.productName}</Text>
//             //         <div className="flex gap-4">
//             //           <Text>Qty: {item.quantity}</Text>
//             //           <Text>Price: ${item.price.toFixed(2)}</Text>
//             //         </div>
//             //       </div>
//             //     ))}
//             //   </div>

//             <div className="px-4 py-2">
//                 <Text strong>Order Details:</Text>
//                 {record.orderItems.map((item, index) => (
//                   <div key={index} className="flex justify-between mb-2">
//                     <Text>Product ID: {item.productId}</Text>
//                     <div className="flex gap-4">
//                       <Text>Qty: {item.quantity}</Text>
//                       <Text>Price: ${item.priceAtPurchase.toFixed(2)}</Text>
//                       <Text>Status: {item.status}</Text>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ),
//           }}
//           pagination={{ pageSize: 10 }}
//         />
//       </Card>
//     </div>
//   );
// };

// export default OrdersPage;




















import { Card, Table, Tag, Typography, Tooltip, Space, Badge } from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../context/CustomerContext';
import { ClockCircleOutlined, CheckCircleOutlined, TruckOutlined } from '@ant-design/icons';

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
  const { user } = useAuth();
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer?.customerOrders) {
      setOrders(customer.customerOrders);
      setLoading(false);
    } else {
      // Fallback for when orders might load with delay
      const timeout = setTimeout(() => {
        setOrders(customer?.customerOrders || []);
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [customer]);

  const renderOrderStatus = (status: number) => {
    const { text, color, icon } = ORDER_STATUS_MAP[status] || { 
      text: 'Unknown', 
      color: 'default', 
      icon: null 
    };
    
    return (
      <Space>
        {icon && icon}
        <Tag color={color}>{text}</Tag>
      </Space>
    );
  };

  const renderOrderItemStatus = (status: number) => {
    const { text, color } = ORDER_ITEM_STATUS_MAP[status] || { 
      text: 'Unknown', 
      color: 'default' 
    };
    
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id: string) => (
        <Tooltip title={id}>
          <Text strong>{id.slice(0, 8)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString();
        const formattedTime = new Date(date).toLocaleTimeString();
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
      render: renderOrderStatus,
    },
    {
      title: 'Items',
      dataIndex: 'orderItems',
      key: 'orderItems',
      render: (items: OrderItem[]) => {
        return (
          <Badge count={items.length} showZero color="#108ee9" />
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Delivery',
      dataIndex: 'estimatedDeliveryTime',
      key: 'estimatedDeliveryTime',
      render: (time: string) => {
        const date = new Date(time);
        const now = new Date();
        const isDelivered = date < now;
        
        if (isDelivered) {
          return <Tag color="green">Delivered</Tag>;
        }
        
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
            expandedRowRender: (record: Order) => (
              <div className="px-4 py-2">
                <Text strong className="block mb-2">Order Details:</Text>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={record.orderItems}
                  rowKey="orderItemId"
                  columns={[
                    {
                      title: 'Product ID',
                      dataIndex: 'productId',
                      key: 'productId',
                      render: (id: string) => (
                        <Tooltip title={id}>
                          <Text>{id.slice(0, 8)}...</Text>
                        </Tooltip>
                      ),
                    },
                    {
                      title: 'Quantity',
                      dataIndex: 'quantity',
                      key: 'quantity',
                    },
                    {
                      title: 'Price',
                      dataIndex: 'priceAtPurchase',
                      key: 'priceAtPurchase',
                      render: (price: number) => `$${price.toFixed(2)}`,
                    },
                    {
                      title: 'Total',
                      key: 'total',
                      render: (_, item: OrderItem) => 
                        `$${(item.quantity * item.priceAtPurchase).toFixed(2)}`,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'orderItemStatus',
                      key: 'orderItemStatus',
                      render: renderOrderItemStatus,
                    },
                  ]}
                />
              </div>
            ),
          }}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default OrdersPage;