// import React from 'react';
import { Card, Row, Col, Statistic, Table, Button, Progress, Divider, Typography } from 'antd';
import { 
  Users, ShoppingBag, TrendingUp, DollarSign, Package, 
  ShoppingCart, AlertTriangle, Truck, BarChart, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Mock data for recent orders
  const recentOrders = [
    { id: 'ORD-1234', customer: 'John Doe', date: '2023-06-01', status: 'Delivered', total: 129.99 },
    { id: 'ORD-1235', customer: 'Alice Smith', date: '2023-06-01', status: 'Processing', total: 79.50 },
    { id: 'ORD-1236', customer: 'Bob Johnson', date: '2023-05-31', status: 'Shipped', total: 199.99 },
    { id: 'ORD-1237', customer: 'Emma Davis', date: '2023-05-31', status: 'Pending', total: 149.95 },
    { id: 'ORD-1238', customer: 'Michael Brown', date: '2023-05-30', status: 'Delivered', total: 89.99 },
  ];
  
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let icon = null;
        
        switch (status) {
          case 'Delivered':
            color = 'text-success-500';
            icon = <Package size={14} />;
            break;
          case 'Shipped':
            color = 'text-primary-500';
            icon = <Truck size={14} />;
            break;
          case 'Processing':
            color = 'text-warning-500';
            icon = <ShoppingCart size={14} />;
            break;
          case 'Pending':
            color = 'text-gray-500';
            icon = <AlertTriangle size={14} />;
            break;
          default:
            color = 'text-gray-500';
        }
        
        return (
          <div className={`flex items-center ${color}`}>
            <span className="mr-1">{icon}</span>
            {status}
          </div>
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button size="small">View</Button>,
    },
  ];
  
  return (
    <div>
      <div className="mb-6">
        <Title level={3}>Admin Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.name}. Here's what's happening with your store today.</Text>
      </div>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Revenue" 
              value={15420.50}
              precision={2}
              prefix={<DollarSign className="mr-2 text-primary-500" size={18} />}
              suffix="$"
            />
            <div className="text-success-500 text-xs mt-2">+15% from last month</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Orders" 
              value={254}
              prefix={<ShoppingBag className="mr-2 text-warning-500" size={18} />} 
            />
            <div className="text-success-500 text-xs mt-2">+24% from last month</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Customers" 
              value={1245}
              prefix={<Users className="mr-2 text-success-500" size={18} />} 
            />
            <div className="text-success-500 text-xs mt-2">+10% from last month</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Conversion Rate" 
              value={5.6}
              precision={1}
              prefix={<TrendingUp className="mr-2 text-error-500" size={18} />}
              suffix="%"
            />
            <div className="text-error-500 text-xs mt-2">-2% from last month</div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Orders">
            <Table 
              dataSource={recentOrders} 
              columns={columns} 
              pagination={false}
              rowKey="id"
              size="small"
            />
            <div className="mt-4 text-right">
              <Button type="link">View All Orders</Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Sales Analytics">
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Electronics</Text>
                <Text strong>45%</Text>
              </div>
              <Progress percent={45} showInfo={false} status="active" strokeColor="#1677ff" />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Clothing</Text>
                <Text strong>30%</Text>
              </div>
              <Progress percent={30} showInfo={false} status="active" strokeColor="#52c41a" />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Home & Kitchen</Text>
                <Text strong>15%</Text>
              </div>
              <Progress percent={15} showInfo={false} status="active" strokeColor="#faad14" />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Beauty</Text>
                <Text strong>10%</Text>
              </div>
              <Progress percent={10} showInfo={false} status="active" strokeColor="#f5222d" />
            </div>
            
            <Divider />
            
            <div className="flex justify-between">
              <Button icon={<BarChart size={16} />}>Full Report</Button>
              <Button icon={<BarChart3 size={16} />}>Export</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;