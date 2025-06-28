import { useState } from 'react';
import { 
  Card, Steps, Button, Form, Input, Radio, Space, Divider, 
  Typography, Row, Col, List, notification, Checkbox, 
  message
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { CreditCard, UserCheck, Truck as TruckDelivery, ThumbsUp } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const { Title, Text } = Typography;
const { Step } = Steps;

const Checkout = () => {
  const { items, totalPrice, clearCart, createOrder } = useCart();
  const [orderData, setOrderData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shippingForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const navigate = useNavigate();
  
  const steps = [
    {
      title: 'Shipping',
      icon: <TruckDelivery size={20} />,
    },
    {
      title: 'Payment',
      icon: <CreditCard size={20} />,
    },
    {
      title: 'Review',
      icon: <UserCheck size={20} />,
    },
    {
      title: 'Confirmation',
      icon: <ThumbsUp size={20} />,
    }
  ];
  
  const handleNext = async () => {
    if (currentStep === 0) {
      shippingForm.validateFields().then(() => {
        setCurrentStep(currentStep + 1);
      });
    } else if (currentStep === 1) {
      paymentForm.validateFields().then(() => {
        setCurrentStep(currentStep + 1);
      });
    } else if (currentStep === 2) {
      setLoading(true);
    try {
      const orderResponse = await createOrder();
      if (orderResponse) {
        setOrderData(orderResponse);
        setCurrentStep(currentStep + 1);
      }
    } 
    catch(err: any){
      console.log("Something went wrong while placing order");
      message.error("Something went wrong while placing order");
    }finally {
      setLoading(false);
    }
    } else if (currentStep === 3) {
      clearCart();
      navigate('/customer/dashboard');
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const ShippingStep = () => (
    <Form
      form={shippingForm}
      layout="vertical"
      initialValues={{
        country: 'United States',
        shipping_method: 'standard'
      }}
    >
      <div className="mb-4">
        <Title level={4}>Contact Information</Title>
      </div>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[{ required: true, message: 'Please enter your phone number' }]}
      >
        <Input />
      </Form.Item>
      
      <Divider />
      
      <div className="mb-4">
        <Title level={4}>Shipping Address</Title>
      </div>
      
      <Form.Item
        name="address"
        label="Address"
        rules={[{ required: true, message: 'Please enter your address' }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="address2"
        label="Apartment, suite, etc. (optional)"
      >
        <Input />
      </Form.Item>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please enter your city' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="state"
            label="State / Province"
            rules={[{ required: true, message: 'Please enter your state' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="zip"
            label="Zip / Postal Code"
            rules={[{ required: true, message: 'Please enter your zip code' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select your country' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider />
      
      <div className="mb-4">
        <Title level={4}>Shipping Method</Title>
      </div>
      
      <Form.Item name="shipping_method">
        <Radio.Group className="w-full">
          <Space direction="vertical" className="w-full">
            <Card className="w-full">
              <Radio value="standard">
                <div>
                  <Text strong>Standard Shipping</Text>
                  <div className="text-gray-500">Estimated delivery: 5-7 business days</div>
                  <div className="text-primary-500 font-medium">$5.00</div>
                </div>
              </Radio>
            </Card>
            <Card className="w-full">
              <Radio value="express">
                <div>
                  <Text strong>Express Shipping</Text>
                  <div className="text-gray-500">Estimated delivery: 2-3 business days</div>
                  <div className="text-primary-500 font-medium">$15.00</div>
                </div>
              </Radio>
            </Card>
          </Space>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
  
  const PaymentStep = () => (
    <Form
      form={paymentForm}
      layout="vertical"
      initialValues={{
        payment_method: 'credit_card'
      }}
    >
      <div className="mb-4">
        <Title level={4}>Payment Method</Title>
      </div>
      
      <Form.Item name="payment_method">
        <Radio.Group className="w-full">
          <Space direction="vertical" className="w-full">
            <Card className="w-full">
              <Radio value="credit_card">
                <div className="flex items-center">
                  <CreditCard className="mr-2 text-blue-500" size={20} />
                  <Text strong>Credit / Debit Card</Text>
                </div>
              </Radio>
            </Card>
            <Card className="w-full">
              <Radio value="wallet">
                <div className="flex items-center">
                  <CreditCard className="mr-2 text-green-500" size={20} />
                  <div>
                    <Text strong>Pay from Wallet</Text>
                    <div className="text-gray-500">Current balance: $425.75</div>
                  </div>
                </div>
              </Radio>
            </Card>
          </Space>
        </Radio.Group>
      </Form.Item>
      
      <div className="mb-4 mt-6">
        <Title level={4}>Card Details</Title>
      </div>
      
      <Form.Item
        name="card_number"
        label="Card Number"
        rules={[{ required: true, message: 'Please enter your card number' }]}
      >
        <Input placeholder="1234 5678 9012 3456" />
      </Form.Item>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="expiry"
            label="Expiration Date"
            rules={[{ required: true, message: 'Please enter expiration date' }]}
          >
            <Input placeholder="MM/YY" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="cvv"
            label="CVV"
            rules={[{ required: true, message: 'Please enter CVV' }]}
          >
            <Input placeholder="123" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="card_name"
        label="Name on Card"
        rules={[{ required: true, message: 'Please enter name on card' }]}
      >
        <Input placeholder="John Doe" />
      </Form.Item>
      
      <Form.Item name="save_card" valuePropName="checked">
        <Checkbox>Save card for future payments</Checkbox>
      </Form.Item>
    </Form>
  );
  
  const ReviewStep = () => {
    const shipping = shippingForm.getFieldsValue();
    const payment = paymentForm.getFieldsValue();
    
    // const shippingCost = shipping.shipping_method === 'standard' ? 5 : 15;
    // const taxAmount = totalPrice * 0.1;
    // const orderTotal = totalPrice + shippingCost + taxAmount;

    const shippingCost = 0;
    const taxAmount = 0;
    const orderTotal = totalPrice + shippingCost + taxAmount;
    
    return (
      <div>
        <div className="mb-4">
          <Title level={4}>Order Summary</Title>
        </div>
        
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<img src={item.productImageUrl ?? undefined} alt={item.productName} className="w-16 h-16 object-cover rounded" />}
                title={item.productName}
                description={`Quantity: ${item.quantity}`}
              />
              <div className="text-right">
                <Text strong>${(item.productPrice * item.quantity).toFixed(2)}</Text>
              </div>
            </List.Item>
          )}
        />
        
        <Divider />
        
        <div className="mb-4">
          <Title level={4}>Customer Information</Title>
        </div>
        
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Card size="small" title="Shipping Information" className="h-full">
              <p>{shipping.first_name} {shipping.last_name}</p>
              <p>{shipping.address}</p>
              {shipping.address2 && <p>{shipping.address2}</p>}
              <p>{shipping.city}, {shipping.state} {shipping.zip}</p>
              <p>{shipping.country}</p>
              <p>Email: {shipping.email}</p>
              <p>Phone: {shipping.phone}</p>
              <p className="mt-2 font-medium">
                Shipping Method: {shipping.shipping_method === 'standard' ? 'Standard' : 'Express'}
              </p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Payment Information" className="h-full">
              <p>
                {payment.payment_method === 'credit_card' 
                  ? 'Credit/Debit Card' 
                  : 'Wallet Payment'
                }
              </p>
              {payment.payment_method === 'credit_card' && (
                <>
                  <p>Card Number: **** **** **** {payment.card_number?.slice(-4) || '1234'}</p>
                  <p>Name on Card: {payment.card_name}</p>
                </>
              )}
            </Card>
          </Col>
        </Row>
        
        <Card size="small" title="Order Details">
          <div className="flex justify-between mb-2">
            <Text>Subtotal</Text>
            <Text>${totalPrice.toFixed(2)}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text>Shipping</Text>
            <Text>${shippingCost.toFixed(2)}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text>Tax</Text>
            <Text>${taxAmount.toFixed(2)}</Text>
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between">
            <Text strong>Total</Text>
            <Text strong>${orderTotal.toFixed(2)}</Text>
          </div>
        </Card>
      </div>
    );
  };
  
  const ConfirmationStep = ({ orderData }: { orderData: any }) => {

    const navigate = useNavigate();

  // Format the estimated delivery date
  const formatDeliveryDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-500/20 text-success-500 mb-4">
        <ThumbsUp size={32} />
      </div>
      <Title level={3}>Thank You for Your Order!</Title>
      <Text>Your order has been placed successfully.</Text>
      
      <div className="bg-gray-50 p-4 rounded-lg my-6 text-left">
        <div className="mb-2">
          <Text type="secondary">Order ID:</Text>
          <div className="font-medium">{orderData?.OrderId}</div>
        </div>
        <div className="mb-2">
          <Text type="secondary">Estimated Delivery:</Text>
          <div className="font-medium">
          {orderData?.EstimatedDeliveryTime ? 
              formatDeliveryDate(orderData.EstimatedDeliveryTime) : 
              'Calculating delivery date...'}
          </div>
        </div>
      </div>
      
      <Text type="secondary">
        We've sent a confirmation email to the provided email address.
      </Text>
      
      <div className="mt-6">
        <Button type="primary" size="large" onClick={() => navigate('/customer/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )};
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ShippingStep />;
      case 1:
        return <PaymentStep />;
      case 2:
        return <ReviewStep />;
      case 3:
        return <ConfirmationStep orderData={orderData} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="section">
      <div className="mb-6">
        <Title level={3}>Checkout</Title>
        <Text type="secondary">Complete your purchase</Text>
      </div>
      
      <Steps current={currentStep} className="mb-8">
        {steps.map(item => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm">
            {renderStepContent()}
          </Card>
          
          {currentStep < 3 && (
            <div className="mt-6 flex justify-between">
              {currentStep > 0 && (
                <Button onClick={handlePrev}>
                  Back
                </Button>
              )}
              <Button
                type="primary"
                onClick={handleNext}
                loading={loading}
              >
                {currentStep === 2 ? 'Place Order' : 'Continue'}
              </Button>
            </div>
          )}
        </Col>
        
        <Col xs={24} lg={8}>
          {currentStep < 3 && (
            <Card bordered={false} className="shadow-sm" title="Order Summary">
              <List
                itemLayout="horizontal"
                dataSource={items}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<img src={item.productImageUrl ?? undefined} alt={item.productName} className="w-12 h-12 object-cover rounded" />}
                      title={<div className="line-clamp-1">{item.productName}</div>}
                      description={`Qty: ${item.quantity} × $${item.productPrice.toFixed(2)}`}
                    />
                    <div>
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </div>
                  </List.Item>
                )}
              />
              
              <Divider className="my-3" />
              
              <div className="flex justify-between mb-2">
                <Text>Subtotal</Text>
                <Text>${totalPrice.toFixed(2)}</Text>
              </div>
              
              <div className="flex justify-between mb-2">
                <Text>Shipping</Text>
                <Text>Calculated at next step</Text>
              </div>
              
              <div className="flex justify-between mb-2">
                <Text>Tax</Text>
                {/* <Text>${(totalPrice * 0.1).toFixed(2)}</Text> */}
                <Text>${0}</Text>
              </div>
              
              <Divider className="my-3" />
              
              <div className="flex justify-between">
                <Text strong>Estimated Total</Text>
                {/* <Text strong>${(totalPrice + totalPrice * 0.1).toFixed(2)}+</Text> */}
                <Text strong>${(totalPrice + 0).toFixed(2)}+</Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;