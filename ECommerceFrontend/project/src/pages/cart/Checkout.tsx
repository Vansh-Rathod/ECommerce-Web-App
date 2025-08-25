import { useEffect, useState } from "react";
import {
  Card,
  Steps,
  Button,
  Form,
  Input,
  Radio,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  List,
  notification,
  Checkbox,
  message,
  Alert,
  Spin,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  UserCheck,
  Truck as TruckDelivery,
  ThumbsUp,
  X,
  Plus,
} from "lucide-react";
import { ClearCart, GetCart } from "../../services/CartApiHelperService";
import { PlaceOrder } from "../../services/OrderApiHelperService";
import { AddFunds, GetWallet } from "../../services/WalletApiHelperService";
import { useCommon } from "../../context/CommonContext";
import { PaymentDefaultValues, ShippingDefaultValues } from "../../Constants";
import { PaymentData, ShippingData } from "../../Types";

const { Title, Text } = Typography;
const { Step } = Steps;

const Checkout = () => {
  // const { items, totalPrice, clearCart, createOrder } = useCart();
  const { GetTotalCartItems } = useCommon();

  const [cartItems, setCartItems] = useState<any>([]);
  const [totalCartItems, setTotalCartItems] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const [orderData, setOrderData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [shippingForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [addFundsForm] = Form.useForm();

  const [isAddFundsModalVisible, setIsAddFundsModalVisible] = useState(false);

  const navigate = useNavigate();

  // Initial fetch of cart items
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const result = await GetCart();

        if (result.success) {
          setCartItems(result.data.cartItems);
          setTotalCartItems(result.data.cartItems.length);

          // Calculate totals
          const newTotal = result.data.cartItems.reduce(
            (acc: number, item: any) =>
              acc + item.productPrice * item.cartItemQuantity,
            0
          );

          // const newCount = cartItems.reduce((acc: number, item: any) =>
          //   acc + item.cartItemQuantity, 0);

          setTotalPrice(newTotal);
        } else {
          setCartItems([]);
          setTotalCartItems(0);
          setTotalPrice(0);
        }
      } catch (error) {
        message.error("Something went wrong while fetching cart & cart items");
        console.error(
          "Something went wrong while fetching cart & cart items: ",
          error
        );
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, []);

  // Initial fetch of wallet
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const result = await GetWallet();

        if (result.success) {
          setWalletBalance(result.data.balance);
        } else {
          setWalletBalance(0);
        }
      } catch (error) {
        message.error("Something went wrong while fetching wallet");
        console.error("Something went wrong while fetching wallet: ", error);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, []);

  const handleAddFunds = async () => {
    setActionLoading(true);
    try {
      const values = await addFundsForm.validateFields();
      console.log("Values: ", values);

      if (values.amount <= 0 || !values.description) {
        message.error("Please fill the required fields");
        return;
      }

      // Call add funds API
      const result = await AddFunds(values.amount, values.description);
      if (!result.success) {
        message.error(result.error);
        return;
      }
      message.success(result.message);

      setIsAddFundsModalVisible(false);
      addFundsForm.resetFields();

      // Refresh the wallet
      const refreshedWalletBalance = await GetWallet();

      if (!refreshedWalletBalance.success) {
        message.error(refreshedWalletBalance.error);
        setWalletBalance(0);
        return;
      }

      setWalletBalance(refreshedWalletBalance.data.balance);
    } catch (error) {
      console.error("Failed to add funds to wallet: ", error);
      message.error("Failed to add funds to wallet. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddFundsModalVisible(false);
    addFundsForm.resetFields();
  };

  const steps = [
    {
      title: "Shipping",
      icon: <TruckDelivery size={20} />,
    },
    {
      title: "Payment",
      icon: <CreditCard size={20} />,
    },
    {
      title: "Review",
      icon: <UserCheck size={20} />,
    },
    {
      title: "Confirmation",
      icon: <ThumbsUp size={20} />,
    },
  ];

  // Helper function to check if wallet has sufficient balance
  const isWalletBalanceSufficient = () => {
    const shippingCost = 0;
    const taxAmount = 0;
    const orderTotal = totalPrice + shippingCost + taxAmount;

    if (paymentData?.paymentMethod === "wallet") {
      return walletBalance >= orderTotal;
    } else if (paymentData?.paymentMethod === "credit_card") {
      return true;
    }
    return false; // For credit card, always return true
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        const values = await shippingForm.validateFields();
        setShippingData({
          firstName: values.first_name,
          lastName: values.last_name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          address2: values.address2,
          city: values.city,
          state: values.state,
          zip: values.zip,
          country: values.country,
          shippingMethod: values.shipping_method,
        });
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Shipping form validation failed:", error);
      }
    } else if (currentStep === 1) {
      try {
        const values = await paymentForm.validateFields();
        setPaymentData({
          paymentMethod: values.payment_method,
          cardNumber: values.card_number,
          expiry: values.expiry,
          cvv: values.cvv,
          cardName: values.card_name,
        });
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Payment form validation failed:", error);
      }
    } else if (currentStep === 2) {
      // Check wallet balance before placing order
      if (!isWalletBalanceSufficient()) {
        message.error("Insufficient wallet balance to place the order");
        return;
      }

      setLoading(true);
      try {
        const result = await PlaceOrder();
        if (!result.success) {
          message.error(result.error);
        } else {
          setOrderData(result.data);
          message.success(result.message);
          setCurrentStep(currentStep + 1);
        }
      } catch (err: any) {
        console.log("Something went wrong while placing order", err);
        message.error("Something went wrong while placing order");
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 3) {
      ClearCart();
      GetTotalCartItems();
      navigate("/customer/orders");
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
        first_name: ShippingDefaultValues.first_name,
        last_name: ShippingDefaultValues.last_name,
        email: ShippingDefaultValues.email,
        phone: ShippingDefaultValues.phone,
        address: ShippingDefaultValues.address,
        address2: ShippingDefaultValues.address2,
        city: ShippingDefaultValues.city,
        state: ShippingDefaultValues.state,
        zip: ShippingDefaultValues.zip,
        country: ShippingDefaultValues.country,
        shipping_method: ShippingDefaultValues.shipping_method,
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
            rules={[
              { required: true, message: "Please enter your first name" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: "Please enter your last name" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Please enter a valid email" },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[{ required: true, message: "Please enter your phone number" }]}
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
        rules={[{ required: true, message: "Please enter your address" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="address2" label="Apartment, suite, etc. (optional)">
        <Input />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: "Please enter your city" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="state"
            label="State / Province"
            rules={[{ required: true, message: "Please enter your state" }]}
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
            rules={[{ required: true, message: "Please enter your zip code" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: "Please select your country" }]}
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
                  <div className="text-gray-500">
                    Estimated delivery: 5-7 business days
                  </div>
                  <div className="text-primary-500 font-medium">$5.00</div>
                </div>
              </Radio>
            </Card>
            <Card className="w-full">
              <Radio value="express">
                <div>
                  <Text strong>Express Shipping</Text>
                  <div className="text-gray-500">
                    Estimated delivery: 2-3 business days
                  </div>
                  <div className="text-primary-500 font-medium">$15.00</div>
                </div>
              </Radio>
            </Card>
          </Space>
        </Radio.Group>
      </Form.Item>
    </Form>
  );

  const PaymentStep = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
      PaymentDefaultValues.payment_method
    );

    const handlePaymentMethodChange = (e: any) => {
      setSelectedPaymentMethod(e.target.value);
    };

    return (
      <Form
        form={paymentForm}
        layout="vertical"
        initialValues={{
          card_number: PaymentDefaultValues.card_number,
          expiry: PaymentDefaultValues.expiry,
          cvv: PaymentDefaultValues.cvv,
          card_name: PaymentDefaultValues.card_name,
          payment_method: PaymentDefaultValues.payment_method,
        }}
      >
        <div className="mb-4">
          <Title level={4}>Payment Method</Title>
        </div>

        <Form.Item name="payment_method">
          <Radio.Group className="w-full" onChange={handlePaymentMethodChange}>
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
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 text-green-500" size={20} />
                      <div>
                        <Text strong>Pay from Wallet</Text>
                        <div className="text-gray-500">
                          Current balance: ${walletBalance}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<Plus size={16} />}
                      onClick={() => setIsAddFundsModalVisible(true)}
                      loading={actionLoading}
                      disabled={selectedPaymentMethod !== "wallet"}
                      className="ml-4"
                    >
                      Add Funds
                    </Button>
                  </div>
                </Radio>
              </Card>
            </Space>
          </Radio.Group>
        </Form.Item>

        {selectedPaymentMethod === "credit_card" &&  (
          <>
            <div className="mb-4 mt-6">
              <Title level={4}>Card Details</Title>
            </div>

            <Form.Item
              name="card_number"
              label="Card Number"
              rules={[
                {
                  required: selectedPaymentMethod === "credit_card",
                  message: "Please enter your card number",
                },
              ]}
            >
              <Input placeholder="1234 5678 9012 3456" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="expiry"
                  label="Expiration Date"
                  rules={[
                    {
                      required: selectedPaymentMethod === "credit_card",
                      message: "Please enter expiration date",
                    },
                  ]}
                >
                  <Input placeholder="MM/YY" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="cvv"
                  label="CVV"
                  rules={[
                    {
                      required: selectedPaymentMethod === "credit_card",
                      message: "Please enter CVV",
                    },
                  ]}
                >
                  <Input placeholder="123" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="card_name"
              label="Name on Card"
              rules={[
                {
                  required: selectedPaymentMethod === "credit_card",
                  message: "Please enter name on card",
                },
              ]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>

            <Form.Item name="save_card" valuePropName="checked">
              <Checkbox>Save card for future payments</Checkbox>
            </Form.Item>
          </>
        )}
      </Form>
    );
  };

  const ReviewStep = () => {
    // const shipping = shippingForm.getFieldsValue();
    // const payment = paymentForm.getFieldsValue();

    console.log("Shipping Data:", shippingData);
    console.log("Payment Data:", paymentData);

    // const shippingCost = shipping.shipping_method === 'standard' ? 5 : 15;
    // const taxAmount = totalPrice * 0.1;
    // const orderTotal = totalPrice + shippingCost + taxAmount;

    const shippingCost = 0;
    const taxAmount = 0;
    const orderTotal = totalPrice + shippingCost + taxAmount;

    // Check if wallet payment is selected and has insufficient balance
    const isWalletSelected = paymentData?.paymentMethod === "wallet";
    const hasInsufficientBalance =
      isWalletSelected && walletBalance < orderTotal;

    return (
      <div>
        <div className="mb-4">
          <Title level={4}>Order Summary</Title>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={cartItems}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <img
                    src={item.productImageUrl ?? undefined}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                }
                title={item.productName}
                description={`Quantity: ${item.cartItemQuantity}`}
              />
              <div className="text-right">
                <Text strong>
                  ${(item.productPrice * item.cartItemQuantity).toFixed(2)}
                </Text>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        {/* Show insufficient balance warning */}
        {hasInsufficientBalance && (
          <Alert
            message="Insufficient Wallet Balance"
            description={`Your wallet balance ($${walletBalance.toFixed(
              2
            )}) is insufficient for this order ($${orderTotal.toFixed(
              2
            )}). Please choose a different payment method or add funds to your wallet.`}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <div className="mb-4">
          <Title level={4}>Customer Information</Title>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Card size="small" title="Shipping Information" className="h-full">
              <p>
                {shippingData?.firstName || "Not Provided"}{" "}
                {shippingData?.lastName || "Not Provided"}
              </p>
              <p>{shippingData?.address || "Not Provided"}</p>
              {shippingData?.address2 ||
                ("Not Provided" && <p>{shippingData?.address2}</p>)}
              <p>
                {shippingData?.city}, {shippingData?.state} {shippingData?.zip}
              </p>
              <p>{shippingData?.country}</p>
              <p>Email: {shippingData?.email}</p>
              <p>Phone: {shippingData?.phone}</p>
              <p className="mt-2 font-medium">
                Shipping Method:{" "}
                {shippingData?.shippingMethod === "standard"
                  ? "Standard"
                  : shippingData?.shippingMethod === "express"
                  ? "Express"
                  : "Not Provided"}
              </p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Payment Information" className="h-full">
              <p>
                {paymentData?.paymentMethod === "credit_card"
                  ? "Credit/Debit Card"
                  : paymentData?.paymentMethod === "wallet"
                  ? "Wallet Payment"
                  : "Not Provided"}
              </p>
              {paymentData?.paymentMethod === "credit_card" && (
                <>
                  <p>
                    Card Number: **** **** ****{" "}
                    {paymentData?.cardNumber?.slice(-4) || "1234"}
                  </p>
                  <p>Name on Card: {paymentData?.cardName || "Not Provided"}</p>
                </>
              )}
              {paymentData?.paymentMethod === "wallet" && (
                <p>Wallet Balance: ${walletBalance.toFixed(2)}</p>
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
        weekday: "long",
        month: "long",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
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
            <div className="font-medium">{orderData?.orderId}</div>
          </div>
          <div className="mb-2">
            <Text type="secondary">Estimated Delivery:</Text>
            <div className="font-medium">
              {orderData?.estimatedDeliveryTime
                ? formatDeliveryDate(orderData.estimatedDeliveryTime)
                : "Calculating delivery date..."}
            </div>
          </div>
        </div>

        <Text type="secondary">
          We've sent a confirmation email to the provided email address.
        </Text>

        <div className="mt-6">
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/customer/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  };

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
    <Spin spinning={loading} size="large">
      <div className="section">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Title level={3}>Checkout</Title>
            <Text type="secondary">Complete your purchase</Text>
          </div>

          <Button
            type="text"
            icon={<X size={20} />}
            onClick={() => navigate("/cart")}
            className="text-gray-500 hover:text-gray-700"
          />
        </div>

        <Steps current={currentStep} className="mb-8">
          {steps.map((item) => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card bordered={false} className="shadow-lg">
              {renderStepContent()}
            </Card>

            {currentStep < 3 && (
              <div className="mt-6 flex justify-between">
                {currentStep > 0 && <Button onClick={handlePrev}>Back</Button>}
                <Button type="primary" onClick={handleNext} loading={loading}>
                  {currentStep === 2 ? "Place Order" : "Continue"}
                </Button>
              </div>
            )}
          </Col>

          <Col xs={24} lg={8}>
            {currentStep < 3 && (
              <Card
                bordered={false}
                className="shadow-lg"
                title="Order Summary"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={cartItems}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <img
                            src={item.productImageUrl ?? undefined}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        }
                        title={
                          <div className="line-clamp-1">{item.productName}</div>
                        }
                        description={`Qty: ${
                          item.cartItemQuantity
                        } × $${item.productPrice.toFixed(2)}`}
                      />
                      <div>
                        $
                        {(item.productPrice * item.cartItemQuantity).toFixed(2)}
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

      {/* Add the modal component */}
      <Modal
        title="Add Funds to Wallet"
        open={isAddFundsModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={actionLoading}
            onClick={handleAddFunds}
          >
            Add Funds
          </Button>,
        ]}
      >
        <Form
          form={addFundsForm}
          layout="vertical"
          // onFinish={handleAddFunds}
          initialValues={{
            amount: 0,
            description: "",
          }}
        >
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Please enter an amount" },
              {
                validator: (_, value) =>
                  value > 0
                    ? Promise.resolve()
                    : Promise.reject("Amount must be greater than 0"),
              },
            ]}
          >
            <Input
              type="number"
              prefix="$"
              step="0.01"
              min="0.01"
              placeholder="Enter amount to add"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter transaction description (e.g. 'Funds added via credit card')"
              maxLength={100}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Checkout;
