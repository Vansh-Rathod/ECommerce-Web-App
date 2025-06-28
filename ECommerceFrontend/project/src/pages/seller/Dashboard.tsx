import React from 'react';
import { Card, Row, Col, Statistic, Table, Button, Progress, Divider, Typography, DatePicker } from 'antd';
import { 
  ShoppingBag, TrendingUp, DollarSign, AlertCircle,
  Package, ShoppingCart, AlertTriangle, BarChart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SellerDashboard = () => {
  const { user } = useAuth();
  
  // Mock data for products
  const products = [
    { id: 'PRD-1234', name: 'Wireless Headphones', stock: 45, price: 89.99, sales: 120 },
    { id: 'PRD-1235', name: 'Smart Watch', stock: 12, price: 199.99, sales: 75 },
    { id: 'PRD-1236', name: 'Laptop Backpack', stock: 67, price: 49.99, sales: 200 },
    { id: 'PRD-1237', name: 'Bluetooth Speaker', stock: 5, price: 59.99, sales: 85 },
    { id: 'PRD-1238', name: 'Wireless Mouse', stock: 28, price: 29.99, sales: 150 },
  ];
  
  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Inventory',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => {
        let color = 'text-success-500';
        let icon = null;
        
        if (stock <= 10) {
          color = 'text-error-500';
          icon = <AlertCircle size={14} />;
        } else if (stock <= 20) {
          color = 'text-warning-500';
          icon = <AlertTriangle size={14} />;
        }
        
        return (
          <div className={`flex items-center ${color}`}>
            {icon && <span className="mr-1">{icon}</span>}
            {stock} in stock
          </div>
        );
      },
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => `${sales} units`,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button size="small">Edit</Button>
      ),
    },
  ];
  
  return (
    <div>
      <div className="mb-6">
        <Title level={3}>Seller Dashboard</Title>
        <Text type="secondary">Welcome back, {user?.name}. Here's what's happening with your products.</Text>
      </div>
      
      <div className="mb-6 flex justify-end">
        <RangePicker className="w-64" />
      </div>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Revenue" 
              value={8420.50}
              precision={2}
              prefix={<DollarSign className="mr-2 text-primary-500" size={18} />}
              suffix="$"
            />
            <div className="text-success-500 text-xs mt-2">+8% from last month</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Sales" 
              value={154}
              prefix={<ShoppingBag className="mr-2 text-warning-500" size={18} />} 
            />
            <div className="text-success-500 text-xs mt-2">+12% from last month</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Products" 
              value={24}
              prefix={<Package className="mr-2 text-success-500" size={18} />} 
            />
            <div className="text-success-500 text-xs mt-2">+2 new this month</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Conversion Rate" 
              value={4.8}
              precision={1}
              prefix={<TrendingUp className="mr-2 text-error-500" size={18} />}
              suffix="%"
            />
            <div className="text-error-500 text-xs mt-2">-0.5% from last month</div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card 
            title="Product Inventory" 
            extra={<Button type="primary" size="small">Add Product</Button>}
          >
            <Table 
              dataSource={products} 
              columns={columns} 
              pagination={{ pageSize: 5 }}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title="Top Selling Products">
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Smart Watch</Text>
                <Text strong>$14,999</Text>
              </div>
              <Progress percent={75} showInfo={false} strokeColor="#1677ff" />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Wireless Headphones</Text>
                <Text strong>$10,799</Text>
              </div>
              <Progress percent={60} showInfo={false} strokeColor="#52c41a" />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Laptop Backpack</Text>
                <Text strong>$9,999</Text>
              </div>
              <Progress percent={55} showInfo={false} strokeColor="#faad14" />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <Text>Bluetooth Speaker</Text>
                <Text strong>$5,099</Text>
              </div>
              <Progress percent={40} showInfo={false} strokeColor="#f5222d" />
            </div>
            
            <Divider />
            
            <div className="text-right">
              <Button type="link" icon={<BarChart size={16} className="mr-1" />}>
                View Full Report
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Inventory Status">
            <div className="grid grid-cols-2 gap-4">
              <Card size="small" className="bg-green-50 border-success-500">
                <Statistic 
                  title="In Stock" 
                  value={157}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
              
              <Card size="small" className="bg-yellow-50 border-warning-500">
                <Statistic 
                  title="Low Stock" 
                  value={12}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
              
              <Card size="small" className="bg-red-50 border-error-500">
                <Statistic 
                  title="Out of Stock" 
                  value={3}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
              
              <Card size="small" className="bg-blue-50 border-primary-500">
                <Statistic 
                  title="Total SKUs" 
                  value={172}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Card>
            </div>
            
            <Divider />
            
            <div className="text-right">
              <Button type="primary">Manage Inventory</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SellerDashboard;