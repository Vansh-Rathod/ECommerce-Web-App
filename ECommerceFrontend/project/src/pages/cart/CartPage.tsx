import { useState, useEffect } from 'react';
import { Card, Table, InputNumber, Button, Empty, Typography, Divider, Tooltip, notification, message, Spin } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { AddProductToCart, ClearCart, GetCart, RemoveProductFromCart } from '../../services/CartApiHelperService';
import { GetProductById } from '../../services/ProductApiHelperService';
import { useCommon } from '../../context/CommonContext';

const { Title, Text } = Typography;

const CartPage = () => {
  // const { items, totalPrice, clearCart, addItemToCart, removeItemFromCart, fetchCartItems } = useCart();
  const { GetTotalCartItems } = useCommon();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<any>([]);
  const [totalCartItems, setTotalCartItems] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const [loading, setLoading] = useState(false);

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
          const newTotal = result.data.cartItems.reduce((acc: number, item: any) =>
            acc + (item.productPrice * item.cartItemQuantity), 0);

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
        console.error("Something went wrong while fetching cart & cart items: ", error);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, []);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      message.error("Cart is empty");
      // notification.warning({
      //   message: 'Cart is empty',
      //   description: 'Please add items to your cart before checkout.',
      // });
      return;
    }
    navigate('/checkout');
  };

  const handleAddToCart = async (productId: any, quantity: number) => {
    setLoading(true);
    const productByIdData = await GetProductById(productId);
    if (!productByIdData.success) {
      message.error(productByIdData.error);
      return;
    }
    if (productByIdData !== null && productByIdData.data !== null) {
      try {
        const result = await AddProductToCart(productId, quantity);
        if (!result.success) {
          message.error(result.error);
          return;
        }
        message.success(result.message);

        GetTotalCartItems(); // Refresh badge in the header

        // Refresh the cart
        const refreshedCart = await GetCart();

        if (!refreshedCart.success) {
          message.error(refreshedCart.error);
          setCartItems([]);
          setTotalCartItems(0);
          setTotalPrice(0);
          return;
        }

        setCartItems(refreshedCart.data.cartItems);
        setTotalCartItems(refreshedCart.data.cartItems.length);

        // Calculate totals
        const newTotal = refreshedCart.data.cartItems.reduce((acc: number, item: any) =>
          acc + (item.productPrice * item.cartItemQuantity), 0);

        // const newCount = cartItems.reduce((acc: number, item: any) => 
        //   acc + item.cartItemQuantity, 0);

        setTotalPrice(newTotal);
      }
      catch (error: any) {
        console.log("Failed to add product to cart: ", error);
        message.success("Failed to add product to cart");
      }
      finally {
        setLoading(false);
      }
    }
    else {
      setLoading(false);
      console.log(productByIdData.error);
      message.error(productByIdData.error);
    }
  }

  const handleRemoveFromCart = async (productId: any, quantity: number) => {
    setLoading(true);
    const productByIdData = await GetProductById(productId);
    if (!productByIdData.success) {
      message.error(productByIdData.error);
      return;
    }
    if (productByIdData !== null && productByIdData.data !== null) {
      try {
        const result = await RemoveProductFromCart(productId, quantity);
        if (!result.success) {
          message.error(result.error);
          return;
        }
        message.success(result.message);

        GetTotalCartItems(); // Refresh badge in the header

        // Refresh the cart
        const refreshedCart = await GetCart();

        if (!refreshedCart.success) {
          message.error(refreshedCart.error);
          setCartItems([]);
          setTotalCartItems(0);
          setTotalPrice(0);
          return;
        }

        setCartItems(refreshedCart.data.cartItems);
        setTotalCartItems(refreshedCart.data.cartItems.length);

        // Calculate totals
        const newTotal = refreshedCart.data.cartItems.reduce((acc: number, item: any) =>
          acc + (item.productPrice * item.cartItemQuantity), 0);

        // const newCount = cartItems.reduce((acc: number, item: any) => 
        //   acc + item.cartItemQuantity, 0);

        setTotalPrice(newTotal);
      }
      catch (error: any) {
        console.log("Failed to remove product from cart: ", error);
        message.success("Failed to remove product from cart");
      }
      finally {
        setLoading(false);
      }
    }
    else {
      setLoading(false);
      console.log(productByIdData.error);
      message.error(productByIdData.error);
    }
  }

  const handleClearCart = async () => {
    setLoading(true);
    try {
      const result = await ClearCart();
      if (!result.success) {
        message.error(result.error);
        return;
      }
      message.success(result.message);
      GetTotalCartItems();  // Refresh badge in the header
      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear cart: ", error);
      message.error("Failed to clear cart. Please try again");
    } finally {
      setLoading(false);
    }
  };



  const columns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (productName: string, record: any) => (
        <div className="flex items-center">
          <img
            src={record.productImageUrl ?? undefined}
            alt={productName}
            className="w-12 h-12 rounded object-cover mr-4"
          />
          <span>{productName}</span>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'productPrice',
      key: 'productPrice',
      render: (productPrice: number) => `$${productPrice.toFixed(2)}`,
    },
    {
      title: 'Quantity',
      key: 'cartItemQuantity',
      render: (record: any) => (
        <div className="flex items-center gap-2">
          <Button
            shape="circle"
            size="small"
            onClick={() => handleRemoveFromCart(record.productId, 1)}
            disabled={record.quantity <= 1}
          >
            -
          </Button>
          <span>{record.cartItemQuantity}</span>
          <Button
            shape="circle"
            size="small"
            onClick={() => handleAddToCart(record.productId, 1)}
          >
            +
          </Button>
        </div>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (record: any) => `$${(record.productPrice * record.cartItemQuantity).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Tooltip title="Remove item">
          <Button
            type="text"
            danger
            icon={<Trash2 size={18} />}
            onClick={() => handleRemoveFromCart(record.productId, record.cartItemQuantity)}
          />
        </Tooltip>
      ),
    },
  ];



  return (
    <div className="section">
      <div className="mb-6">
        <Title level={3}>Shopping Cart</Title>
        <Text type="secondary">Review and update your cart before checkout</Text>
      </div>

      <Spin spinning={loading} size="large">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card bordered={false} className="shadow-lg">
              {cartItems.length > 0 ? (
                <>
                  <Table
                    dataSource={cartItems}
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
            <Card bordered={false} className="shadow-lg">
              <Title level={4}>Order Summary</Title>
              <Divider />

              <div className="flex justify-between mb-2">
                <Text>Subtotal</Text>
                <Text>${totalPrice.toFixed(2)}</Text>
              </div>

              <div className="flex justify-between mb-2">
                <Text>Shipping</Text>
                {/* <Text>{totalPrice > 0 ? '$5.00' : '$0.00'}</Text> */}
                <Text>${0}</Text>
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
                disabled={cartItems.length === 0}
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
      </Spin>
    </div>
  );
};

export default CartPage;