import { useState, useEffect } from 'react';
import { Card, Table, InputNumber, Button, Empty, Typography, Divider, Tooltip, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, useCart } from '../../context/CartContext';

const { Title, Text } = Typography;

const CartPage = () => {
  const { items, totalPrice, clearCart, addItemToCart, removeItemFromCart, fetchCartItems } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch products
    const getCartItems = async () => {
      setLoading(true);
      try {
        await fetchCartItems();
      } catch (error) {
        console.log("Failed to fetch cart items");
      } finally {
        setLoading(false);
      }
    };

    getCartItems();
  }, []);
  
  const columns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: CartItem) => (
        <div className="flex items-center">
          <img 
            src={record.productImageUrl ?? undefined} 
            alt={text} 
            className="w-12 h-12 rounded object-cover mr-4" 
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'productPrice',
      key: 'productPrice',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record: CartItem) => (
        <div className="flex items-center gap-2">
      <Button 
        shape="circle" 
        size="small" 
        onClick={() => removeItemFromCart(record.productId, 1)}
        disabled={record.quantity <= 1}
      >
        -
      </Button>
      <span>{record.quantity}</span>
      <Button 
        shape="circle" 
        size="small" 
        onClick={() => addItemToCart(record.productId)}
      >
        +
      </Button>
    </div>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (record: CartItem) => `$${(record.productPrice * record.quantity).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: CartItem) => (
        <Tooltip title="Remove item">
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={18} />} 
            onClick={() => removeItemFromCart(record.productId, record.quantity)}
          />
        </Tooltip>
      ),
    },
  ];
  
  const handleCheckout = () => {
    if (items.length === 0) {
      notification.warning({
        message: 'Cart is empty',
        description: 'Please add items to your cart before checkout.',
      });
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = async () => {
    await clearCart();
    notification.success({
      message: 'Cart Cleared',
      description: 'All items have been removed from your cart',
    });
  };
  
  return (
    <div className="section">
      <div className="mb-6">
        <Title level={3}>Shopping Cart</Title>
        <Text type="secondary">Review and update your cart before checkout</Text>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card bordered={false} className="shadow-sm">
            {items.length > 0 ? (
              <>
                <Table
                  dataSource={items}
                  columns={columns}
                  pagination={false}
                  rowKey="id"
                />
                <div className="mt-4 flex justify-end">
                  <Button 
                    type="text" 
                    danger 
                    onClick={handleClearCart}
                    icon={<Trash2 size={16} />}
                  >
                    Clear Cart
                  </Button>
                </div>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Your cart is empty"
              >
                <Link to="/customer/products">
                  <Button type="primary" icon={<ShoppingBag size={16} className="mr-1" />}>
                    Go Shopping
                  </Button>
                </Link>
              </Empty>
            )}
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card bordered={false} className="shadow-sm">
            <Title level={4}>Order Summary</Title>
            <Divider />
            
            <div className="flex justify-between mb-2">
              <Text>Subtotal</Text>
              <Text>${totalPrice.toFixed(2)}</Text>
            </div>
            
            <div className="flex justify-between mb-2">
              <Text>Shipping</Text>
              {/* <Text>{totalPrice > 0 ? '$5.00' : '$0.00'}</Text> */}
              <Text>{0}</Text>
            </div>
            
            <div className="flex justify-between mb-2">
              <Text>Tax</Text>
              {/* <Text>${(totalPrice * 0.1).toFixed(2)}</Text> */}
              <Text>${0}</Text>
            </div>
            
            <Divider />
            
            <div className="flex justify-between mb-4">
              <Title level={5}>Total</Title>
              <Title level={5}>
                {/* ${(totalPrice + (totalPrice > 0 ? 5 : 0) + totalPrice * 0.1).toFixed(2)} */}
                ${(totalPrice).toFixed(2)}
              </Title>
            </div>
            
            <Button 
              type="primary" 
              size="large" 
              className="w-full"
              onClick={handleCheckout}
              disabled={items.length === 0}
              icon={<ArrowRight size={16} className="ml-1 float-right" />}
            >
              Proceed to Checkout
            </Button>
            
            <div className="mt-4">
              <Link to="/customer/products">
                <Button type="link" className="p-0">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;